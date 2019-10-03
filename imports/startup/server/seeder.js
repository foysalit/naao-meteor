import faker from 'faker';
import moment from 'moment';
import { HTTP } from 'meteor/http';

import { autoCompleteCityQuery, findCoordsByPlaceId } from '../../api/utils/location-api';
import { Users } from '../../api/users/collection';
import { Trips } from '../../api/trips/collection';

const getAvatarString = () => {
    const res = HTTP.get('http://i.pravatar.cc/300');

    if (res.content) {
        data = "data:" + res.headers["content-type"] + ";base64," + new Buffer(res.content).toString('base64');
        return data;
    }

    return faker.lorem.sentence();
};

export const initialTripSeeder = () => {
    if (Trips.findOne()) {
        console.log("NOT SEEDING DB CAUSE THERE ARE EXISTING DATA IN IT");
        return;
    }

    const keywords = ['italy', 'germany', 'england', 'france', 'new york', 'washington', 'bangladesh', 'india', 'pakistan', 'sri lanka', 'china', 'japan'];
    // const keywords = ['italy', 'bangladesh'];

    const countries = keywords.map(keyword => { 
        const data = autoCompleteCityQuery(keyword);

        if (data.status === 'OK') {
            return data.predictions.map(loc => {
                const coords = findCoordsByPlaceId(loc.place_id);
                loc.coordinates = [coords.lng, coords.lat];

                return loc;
            });
        }

        return [];
    });

    // console.log(countries); 
    const users = countries.map((locations, i) => {
        let city = locations[i];

        if (!city) {
            city = locations[0];
        }

        const userData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            profile: {
                name: `${faker.name.firstName()} ${faker.name.lastName()}`,
                pic: getAvatarString(),
                city,
            }
        };

        // console.log(userData, locations);
        const userId = Meteor.call('users.register', userData);

        return Users.findOne(userId);
    });

    users.forEach((user, userIndex) => {
        countries.forEach((locations, countryIndex) => {
            if (countryIndex === userIndex)
                return;

            locations.forEach(to => { 
                const collectBy = faker.date.future();
                const totalSpace = {
                    weight: faker.random.number({ min: 1, max: 10 }),
                    height: faker.random.number({ min: 5, max: 30 }),
                    width: faker.random.number({ min: 5, max: 20 }),
                    len: faker.random.number({ min: 2, max: 30 }),
                };

                Trips.insert({
                    to, collectBy, totalSpace, availableSpace: totalSpace,
                    deliveryBy: moment(collectBy).add(1, 'day').toDate(),
                    from: countries[userIndex][0],
                    travelerId: user._id,
                });
            });
        });
    });
};