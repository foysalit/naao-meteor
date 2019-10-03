import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';

import { ParcelSchema } from './schema';
import { ParcelHelpers } from './helpers';
import { Trips } from '../trips/collection';

class ParcelsCollection extends Mongo.Collection {
    update(selector, modifier) {
        const result = super.update(selector, modifier);

        if (Meteor.isServer && _.has(modifier, '$set')) {
            const message = {};

            if (_.has(modifier.$set, 'isAccepted')) {
                message.text = `Automatic Message: Glad to accept your offer! Please let me know if you have any additional info to help deliver the parcel.`;

                const { size, tripId } = super.findOne(selector._id);
                Trips.update(tripId, { $inc: { 
                    'availableSpace.len': -size.len, 'availableSpace.width': -size.width, 
                    'availableSpace.height': -size.height, 'availableSpace.weight': -size.weight } 
                });
            }

            if (_.has(modifier.$set, 'isRejected')) {
                message.text = `Automatic Message: Sorry can't accept the terms of this offer.`;
            }

            if (_.has(modifier.$set, 'counterOffer')) {
                message.text = `Automatic Message: I have a counter offer for you. How does ${modifier.$set.counterOffer} sound?`;
            }

            if (_.has(modifier.$set, 'ownerReview')) {
                message.text = `Automatic Message: ${modifier.$set.ownerReview}`;
            }

            if (_.has(modifier.$set, 'travelerReview')) {
                message.text = `Automatic Message: ${modifier.$set.travelerReview}`;
            }

            if (_.has(modifier.$set, 'deliveredAt')) {
                message.text = `Automatic Message: Parcel has been delivered.`;
            }

            if (message.text)
                Meteor.call('messages.create', selector._id, message);
        }

        return result;
    }
};

export const Parcels = new ParcelsCollection('parcels');

Parcels.helpers(ParcelHelpers);
Parcels.attachSchema(ParcelSchema);