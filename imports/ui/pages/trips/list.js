import { GoogleMaps } from 'meteor/dburles:google-maps';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import { Trips } from "/imports/api/trips/collection";
import '../../components/trip/list';
import './list.html';

Template.listTripsPage.onCreated(function () {
    this.$collectCalendar = null;
    this.$deliveryCalendar = null;
    this.filters = new ReactiveDict();
    resetFilters(this.filters);

    this.autorun(() => {
        const filters = this.filters.all();
        this.tripsSub = Meteor.subscribe('trips.list', filters);
    });

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
            this.filters.set('from', [geometry.location.lat(), geometry.location.lng()]);
        });

        this.toAutocomplete.addListener('place_changed', (e, data) => {
            const { name, place_id, geometry } = this.toAutocomplete.getPlace();
            this.filters.set('to', [geometry.location.lat(), geometry.location.lng()]);
        });
    });
});

function resetFilters (filters) {
    filters.clear();
    filters.set('availableSpace.weight', {$gte: 1});
    filters.set('collectBy', {$gte: moment().add(1, 'days').toDate()});
};

Template.listTripsPage.onRendered(function () {
    this.$collectCalendar = this.$('.collect-by-calendar').calendar({
        type: 'date',
        minDate: moment().add(1, 'days').toDate(),
        onChange: (date, text, mode) => {
            const minDate = moment(date).toDate();
            this.$deliveryCalendar.calendar('setting', 'minDate', minDate);
            this.filters.set('collectBy', {$gte: minDate});
        }
    });

    this.$deliveryCalendar = this.$('.delivery-by-calendar').calendar({
        type: 'date',
        minDate: moment().add(1, 'days').toDate(),
        onChange: (date) => {
            const maxDate = moment(date).toDate();
            this.$collectCalendar.calendar('setting', 'maxDate', maxDate);
            this.filters.set('deliveryBy', {$lte: maxDate});
        }
    });    
});

Template.listTripsPage.helpers({
    trips () {
        return Trips.find().fetch();
    },
    filters () {
        return Template.instance().filters.all();
    }
});

Template.listTripsPage.events({
    'click .reset-filters-js' (e, tpl) {
        resetFilters(tpl.filters);
    }
});