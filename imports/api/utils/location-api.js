import { createClient, util } from '@google/maps';

// console.log('meteor settings', Meteor.settings);
const googleMapsClient = createClient({
    key: Meteor.settings.googleMapsApiKey,
    rate: { limit: 50 },
});

export const autoCompleteCityQuery = (input) => {
    const findMatchingCities = Meteor.wrapAsync(googleMapsClient.placesAutoComplete, googleMapsClient);
    const sessiontoken = util.placesAutoCompleteSessionToken();

    const { json } = findMatchingCities({
        input, sessiontoken,
        types: '(cities)',
    });

    return json;
};

export const findCoordsByPlaceId = (placeid) => {
    const getPlace = Meteor.wrapAsync(googleMapsClient.place, googleMapsClient);
    const { json } = getPlace({placeid});

    if (json.status === 'OK' && json.result.geometry) {
        return json.result.geometry.location;
    }
    
    return null;
};