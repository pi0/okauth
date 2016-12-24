import JWT from 'jsonwebtoken';

export async function sign(message, key) {
    return JWT.sign(message, key);
}

export async function decode(message) {
    return JWT.decode(message);
}

export async function verify(message, key) {
    return new Promise((resolve, reject) => {
        JWT.verify(message, key, (err, data) => {
            if (err)return resolve(false);
            resolve(data);
        });
    });
}