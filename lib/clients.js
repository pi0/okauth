import Config from 'config';

const clients = Config.get('okauth.clients');

//
function get_client(client_id, connection) {
    if (!client_id) client_id = 'default';
    let _client = clients[client_id];
    if (!_client) throw {error: 'invalid client'};

    if (connection)
        if (_client.connections.indexOf(connection) === -1) throw {error: 'connection not accepted by client'};

    return _client;
}

export default get_client;