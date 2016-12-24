import Joi from 'joi';
import Boom from 'boom';
import {oauth_ro, user_info} from '../../lib/authentication';
import {Controller, get, post, validate} from 'bak/modules/controller'

/**
 * Authentication API
 * https://auth0.com/docs/api/authentication
 */
export default class AuthenticationController extends Controller {

    constructor() {
        super(null, {auth: false});
    }

    /**
     * Given the user credentials and the connection specified,
     * it will do the authentication on the provider and return a JSON with the access_token and id_token
     */
    @post('/oauth/ro')
    @validate({
        payload: Joi.object({
            client_id: Joi.string().required(),
            connection: Joi.string().required(),
            username: Joi.string().required(),
            password: Joi.string().required(),
        }).options({allowUnknown: true})
    })
    async oauth_ro(request, reply) {
        try {
            let status = await oauth_ro(request.payload);
            reply(status);
        } catch (e) {
            console.error(e);
            reply(Boom.unauthorized(e.error));
        }
    }

    /**
     * Returns the user information based on the Auth0 access token (obtained during login).
     */
    @get('/userinfo')
    @validate({
        headers: Joi.object({
            authorization: Joi.string().required(),
            client_id: Joi.string().required(),
        }).options({allowUnknown: true})
    })
    async userinfo(request, reply) {
        try {
            //
            let token = request.payload ? request.payload.token + '' : null;
            if (!token) {
                if (!request.headers.authorization) throw {error: 'Authorization header required'};
                token = request.headers.authorization.split('Bearer ')[1];
                if (!token || token.length == 0) throw {error: 'Invalid Authorization'};
            }

            //
            let client_id = request.headers.client_id;

            //
            let user = await user_info(token, client_id);

            //
            reply(user);
        } catch (e) {
            console.error(e);
            reply(Boom.unauthorized(e.error));
        }
    }
}

module.exports = new AuthenticationController().routes;