import Boom from "boom";
import Hoek from "hoek";
import Joi from "joi";

// Based on https://github.com/johnbrett/hapi-auth-bearer-token

const defaults = {
    accessTokenName: 'token',
    allowQueryToken: true,
    allowCookieToken: true,
    tokenType: 'Bearer',
    client_id: 'default',
    client_secret: 'default',
    connection: 'default',
};

const schema = Joi.object().keys({
    accessTokenName: Joi.string().required(),
    allowQueryToken: Joi.boolean(),
    allowCookieToken: Joi.boolean(),
    tokenType: Joi.string().required(),
    client_id: Joi.string(),
    client_secret: Joi.string(),
    connection: Joi.string(),
}).unknown(true);

const plugin = (server, options) => {

    Hoek.assert(options, 'Missing bearer auth strategy options');

    const settings = Hoek.applyToDefaults(defaults, options);

    Joi.assert(settings, schema);

    let AuthClient = require('./client').default;// Lazy better!
    const authClient = new AuthClient(settings);

    const authenticate = (request, reply) => {
        try {
            // Use headers by default
            let authorization = request.raw.req.headers.authorization;

            // Fallback 1 : Check for cookies
            if (settings.allowCookieToken
                && !authorization
                && request.state[settings.accessTokenName]) {
                authorization = settings.tokenType + ' ' + request.state[settings.accessTokenName];

            }

            // Fallback 2 : URL Query
            if (settings.allowQueryToken
                && !authorization
                && request.query[settings.accessTokenName]) {
                authorization = settings.tokenType + ' ' + request.query[settings.accessTokenName];
                delete request.query[settings.accessTokenName];
            }

            // Fallback 3: Throw Error
            if (!authorization) {
                return reply(Boom.unauthorized(null, settings.tokenType));
            }

            // Try to parse headers
            const parts = authorization.split(/\s+/);

            // Ensure correct token type
            if (parts[0].toLowerCase() !== settings.tokenType.toLowerCase()) {
                return reply(Boom.unauthorized(null, settings.tokenType));
            }

            // Now check real token
            const token = parts[1];

            // Get user from auth client
            authClient.user(token).then(credentials => {
                if (!credentials) {
                    return reply(Boom.badRequest(),
                        {credentials, log: {tags: ['auth', 'bearer'], data: token}});
                }

                return reply.continue({
                    credentials,
                    // artifacts: null,
                });
            });
        } catch (e) {
            console.error(e);
            reply(Boom.internal());
        }
    };

    return {authenticate};
};

export default plugin;