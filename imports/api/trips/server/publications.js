import { publishComposite } from 'meteor/reywood:publish-composite';
import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Parcels } from "../../parcels/collection";
import { findProfilePic } from '../../images/api';
import { getMessages } from '../../messages/api';
import { Users } from "../../users/collection";
import { Trips } from "../collection";

publishComposite('trips.list', function (filters = {}) {
    const SearchSchema = new SimpleSchema({
        from: { type: Object, optional: true, blackbox: true },
        to: { type: Object, optional: true, blackbox: true },
        deliveryBy: { type: Object, optional: true },
        'deliveryBy.$lte': Date,
        collectBy: { type: Object, optional: true },
        'collectBy.$lte': Date,
        'availableSpace.weight': { type: Object, optional: true },
        'availableSpace.weight.$gte': Number,
    });

    // console.log('search filters before', filters);
    filters = SearchSchema.clean(filters);
    // console.log('search filters after', JSON.stringify(filters));

    return {
        find () {
            return Trips.find(filters);
        },
        children: [{
            find (trip) {
                return Users.find({
                    _id: trip.travelerId
                }, { fields: {
                    'profile.name': 1,
                    'profile.city': 1,
                } });
            },
            children: [{
                find(user) {
                    return findProfilePic(user._id);
                }
            }]
        }, {
            find (trip) {
                return Parcels.find({
                    tripId: trip._id,
                    ownerId: this.userId,
                }, { fields: {
                    size: 1, ownerId: 1, tripId: 1
                } });
            }
        }]
    };
});

publishComposite('trips.single', function (_id) {
    return {
        find () {
            return Trips.find({_id, travelerId: this.userId});
        },
        children: [{
            find (trip) {
                return Parcels.find({
                    tripId: trip._id
                });
            },
            children: [{
                find (parcel) {
                    return Users.find({
                        _id: parcel.ownerId
                    }, {
                        fields: {
                            'profile.name': 1,
                            'profile.city': 1,
                        }
                    });
                }
            }, {
                find (parcelId) {
                    return getMessages({parcelId}, {limit: 1});
                }
            }]
        }, {
            find(trip) {
                return Users.find({
                    _id: trip.travelerId
                }, {
                    fields: {
                        'profile.name': 1,
                        'profile.city': 1,
                    }
                });
            },
            children: [{
                find (user) {
                    return findProfilePic(user._id);
                }
            }]
        }]
    }
});

publishComposite('trips.list.mine', function (favoriteOnly=false) {
    if (!this.userId) {
        return this.ready();
    }

    let filters = {};

    if (favoriteOnly) {
        filters = { favoritedBy: this.userId };
    } else {
        filters = { travelerId: this.userId };
    }

    return {
        find () {
            const trips = Trips.find(filters);
            return trips;
        },
        children: [{
            find (trip) {
                return Users.find({_id: trip.travelerId});
            },
            children: [{
                find (user) {
                    return findProfilePic(user._id);
                }
            }]
        }]
    };
});