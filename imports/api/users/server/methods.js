import { Accounts } from "meteor/accounts-base";
import uriToBuffer from 'data-uri-to-buffer';
import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Random } from 'meteor/random';
import { _ } from "meteor/underscore";

import { findCoordsByPlaceId } from "../../utils/location-api";
import { Images } from '../../images/collection';
import { UserProfileSchema } from "../schema";
import { Users } from "../collection";
import { welcomeEmail } from "./email";

Meteor.methods({
    'users.update.profile': function (profile = {}) {
        check(this.userId, String);
        const currentProfile = Users.findOne(this.userId).profile;
        profile = UserProfileSchema.clean(profile);

        if (profile.pic) {
            const { pic } = profile;
            profile = _.omit(profile, 'pic');

            // offload the image insert cause it takes a while....
            if (pic) {
                Meteor.setTimeout(() => {
                    Images.write(uriToBuffer(pic), {
                        fileName: `${Random.id()}.png`,
                        type: 'image/jpeg',
                        meta: { parentId: this.userId, module: 'user' },
                    }, (err, res) => {
                        if (!err) {
                            Images.remove({ 
                                'meta.parentId': this.userId, 
                                'meta.module': 'user', 
                                _id: {$ne: res._id} 
                            });
                        }
                    });
                }, 100);
            }
        }

        return Users.update(this.userId, {$set: {
            profile: { ...currentProfile, ...profile }
        }});
    },
    'users.register': function (userData={}) {
        // console.log({userData});
        userData.profile = UserProfileSchema.clean(userData.profile);

        if (userData.profile.city && userData.profile.city.place_id && !userData.profile.city.coordinates) {
            const coords = findCoordsByPlaceId(userData.profile.city.place_id);

            if (coords) {
                userData.profile.city.coordinates = [coords.lng, coords.lat];
            }
        }

        UserProfileSchema.validate(userData.profile);

        check(userData.email, String);
        check(userData.password, String);

        const { pic } = userData.profile;
        userData.profile = _.omit(userData.profile, 'pic');
        const _id = Accounts.createUser(userData);

        // offload the image insert cause it takes a while....
        if (pic) {
            Meteor.setTimeout(() => {
                Images.write(uriToBuffer(pic), {
                    fileName: `${_id}.png`,
                    type: 'image/jpeg',
                    meta: { parentId: _id, module: 'user' },
                });
            }, 100);
        }

        welcomeEmail(userData.profile.name, userData.email);
        return _id;
    },
    'users.notification.subscribe': function (token) {
        check(token, String);

        if (!this.userId) {
            throw new Meteor.Error('unauthorized', 'You are not authorized to subscribe for notification!');
        }

        return Users.update(this.userId, { $addToSet: { expoTokens: token } });
    },
    'users.notification.unsubscribe': function (token) {
        check(token, String);

        if (!this.userId) {
            throw new Meteor.Error('unauthorized', 'You are not authorized to unsubscribe for notification!');
        }

        const user = Users.findOne(this.userId);

        if (!user.expoTokens || user.expoTokens.indexOf(token) < 0) {
            return null;
        }

        return Users.update(this.userId, { $pull: { expoTokens: token } });
    },
    'users.messaging.state': function (isMessaging = false) {
        check(isMessaging, Match.OneOf(Boolean, String));

        if (!this.userId) {
            throw new Meteor.Error('unauthorized', 'You are not authorized for messaging!');
        }

        // console.log('updating msg state', isMessaging);
        return Users.update(this.userId, { $set: { isMessaging } });
    }
});