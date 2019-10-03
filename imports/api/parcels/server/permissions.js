import { _ } from 'meteor/underscore';

import { Parcels } from '../collection';

Parcels.allow({
    insert: (userId, trip) => {
        return false;
    },
    update: (userId, parcel, fields) => {
        // only traveler can change counter offer
        if (_.intersection(fields, ['counterOffer', 'counterOfferAt']).length > 0)
            return parcel.travelerId === userId;

        if (_.intersection(fields, ['isAccepted', 'isRejected', 'closedAt']).length > 0)
            return parcel.travelerId === userId || parcel.ownerId;
        
        return false;
    },
    remove: () => {
        return false;
    },

    fetch: ['ownerId', 'travelerId'],
});