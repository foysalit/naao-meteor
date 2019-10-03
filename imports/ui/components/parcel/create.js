import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";

import { ParcelSchema } from "/imports/api/parcels/schema";
import { setTempParcel } from "/imports/api/parcels/client/api";

import './create.html';

Template.createParcel.onCreated(function () {
    this.parcel = new ReactiveDict();
    this.creator = new ReactiveDict();
});

Template.createParcel.onRendered(function () {
    this.parcel.set('tripId', this.data.trip._id);
    $select = this.$('select[name="unit"]');
    $select.dropdown({
        onChange: (value) => {
            saveSize($select, this);
        }
    });

    this.$createConfirmationModal = this.$('#create_parcel_confirmation_modal.tiny').modal({
        transition: 'fade up',
    });
});

function saveSize($input, tpl) {
    const field = $input.attr('name'),
        size = tpl.parcel.get('size') || {};

    size[field] = $input.val();
    tpl.parcel.set('size', size);
};

Template.createParcel.helpers({
    parcel () {
        return Template.instance().parcel.all();
    },
    creator () {
        return Template.instance().creator.all();
    }
});

Template.createParcel.events({
    'keyup .parcel-space': function (e, tpl) {
        const $input = $(e.currentTarget);
        saveSize($input, tpl);
    },
    'keyup .parcel-offer': function (e, tpl) {
        const $input = $(e.currentTarget);
        tpl.parcel.set('offer', $input.val());
    },
    'submit form': function (e, tpl) {
        e.preventDefault();
        const parcelData = ParcelSchema.clean(tpl.parcel.all());

        try {
            let onApprove = null;
            ParcelSchema.validate(parcelData);
            tpl.creator.set('errors', null);

            if (!Meteor.userId()) {
                setTempParcel(parcelData);
                onApprove = () => {
                    FlowRouter.go('signup');
                };
            } else {
                onApprove = () => {
                    tpl.creator.set('working', true);
                    Meteor.call('parcels.create', parcelData, (err, res) => {
                        tpl.creator.set('working', false);

                        if (err) {
                            return tpl.creator.set('errors', [err.message]);
                        }

                        tpl.parcel.clear();
                    });
                };
            }

            tpl.$createConfirmationModal.modal('setting', 'onApprove', onApprove).modal('show');
        } catch (err) {
            tpl.creator.set('errors', [err.message]);
        }
    }
});