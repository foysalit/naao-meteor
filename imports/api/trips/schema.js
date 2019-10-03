import { Tracker } from 'meteor/tracker';
import SimpleSchema from 'simpl-schema';
import moment from 'moment';

import { LocationSchema } from '../utils/location-schema';
import { ParcelSizeSchema } from '../parcels/schema';

export const TripSchema = new SimpleSchema({
    collectBy: {
        type: Date,
        min: function () {
            return new Date();
        }
    },
    deliveryBy: {
        type: Date,
        min: function () {
            return moment().add(1, 'day').toDate();
        }
    },
    from: {
        type: LocationSchema,
        index: '2dsphere',
    },
    to: {
        type: LocationSchema,
        index: '2dsphere',
    },
    totalSpace: {
        type: ParcelSizeSchema,
    },
    // gets calculated on the fly when new bookings are made
    availableSpace: {
        type: ParcelSizeSchema,
        optional: true,
    },
    isPublished: {
        type: Boolean,
        optional: true,
        defaultValue: true,
    },
    favoritedBy: {
        type: Array,
        optional: true,
    },
    'favoritedBy.$': {
        type: SimpleSchema.RegEx.Id
    },
    travelerId: {
        type: String,
        optional: true,
    },
    createdAt: {
        type: Date,
        optional: true,
        autoValue: function () {
            return new Date();
        }
    }
}, { tracker: Tracker });