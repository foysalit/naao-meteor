import { Mongo } from 'meteor/mongo';

import { TripSchema } from './schema';
import { TripHelpers } from './helpers';

export const Trips = new Mongo.Collection('trips');

Trips.helpers(TripHelpers);
Trips.attachSchema(TripSchema);