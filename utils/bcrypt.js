import Bcrypt from 'bcryptjs';

export async function hash(data) {
    return new Promise((resolve, reject) => {
        Bcrypt.genSalt(10, function (err, salt) {
            if (err) return reject(err);
            Bcrypt.hash(data, salt, function (err, hash) {
                if (err) return reject(err);
                resolve(hash);
            });
        });
    });
}

export async function compare(data, hash) {
    return new Promise((resolve, reject) => {
        Bcrypt.compare(data, hash, (err, isValid) => {
            if (err) return reject(err);
            return resolve(isValid);
        });
    });
}
