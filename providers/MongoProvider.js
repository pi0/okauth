import BaseProvider, {WrongUsernameOrPasswordError} from './BaseProvider';

export default class MongoProvider extends BaseProvider {

    constructor(name, options) {
        super(name, options);

        this.db = global.mongo.connections[options.database];
        this.users = this.db.collection('users');
    }

    async login(creds) {
        // Find user
        let query = {};
        query[this.options.user_field] = creds.username;
        let user = await this.users.findOne(query);
        if (!user) throw WrongUsernameOrPasswordError(creds.username);

        // Validate creds
        let isValid = await this._check_password(creds.password, user[this.options.password_field]);
        if (!isValid) throw WrongUsernameOrPasswordError(creds.username);

        // Return user
        let {_id, ...profile}=user;
        return {
            user_id: _id,
            ...profile
        };
    }

    // // TODO
    // async create(user) {
    //     // Check user existence
    //     let query = {};
    //     query[this.options.user_field] = user.username/*TODO*/;
    //     let withSameMail = await this.users.findOne(query);
    //     if (withSameMail) return callback(new Error('The user already exists'));
    //
    //     user.password = await this.hash(user.password);
    //
    //     return await this.users.insert(user);
    // }
    //
    // // TODO
    // verify(email, callback) {
    //     let query = {email: email, email_verified: false};
    //     this.users.update(query, {$set: {email_verified: true}}, function (err, count) {
    //         if (err) return callback(err);
    //         callback(null, count > 0);
    //     });
    // }
    //
    // // TODO
    // changePassword(email, newPassword, callback) {
    //     Bcrypt.hash(newPassword, null, function (err, hash) {
    //         if (err) {
    //             callback(err);
    //         } else {
    //             this.users.update({email: email}, {$set: {password: hash}}, function (err, count) {
    //                 if (err) return callback(err);
    //                 callback(null, count > 0);
    //             });
    //         }
    //     });
    // }
    //
    // // TODO
    // remove(id, callback) {
    //     this.users.remove({_id: id}, function (err) {
    //         if (err) return callback(err);
    //         callback(null);
    //     });
    // }

}
;