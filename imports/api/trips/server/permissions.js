import { Trips } from '../collection';

Trips.allow({
    insert: (userId, trip) => {
        return userId && trip.travelerId === userId;
    },
    update: (userId, trip) => {
        return userId && trip.travelerId === userId;
    },
    remove: () => {
        return false;
    }
});