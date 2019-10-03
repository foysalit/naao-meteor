import { Meteor } from 'meteor/meteor';

import { autoCompleteCityQuery } from './location-api';

Meteor.methods({
    'location.city.autocomplete': function (input) {
        if (input.length < 2) {
            return [];
        }

        // console.log('requested autocomplete', new Date(), input);
        try {
            const cities = autoCompleteCityQuery(input);
            if (cities.status !== 'OK') {
                throw new Meteor.Error(400, "Error getting cities");
            }

            return cities.predictions;
        } catch (err) {
            console.log('error finding places', err, new Date());
        }
    }
});