import Model from 'bak/modules/mongoose/model';

class User extends Model {
    static $options = {strict: false};
    static $hidden = ['password'];

}

export default User.$model;
