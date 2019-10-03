import { publishComposite } from 'meteor/reywood:publish-composite';

import { Users } from '../../users/collection';
import { Images } from '../../images/collection';

publishComposite('users.me', function () {
    if (!this.userId)
        return this.ready();

    return {
        find() {
            return Users.find({_id: this.userId});
        },
        children: [{
            find(user) {
                return Images.find({ 'meta.module': 'user', 'meta.parentId': user._id }).cursor;
            }
        }]
    };
});