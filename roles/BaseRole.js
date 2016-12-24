export default class BaseRole {

    constructor(opts) {
        this.opts = opts || {};
    }

    apply(user, context, callback) {
        // TODO: implement your rule
        callback(null, user, context);
    }

}