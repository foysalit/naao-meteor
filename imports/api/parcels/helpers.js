import { Users } from "../users/collection";
import { Trips } from "../trips/collection";

export const ParcelHelpers = {
    owner () {
        return Users.findOne(this.ownerId);
    },
    trip () {
        return Trips.findOne(this.tripId);
    },
};