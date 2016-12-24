import Joi from 'joi';
import Boom from 'boom';
import {get, post, put, patch, validate, controller} from 'hapi-decorators'
import Managment from '../../lib/management';

/**
 * User API v2
 * https://auth0.com/docs/api/management/v2#!/Users/
 */
@controller('/users')
class UsersController {


    // /**
    //  * List or search users
    //  */
    // @get('/')
    // async get_users(request, reply) {
    //     try {
    //         let users = await User.find({});
    //         reply(users);
    //     } catch (e) {
    //         console.error(e);
    //     }
    // }

    /**
     * Create a user
     */
    @post('/')
    @validate({
        payload: Joi.object({
            connection: Joi.string(), // The connection the user belongs to
        }).options({allowUnknown: true})
    })
    async post_users(request, reply) {
        let payload = request.payload;
        let {connection, ...profileData}=payload;
        try {
            let user = await Managment.save_user(connection, profileData, {
                upsert: true,
                password: request.payload.password,
            });
            reply(user);
        } catch (e) {
            console.error(e);
            reply(Boom.internal());
        }
    }

    /**
     * Get a user
     */
    @get('/{id}')

    async get_users_by_id(request, reply) {
        let user_id = request.params.user_id;
        let user = await Managment.find_user(user_id);
        reply(user);
    }

    // /**
    //  * Delete a user
    //  */
    // @del('/{id}')
    // delete_users_by_id(request, reply) {
    //
    // }
    //
    // /**
    //  * Update a user
    //  */
    // @patch('/{id}')
    // patch_users_by_id(request, reply) {
    //
    // }


}

module.exports = new UsersController().routes();
