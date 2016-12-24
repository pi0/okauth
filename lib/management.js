import User from '../models/User';
import {compare, hash} from '../utils/bcrypt';

const UNIQUE_FIELDS = ['username', 'email', 'user_id'];

export async function save_user({connection, user}) {
    let user_id = user.user_id + '';
    delete user.user_id;

    let _user = await User.findOne({identities: {$elemMatch: {connection, user_id}}});

    if (_user) {
        _user.identities[0].profileData = user;
        _user.markModified('identities');
        await _user.save();
        return _user;
    }

    _user = new User();
    _user.identities = [
        {
            connection,
            user_id: user_id,
            profileData: user,
        },
    ];

    await _user.save();
    return _user;
}

// export async function find_user({client_id, fields, auth}) {
//     if (!client_id) throw {error: 'no client_id'};
//
//     let query = {client_id, $or: []};
//     UNIQUE_FIELDS.forEach((field) => {
//         if (fields[field] && fields[field].length > 0) {
//             let q = {};
//             q[field] = fields[field];
//             query.$or.push(q);
//         }
//     });
//
//     let user = await User.findOne(query);
//     if (!user)return null;
//
//     if (auth) {
//         if (!fields.password || fields.password.length == 0)
//             throw {error: 'No password provided'};
//         let valid = await compare(fields.password, user.password);
//         if (!valid) return null;
//         return user;
//     }
//
//     return user;
// }
