import SimpleSchema from 'simpl-schema';

import { isValidName } from './validation';
import { LocationSchema } from "../utils/location-schema";

export const UserProfileSchema = new SimpleSchema({
    name: {
        type: String,
        min: 2,
        max: 60,
        optional: true,
    },
    city: {
        type: LocationSchema,
    },
    pic: {
        optional: true,
        type: String,
        min: 200,
    }
});