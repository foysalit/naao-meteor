import { publishComposite } from 'meteor/reywood:publish-composite';
import { check } from 'meteor/check';

import { findProfilePic } from '../../images/api';
import { getMessages } from "../../messages/api";
import { Trips } from "../../trips/collection";
import { Users } from "../../users/collection";
import { Parcels } from "../collection";

publishComposite('parcels.list.mine', function (filters={}) {
    if (!this.userId) {
        return this.ready();
    }
    
    let query = { $or: [{ownerId: this.userId}, {travelerId: this.userId}] };

    if (filters.$or) {
        query.$or = [...filters.$or, ...query.$or];
        delete filters['$or'];
    }

    query = {...filters, ...query};

    return {
        find() {
            return Parcels.find(query);
        },
        children: [{
            find(parcel) {
                return Trips.find({ _id: parcel.tripId });
            }
        }, {
            find(parcel) {
                return Users.find({ 
                    _id: { $in: [parcel.ownerId, parcel.travelerId] } 
                }, {
                    fields: { _id: 1, 'profile.city': 1, 'profile.name': 1}
                });
            },
            children: [{
                find(user) {
                    return findProfilePic(user._id);
                }
            }]
        }, {
            find(parcel) {
                return getMessages({ parcelId: parcel._id }, { limit: 1 });
            }
        }]
    };
});

publishComposite('parcels.single', function (filters) {
    if (!this.userId) {
        return this.ready();
    }

    filters = { ...filters, $or: [{ ownerId: this.userId }, { travelerId: this.userId }] };

    return {
        find() {
            return Parcels.find(filters, { limit: 1 });
        },
        children: [{
            find(parcel) {
                return Trips.find({
                    _id: parcel.tripId
                });
            }
        }, {
            find(parcel) {
                return Users.find({
                    _id: { $in: [parcel.ownerId, parcel.travelerId] }
                }, {
                    fields: {
                        'profile.name': 1,
                        'profile.city': 1,
                    }
                });
            },
            children: [{
                find(user) {
                    return findProfilePic(user._id);
                }
            }]
        }]
    };
});