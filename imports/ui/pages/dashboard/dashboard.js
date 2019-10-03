import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import { Trips } from '/imports/api/trips/collection';

import './dashboard.html';
import '../../components/trip/summary';

Template.dashboardPage.onCreated(function () {
    this.listSub = Meteor.subscribe('trips.list.mine');
});

Template.dashboardPage.helpers({
    myTrips () {
        return Trips.find().fetch();
    }
});