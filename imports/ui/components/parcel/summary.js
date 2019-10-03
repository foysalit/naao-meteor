import { Template } from 'meteor/templating';

import "./stages";
import './summary.html';

Template.summaryParcel.onCreated(function () {
    Meteor.subscribe('parcels.list.mine');
    this.modal = new ReactiveDict();

    this.modal.set('header', null);
    this.modal.set('content', null);
});

Template.summaryParcel.onRendered(function () {
    this.$confirmationModal = this.$('.confirmation-modal-js').modal({
        transition: 'fade up',
    });
});

Template.summaryParcel.helpers({
    modal() {
        return Template.instance().modal.all();
    }
});

Template.summaryParcel.events({
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