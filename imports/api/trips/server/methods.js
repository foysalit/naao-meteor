import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

import { Trips } from '../collection';
import { TripSchema } from '../schema';
import { findCoordsByPlaceId } from "../../utils/location-api";

Meteor.methods({
    'trips.create': function (data) {
        check(this.userId, String);

        const tripData = TripSchema.clean({
            ...data,
            isPublished: true,
            travelerId: this.userId,
            availableSpace: data.totalSpace,
        });

        // from the mobile app, only place_id comes through, so we find the coords from that and attach it to the entry
        if (tripData.from && tripData.from.place_id && !tripData.from.coordinates) {
            const coords = findCoordsByPlaceId(tripData.from.place_id);

            if (coords) {
                tripData.from.coordinates = [coords.lng, coords.lat];
            }
        }

        if (tripData.to && tripData.to.place_id && !tripData.to.coordinates) {
            const coords = findCoordsByPlaceId(tripData.to.place_id);

            if (coords) {
                tripData.to.coordinates = [coords.lng, coords.lat];
            }
        }

        TripSchema.validate(tripData);
        const _id = Trips.insert(tripData);

        return { _id, ...tripData };
    },
    'trips.favorite': function (tripId) {
        const trip = Trips.findOne(tripId);

        if (!trip || !this.userId) {
            throw new Meteor.Error('unauthorized', 'You have to be logged in to favorite trips');
        }

        if (trip.favoritedBy && trip.favoritedBy.indexOf(this.userId) >= 0) {
            return Trips.update(tripId, { $pull: { favoritedBy: this.userId }});
        } else {
            return Trips.update(tripId, { $addToSet: { favoritedBy: this.userId }});
        }
    }
});