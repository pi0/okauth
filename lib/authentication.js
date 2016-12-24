import get_connection from './connections';
import get_client from './clients';
import {save_user} from './management';
import {sign, decode, verify} from '../utils/jwt';
import User from '../models/User';

export async function oauth_ro({connection, client_id, ...creds}) {
    let _connection = get_connection(connection);
    let _client = get_client(client_id, connection);

    //
    let user = await _connection.login(creds);

    // Save User
    let _user = await save_user({connection, user});

    // Create signed token
    let signed_token = await sign({
        s: _user._id,
    }, _client.client_secret);

    // https://auth0.com/docs/api/authentication
    // https://developers.google.com/identity/sign-in/web/backend-auth
    // https://github.com/IdentityServer/IdentityServer3/issues/2015
    return {
        id_token: signed_token, // OpenID, Public
        //access_token: null,   // OAuth 2, Private
        token_type: 'bearer',
    };
}


export async function validate(token, client_id) {
    // Verify token
    let _client = get_client(client_id);
    let decoded = await verify(token, _client.client_secret);
    if (!decoded) return false;

    return decoded.s;
}

export async function user_info(token, client_id) {
    // Validate and extract id
    let _id = await validate(token, client_id);
    if (!_id) throw {error: 'Invalid token'};

    // Find User
    let user = await User.findById(_id);
    if (!user) throw {error: 'User not found'};

    return user;
}