import { Expo } from 'expo-server-sdk';

import { Users } from '../../users/collection';

export function notifyUser(receiverId, title, body, data={}) {
    // Create a new Expo SDK client
    const expo = new Expo(),
        user = Users.findOne(receiverId);

    if (!user.expoTokens || user.expoTokens.length < 1) {
        return console.log('user does not have expo token. can not sent notification');
    }

    const messages = [];
    for (let to of user.expoTokens) {
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!Expo.isExpoPushToken(to)) {
            console.error(`Push token ${to} is not a valid Expo push token`);
            continue;
        }

        messages.push({
            to, body, title, data,
            sound: 'default',
        });
    }

    // console.log('notification messages', messages);
    const chunks = expo.chunkPushNotifications(messages);

    (async () => {
        for (let chunk of chunks) {
            try {
                let receipts = await expo.sendPushNotificationsAsync(chunk);
                console.log('expo noti', receipts);
            } catch (error) {
                console.error('expo noti', error);
            }
        }
    })();
};