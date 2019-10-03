import { GoogleMaps } from 'meteor/dburles:google-maps';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from "meteor/reactive-dict";
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import moment from 'moment';

import { TripSchema } from '/imports/api/trips/schema';
import { Trips } from '/imports/api/trips/collection';
import { getTempTrip, setTempTrip } from '/imports/api/trips/client/api';
import './create.html';

Template.createTrip.onCreated(function () {
    this.$collectCalendar = null;
    this.$deliveryCalendar = null;
    this.trip = new ReactiveDict();
    this.creator = new ReactiveDict();

    const tempTrip = getTempTrip();
    if (tempTrip) {
        _.keys(tempTrip).forEach((field) => this.trip.set(field, tempTrip[field]));
    }
});

Template.createTrip.onRendered(function () {
    this.creator.set('errors', []);
    this.autorun(() => {
        if (!GoogleMaps.loaded())
            return;

        this.fromAutocomplete = new google.maps.places.Autocomplete(this.$('[name="from"]')[0], {
            types: ['(cities)']
        });
        this.toAutocomplete = new google.maps.places.Autocomplete(this.$('[name="to"]')[0], {
            types: ['(cities)']
        });

        this.fromAutocomplete.addListener('place_changed', (e, data) => {
            const { name, place_id, geometry } = this.fromAutocomplete.getPlace();
            this.trip.set('from', {
                name, place_id, 
                coordinates: [geometry.location.lng(), geometry.location.lat()]
            });
        });

        this.toAutocomplete.addListener('place_changed', (e, data) => {
            const { name, place_id, geometry } = this.toAutocomplete.getPlace();
            this.trip.set('to', {
                name, place_id, 
                coordinates: [geometry.location.lng(), geometry.location.lat()]
            });
        });
    });

    this.$collectCalendar = this.$('.collect-by-calendar').calendar({ 
        type: 'date',
        minDate: moment().add(1, 'days').toDate(),
        onChange: (date, text, mode) => {
            const minDate = moment(date).toDate();
            this.$deliveryCalendar.calendar('setting', 'minDate', minDate);
            this.trip.set('collectBy', minDate);
        }
    });

    this.$deliveryCalendar = this.$('.delivery-by-calendar').calendar({ 
        type: 'date',
        minDate: moment().add(1, 'days').toDate(),
        onChange: (date) => {
            const maxDate = moment(date).toDate();
            this.$collectCalendar.calendar('setting', 'maxDate', maxDate);
            this.trip.set('deliveryBy', maxDate);
        }
    });

    this.$createConfirmationModal = this.$('#create_trip_confirmation_modal.tiny').modal({
        transition: 'fade up',
    });
    
    $select = this.$('select[name="unit"]');
    $select.dropdown({
        onChange: (value) => {
            savetotalSpace($select, this);
        }
    });
});

Template.createTrip.helpers({
    errors () {
        return Template.instance().creator.get('errors');
    },
    tempTrip () {
        return Template.instance().trip.all();
    },
    creator () {
        return Template.instance().creator.all();
    }
});

function savetotalSpace ($input, tpl) {
    const field = $input.attr('name'),
        totalSpace = tpl.trip.get('totalSpace') || {};

    totalSpace[field] = $input.val();
    tpl.trip.set('totalSpace', totalSpace);  
};

Template.createTrip.events({
    'keyup .parcel-space': function (e, tpl) {
        const $input = $(e.currentTarget);
        savetotalSpace($input, tpl);
    },
    'submit form': function (e, tpl) {
        e.preventDefault();
        const tripData = TripSchema.clean(tpl.trip.all());
        
        try {
            let onApprove = null;
            TripSchema.validate(tripData);
            tpl.creator.set('errors', null);
            
            if (!Meteor.userId()) {
                setTempTrip(tripData);
                onApprove = () => {
                    FlowRouter.go('signup');
                };
            } else {
                onApprove = () => {
                    tpl.creator.set('working', true);
                    Meteor.call('trips.create', tripData, (err, res) => {
                        tpl.creator.set('working', false);

                        if (err) {
                            return tpl.creator.set('errors', [err.message]);
                        }

                        tpl.trip.clear();
                    });
                };
            }

            tpl.$createConfirmationModal.modal('setting', 'onApprove', onApprove).modal('show');
        } catch (err) {
            tpl.creator.set('errors', [err.message]);
        }
    }
});
