import { Users } from "../users/collection";
import { findParcelInTripByOwner, findParcelsInTrip } from "./api";

export const TripHelpers = {
    traveler () {
        return Users.findOne(this.travelerId);
    },
    parcels () {
        return findParcelsInTrip(this).fetch();
    },
    parcelByUser (owner) {
        return findParcelInTripByOwner(this, owner);
    }
};