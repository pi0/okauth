import Config from 'config';

function loadProvider(provider) {
    switch (provider) {
        case 'mongo':
            return require('../providers/MongoProvider').default;
        default:
            return require('../providers/BaseProvider').default;
    }
}

// Load connections
const connections = {};
let _connections = Config.get('okauth.connections');
Object.keys(_connections).forEach((name) => {
    let config = _connections[name];
    let Provider = loadProvider(config.provider);
    connections[name] = new Provider(name, config.options);
});

//
function get_connection(connection) {
    if (!connection) connection = 'default';
    let _connection = connections[connection];
    if (!_connection) throw {error: 'invalid connection'};
    return _connection;
}

export default get_connection;
