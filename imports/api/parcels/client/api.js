import { Session } from "meteor/session";

const tempParcel = 'parcel.temp';

export const getTempParcel = () => {
    return Session.get(tempParcel);
};

export const setTempParcel = (parcel) => {
    return Session.set(tempParcel, parcel);
};

export const deleteTempParcel = () => {
    return Session.delete(tempParcel);
};