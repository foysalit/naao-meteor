import { Mongo } from 'meteor/mongo';

import { MessageSchema } from './schema';

export const Messages = new Mongo.Collection('messages');

Messages.attachSchema(MessageSchema);