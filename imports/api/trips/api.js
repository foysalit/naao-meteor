import { Parcels } from "../parcels/collection";

export const findParcelsInTrip = (trip) => {
    return Parcels.find({tripId: trip._id});
};

export const findParcelInTripByOwner = (trip, owner) => {
    return Parcels.findOne({tripId: trip._id, ownerId: owner._id});
};