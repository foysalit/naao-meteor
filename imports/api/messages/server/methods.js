import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

import { Messages } from '../collection';
import { MessageSchema } from '../schema';
import { notifyUser } from './notifications';
import { Trips } from '../../trips/collection';
import { Parcels } from '../../parcels/collection';

Meteor.methods({
    'messages.create': function (parcelId, message = {}) {
        console.log('messages.create', parcelId, message);
        new SimpleSchema({text: String}, {check}).validate(message);
        check(parcelId, String);

        if (!this.userId) {
            throw new Meteor.Error('unauthorized', 'You are not authorized to send messages!');
        }

        const parcel = Parcels.findOne({ _id: parcelId, $or: [{ ownerId: this.userId }, { travelerId: this.userId }] });
        if (!parcel) {
            throw new Meteor.Error('invalid-parcel', 'This parcel does not exist');
        }

        message = { ...message, sent: true, authorId: this.userId, parcelId };
        MessageSchema.validate(message);

        const messageId = Messages.insert(message);

        Parcels.update({_id: parcel._id}, {$set: {lastMessageId: messageId}});
        
        const receiverId = parcel.ownerId === this.userId ? parcel.travelerId : parcel.ownerId;
        const notiData = { type: 'message', title: 'You have a new message', parcel };
        notifyUser(receiverId, `New message regarding your parcel`, message.text, notiData);

        return messageId;
    },
});