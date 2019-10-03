// Import client startup through a single index entry point
import { Meteor } from 'meteor/meteor';
import { GoogleMaps } from 'meteor/dburles:google-maps';

import './accounts.js';
import './helpers.js';
import './routes.js';

Meteor.startup(() => {
    GoogleMaps.load({ v: '3', key: Meteor.settings.public.googleMapsApiKey, libraries: 'places' });
});