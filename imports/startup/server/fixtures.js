
import { Meteor } from 'meteor/meteor';

import { initialTripSeeder } from './seeder';

Meteor.startup(() => {
    initialTripSeeder();
});
