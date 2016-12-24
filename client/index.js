import auth_plugin from './auth';

exports.register = (server, options, next) => {
    // Define our auth scheme
    server.auth.scheme('okauth', auth_plugin);

    // Register as default strategy
    server.auth.strategy('auth', 'okauth', 'required', options);

    // Enforce roles, if options provided
    if (options.acl) {
        server.register({
            register: require('hapi-rbac'),
            options: options.acl,
        }, function (err) {
            if (err) throw err;
            next();
        });
    }
    else
        next();

    // Go on
    next();
};

exports.register.attributes = {
    pkg: {
        name: 'OkAuth',
        version: '0.0.0',
    }
};