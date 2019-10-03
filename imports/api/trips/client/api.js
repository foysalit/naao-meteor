import { Session } from "meteor/session";

const tempTrip = 'trip.temp';

export const getTempTrip = () => {
    return Session.get(tempTrip);
};

export const setTempTrip = (trip) => {
    return Session.set(tempTrip, trip);
};

export const deleteTempTrip = () => {
    return Session.delete(tempTrip);
};