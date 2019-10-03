import { GoogleMaps } from 'meteor/dburles:google-maps';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import { findParcelInTripByOwner, findParcelsInTrip } from '/imports/api/trips/api';
import { getTempTrip, setTempTrip } from '/imports/api/trips/client/api';
import './summary.html';

Template.summaryTrip.onCreated(function () {
    this.fromMarker = null;
    this.toMarker = null;
    this.flightPath = null;
});

function drawMap (map, tpl) {
    const { from, to } = tpl.data.trip;

    if (tpl.fromMarker) tpl.fromMarker.setMap(null);
    if (tpl.toMarker) tpl.toMarker.setMap(null);
    if (tpl.flightPath) tpl.flightPath.setMap(null);

    tpl.fromMarker = new google.maps.Marker({
        position: new google.maps.LatLng(from.coordinates[1], from.coordinates[0]),
        map: map.instance
    });

    tpl.toMarker = new google.maps.Marker({
        position: new google.maps.LatLng(to.coordinates[1], to.coordinates[0]),
        map: map.instance
    });

    tpl.flightPath = new google.maps.Polyline({
        path: [
            { lat: from.coordinates[1], lng: from.coordinates[0] },
            { lat: to.coordinates[1], lng: to.coordinates[0] },
        ],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    tpl.flightPath.setMap(map.instance);

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(tpl.fromMarker.position);
    bounds.extend(tpl.toMarker.position);
    map.instance.fitBounds(bounds);
}

Template.summaryTrip.onRendered(function () {
    GoogleMaps.ready(this.data.trip._id, (map) => {
        drawMap(map, this);
    });
});

Template.summaryTrip.helpers({
    tripMapOptions () {
        if (GoogleMaps.loaded()) {
            const { from, to } = this.trip;

            return {
                center: new google.maps.LatLng(from.coordinates[0], from.coordinates[1]),
                zoom: 3,
                disableDefaultUI: true
            };
        }
    },
    canBook () {
        return (Meteor.userId() !== this.trip.travelerId)
            && !this.isViewingTrip;
    },
    userHasBooked () {
        return !!findParcelInTripByOwner(this.trip, Meteor.user());
    },
    parcelCount () {
        return findParcelsInTrip(this.trip).count();
    }
});

Template.summaryTrip.events({

});
