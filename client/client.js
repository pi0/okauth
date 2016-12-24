import {oauth_ro, user_info, validate} from '../lib/authentication';

export default class AuthClient {

    constructor({client_id, connection}) {
        this.client_id = client_id;
        this.connection = connection;
    }

    async login(creds) {
        try {
            return await oauth_ro({
                client_id: this.client_id,
                connection: this.connection,
                ...creds
            });
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async user(token) {
        try {
            return await user_info(token, this.client_id);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async validate(token) {
        try {
            return await validate(token, this.client_id);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

}

