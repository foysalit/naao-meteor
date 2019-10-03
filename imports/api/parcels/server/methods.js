import { _ } from "meteor/underscore";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";

import { Parcels } from '../collection';
import { ParcelSchema } from '../schema';
import { Trips } from "../../trips/collection";
import { notifyUser } from "../../messages/server/notifications";

Meteor.methods({
    'parcels.create': function (parcelData) {
        check(this.userId, String);

        parcelData = ParcelSchema.clean({
            ...parcelData,
            offerAt: new Date(),
            ownerId: this.userId,
        });

        ParcelSchema.validate(parcelData);

        if (Parcels.findOne({ ownerId: this.userId, tripId: parcelData.tripId })) {
            throw new Meteor.Error("already-offerred", "You have already made an offer for this trip.");
        }

        const trip = Trips.findOne(parcelData.tripId);
        parcelData.travelerId = trip.travelerId;

        const _id = Parcels.insert(parcelData),
            parcel = { _id, ...parcelData },
            notiData = { type: 'trip', trip };

        notifyUser(parcel.travelerId, 'Offer for a new parcel', `You have a new offer of ${parcel.offer} ${parcel.currency} to deliver a ${parcel.size.weight}KG parcel.`, notiData);
        return parcel;
    },
    'parcels.update': function (_id, parcelData) {
        check(this.userId, String);
        check(_id, String);
        check(parcelData, {
            counterOffer: Match.Maybe(Number),
            counterOfferAt: Match.Maybe(Date),
            isAccepted: Match.Maybe(Boolean),
            isRejected: Match.Maybe(Boolean),
            deliveredAt: Match.Maybe(Date),
            ownerRating: Match.Maybe(Number),
            travelerRating: Match.Maybe(Number),
            ownerReview: Match.Maybe(String),
            travelerReview: Match.Maybe(String),
            closedAt: Match.Maybe(Date),
        });

        const isSettingReview = _.intersection(Object.keys(parcelData), ['ownerReview', 'travelerReview', 'ownerRating', 'travelerRating']).length > 0;
        const parcel = Parcels.findOne(_id),
            trip = parcel.trip();

        // only review can be set once the deal has been closed
        if (parcel.closedAt && !isSettingReview) {
            throw new Meteor.Error('401', 'Deal has been sealed');
        }

        if (parcel.ownerId !== this.userId && trip.travelerId !== this.userId) {
            throw new Meteor.Error('401', 'You do not have permission to perform this action');
        }

        // only allow traveler to make a counter offer
        if (parcelData.counterOffer && trip.travelerId != this.userId) {
            throw new Meteor.Error('401', 'You must be the traveler to perform this action');
        }

        // only allow current user to be the markedDeliveredBy user
        if (parcelData.deliveredAt) {
            parcelData.markedDeliveredBy = this.userId;
        }

        // if traveler tries to write sender's review or sender tries to write travelers review
        if ((parcelData.senderReview && parcel.ownerId !== this.userId) || (parcelData.travelerReview && parcel.travelerId !== this.userId)) {
            throw new Meteor.Error('401', 'Trying to be sneaky? you can not post this review.');
        }

        if (isSettingReview && !parcel.deliveredAt)
            throw new Meteor.Error('400', 'Can not review before delivering the parcel');

        return Parcels.update({_id}, {$set: parcelData});
    }
});