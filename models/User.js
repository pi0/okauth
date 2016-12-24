import {Model} from '../../bak/modules/mongoose';
import {url} from '../../bak/modules/minio';

class User extends Model {

    static $hidden = [
        '_id', 'identities', 'avatar_etag', 'is_banned', 'app_metadata',
        'user_metadata', 'email', 'updated_at', 'created_at'
    ];

    // static $options = {strict: false};

    static $schema = {
        app_metadata: {type: Object, default: {}},
        user_metadata: {type: Object, default: {}},
        is_banned: {type: Boolean},
        avatar_etag: {type: String},
        identities: {type: Object},
    };

    _resolve(field) {
        return this.identities[0].profileData[field];
    }

    get email() {
        return this._resolve('email');
    }

    get family_name() {
        return this._resolve('family_name');
    }

    get given_name() {
        return this._resolve('given_name');
    }

    get avatar() {
        if (this.avatar_etag)
            return url('avatar', this._id + '.webp', this.avatar_etag, 'image/webp');
    }

    static get $connection() {
        return global.mongo.connections.default;
    }
}

export default User.$model;