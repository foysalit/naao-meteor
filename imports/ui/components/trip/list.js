import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";

import { findParcelInTripByOwner } from "/imports/api/trips/api";
import "../parcel/summary";
import "../parcel/create";
import "./summary";
import "./list.html";

Template.listTrip.onCreated(function () {
    this.state = new ReactiveDict();

    this.autorun(() => {
        const viewingTrip = this.state.get('viewingTrip');

        if (!viewingTrip)
            return;
        
        const parcel = findParcelInTripByOwner(viewingTrip, Meteor.user());
        if (parcel)
            Meteor.subscribe('parcels.single', parcel._id);
    });
});

Template.listTrip.onRendered(function () {
    this.$sidePanel = this.$('.trip-side-panel-js');
});

toggleSidePanel = (tpl, cb) => {
    const isOpen = tpl.$sidePanel.css('right') == '0px';
    
    if (isOpen) {
        $('body').css({'overflow-y': ''});
        tpl.$sidePanel.animate({ right: '-100%' }, 500, () => {
            tpl.state.delete('viewingTrip');
        });
    } else {
        $('body').css({'overflow-y': 'hidden'});
        tpl.$sidePanel.animate({ right: '0' }, 500, cb);
    }
};

Template.listTrip.helpers({
    state () {
        return Template.instance().state.all();
    },
    userHasBooked() {
        const viewingTrip = Template.instance().state.get('viewingTrip');
        if (viewingTrip)
            return findParcelInTripByOwner(viewingTrip, Meteor.user());
    },
});

Template.listTrip.events({
    'click .book-js' (e, tpl) {
        toggleSidePanel(tpl, () => {
            tpl.state.set('viewingTrip', this.trip);
        });
    },
    'click .trip-side-panel-close-js' (e, tpl) {
        toggleSidePanel(tpl);
    }
});