import Boom from 'boom';
import {Controller, get, post, validate, config} from 'bak/modules/controller';
import {Issuer} from 'openid-client';
import User from '../models/user';
import {hash_verify, jwt_sign} from '../utils/security';
import Sharp from 'sharp';
import {upload} from 'bak/modules/minio';

class AuthController extends Controller {

    constructor(options) {
        super('/api/auth', {auth: false});
        this.auth_options = options;

        // if (this.auth_options.client)
        //     this.init_client().catch(e => {
        //         if (e) console.error(e);
        //     });
    }

    async init_client() {
        const issuer = await Issuer.discover(this.auth_options.client.discover_url);
        this.client = new issuer.Client(this.auth_options.client);
    }

    @post('/login')
    async login(request, reply) {
        let {username, password} = request.payload;

        // Prefix username
        if (this.auth_options.username_prefix &&
            username.indexOf(this.auth_options.username_prefix) === -1)
            username += this.auth_options.username_prefix;

        // Find user
        let user = await (User.findOne({email: username}));
        if (!user) return reply(Boom.unauthorized("User not found"));

        // Check password
        let verified = await hash_verify(password, user.get('password'));
        if (verified !== true) return reply(Boom.unauthorized("Invalid credentials"));

        // Sign token
        let id_token = await jwt_sign({s: user._id}, this.auth_options.client.client_secret);

        return reply({id_token});
    }

    @get('/oauth/login')
    oauth_login(request, reply) {
        if (!this.client) return reply(Boom.serverUnavailable("oauth"));

        let opts = {
            redirect_uri: this.auth_options.redirect_uri,
            scope: 'profile email phone'
        };

        reply(this.client.authorizationPost(opts));
    }

    @get('/oauth/callback')
    async oauth_callback(request, reply) {
        if (!this.client) return reply(Boom.serverUnavailable("oauth"));

        console.log("Callback");
        let tokenSet = await this.client.authorizationCallback(this.auth_options.redirect_uri, request.query);
        console.log('received and validated tokens %j', tokenSet);
        console.log('validated id_token claims %j', tokenSet.claims);

        reply(this.client.authorizationPost(opts));
    }

    @get('/profile')
    @config({
        auth: {mode: 'required'},
    })
    async profile(request, reply) {
        reply({
            profile: request.auth.credentials
        });
    }

    @post('/profile')
    @config({
        auth: {mode: 'required'},
        payload: {
            maxBytes: 1048576 * 16,
        }
    })
    async update_profile(request, reply) {
        let user = await request.auth.artifacts();

        // Upload profile photo
        let avatar = request.payload.avatar;

        if (avatar instanceof Buffer) {
            let img = await Sharp(avatar).resize(128, 128).webp({quality: 100}).toBuffer();

            console.log("Uploading avatar for " + user._id);

            user.avatar_etag = await upload('avatar', user._id + '.webp', img);

            await user.save();

            console.log("Upload done!");
        }

        reply({user});
    }


}

export default AuthController;