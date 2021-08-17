'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const PushNotifications = require("node-pushnotifications");
const settings = {
    gcm: {
        id: process.env["FCM_SECRET"],
    },
};
const push = new PushNotifications(settings);
module.exports = {
    lifecycles: {
        beforeCreate(data) {
            data.send_at = new Date();
        },
        async afterCreate(result) {
            const data = {
                title: result.template.notification_titel??'Mögliches Feuer!', // REQUIRED for Android
                topic: 'topic', // REQUIRED for iOS (apn and gcm)
                /* The topic of the notification. When using token-based authentication, specify the bundle ID of the app.
                 * When using certificate-based authentication, the topic is usually your app's bundle ID.
                 * More details can be found under https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns
                 */
                body: result.template.notification_body??'Achtung Alarm, bitte sofort prüfen!',
                priority: 'high',
                custom: {
                    id:result.id,
                    template: {
                        id: result.template.id,
                        fehlalarm: result.template.fehlalarm,
                        reminder: result.template.reminder,
                        layout: result.template.layout,
                        reminder: result.template.reminder,
                        callToAction_text: result.template.callToAction_text,
                        quittierung_text: result.template.quittierung_text,
                        brandwahrscheinlichkeit: result.template.brandwahrscheinlichkeit,
                        alarmierte_personen: result.template.alarmierte_personen,
                        gamification_nutzen: result.template.gamification_nutzen,
                        nfc_nutzen: result.template.nfc_nutzen,
                        callToAction_button: result.template.callToAction_button,
                        randomisierte_module: result.template.randomisierte_module,
                    }
                },
                icon: 'notification_icon', // gcm for android
                image: '', // gcm for android
                style: '', // gcm for android
                picture: '', // gcm for android
                tag: '', // gcm for android
                color: '', // gcm for android
                clickAction: '', // gcm for android. In ios, category will be used if not supplied
                locKey: '', // gcm, apn
                titleLocKey: '', // gcm, apn
                retries: 2, // gcm, apn
                encoding: '', // apn
                badge: 2, // gcm for ios, apn
                sound: result.template.reminder?'':'alarm2.wav', // gcm, apn with extension
                android_channel_id: result.template.reminder?'reminder':'alarme', // gcm - Android Channel ID
                notificationCount: 0, // fcm for android. badge can be used for both fcm and apn
                launchImage: '', // apn and gcm for ios
                action: '', // apn and gcm for ios
                category: '', // apn and gcm for ios
                // mdm: '', // apn and gcm for ios. Use this to send Mobile Device Management commands.
                // https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/MobileDeviceManagementProtocolRef/3-MDM_Protocol/MDM_Protocol.html
                urlArgs: '', // apn and gcm for ios
                truncateAtWordEnd: true, // apn and gcm for ios
                mutableContent: 0, // apn
                threadId: '', // apn
                pushType: 'alert',
            };
          const pushResult = await push.send(result.user.fcmToken, data);
        },
      },
};
