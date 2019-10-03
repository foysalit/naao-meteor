import { GoogleMaps } from 'meteor/dburles:google-maps';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import { Trips } from "/imports/api/trips/collection";
import '../../components/trip/summary';
import './single.html';

Template.singleTripsPage.onCreated(function () {
    const tripId = FlowRouter.getParam('_id');
    
    this.state = new ReactiveDict();
    this.tripSub = Meteor.subscribe('trips.single', tripId, () => {
        this.state.set('dataReady', true);
    });
});

Template.singleTripsPage.helpers({
    trip () {
        return Trips.findOne(FlowRouter.getParam('_id'));
    },
    state ()  {
        return Template.instance().state.all();
    }
});

function makeCounterOffer (tpl) {
    const amount = tpl.$('[name="counter-offer"]').val(),
        update = {
            counterOffer: Number(parseFloat(amount).toFixed(2)),
            counterOfferAt: new Date(), 
        };
    
    tpl.modal.set('header', `Your Counter Offer is : $${update.counterOffer}`);
    tpl.modal.set('content', `Sender can accept or reject your counter offer and once you make a counter offer, you will not be able to re-negotiate the pricing.`);

    tpl.$confirmationModal
        .modal('setting', 'onApprove', () => {
            Meteor.call('parcels.update', tpl.data.parcel._id, update, (err, res) => {
                console.log(err, res);
            });
        }).modal('show');
};

Template.singleParcel.onCreated (function () {
    this.modal = new ReactiveDict();

    this.modal.set('header', null);
    this.modal.set('content', null);
});

Template.singleParcel.onRendered (function () {
    this.$confirmationModal = this.$('.confirmation-modal-js').modal({
        transition: 'fade up',
    });
});

Template.singleParcel.helpers({
    modal () {
        return Template.instance().modal.all();
    }
});

Template.singleParcel.events({
    'keypress [name="counter-offer"]': function (e, tpl) {
        if (e.which == 13) {
            makeCounterOffer(tpl);
        }
    },
    'click .submit-counter-offer-js': function (e, tpl) {
        makeCounterOffer(tpl);
    },
    'click .accept-js': function (e, tpl) {
        tpl.modal.set('header', `You are accepting an offer from ${tpl.data.parcel.owner().profile.name}`);
        tpl.modal.set('content', `Once you accept the offer, you can contact the sender to arrange a pick up or collection through our platform or exchange phone numbers.`);

        tpl.$confirmationModal
            .modal('setting', 'onApprove', () => {
                Meteor.call('parcels.update', tpl.data.parcel._id, {
                    isAccepted: true,
                    closedAt: new Date()
                }, (err, res) => {
                    console.log(err, res);
                });
            }).modal('show');
    },
    'click .reject-js': function (e, tpl) {
        tpl.modal.set('header', `You are rejecting an offer from ${tpl.data.parcel.owner().profile.name}`);
        tpl.modal.set('content', `Once you rejecting the offer, you will no longer be able to accept it again. So, please confirm that you're sure about it`);

        tpl.$confirmationModal
            .modal('setting', 'onApprove', () => {
                Meteor.call('parcels.update', tpl.data.parcel._id, {
                    isRejected: true,
                    closedAt: new Date()
                }, (err, res) => {
                    console.log(err, res);
                });
            }).modal('show');
    }
});