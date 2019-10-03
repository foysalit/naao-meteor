import { check } from 'meteor/check';
import SimpleSchema from 'simpl-schema';
import { publishComposite } from 'meteor/reywood:publish-composite';

import { getMessages } from '../api';
import { Users } from '../../users/collection';
import { findProfilePic } from '../../images/api';
import { Parcels } from '../../parcels/collection';

publishComposite('messages.list', function (filters = {}) {
    const filterSchema = new SimpleSchema({
        parcelId: { type: String }
    }, {check});

    filters = filterSchema.clean(filters);
    filterSchema.validate(filters);

    if (!this.userId)
        return this.ready();

    const parcel = Parcels.findOne({ $or: [{ ownerId: this.userId }, { travelerId: this.userId }]});

    if (!parcel) {
        // throw new Meteor.Error("unauthorized", "You do not have permission to chat here");
        return this.ready();
    }

    return {
        find() {
            return getMessages(filters);
        },
        children: [{
            find(message) {
                return Users.find({ _id: {$in: [parcel.ownerId, parcel.travelerId]} }, {
                    fields: {
                        _id: 1,
                        isMessaging: 1,
                        'profile.city': 1,
                        'profile.name': 1,
                    }
                });
            },
            children: [{
                find(user) {
                    return findProfilePic(user._id);
                }
            }]
        }]
    };
});