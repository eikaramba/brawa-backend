'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const PushNotifications = require("node-pushnotifications");
const firebaseConfig = require('./../../../firebase.json');

const settings = {
	fcm: {
		appName: "notificat",
		serviceAccountKey: firebaseConfig, 
		credential: null,
	},
};
const push = new PushNotifications(settings);
module.exports = {
    lifecycles: {
        beforeCreate(data) {
            data.send_at = new Date();
        },
        async afterCreate(result) {
			try {
                if(!result.template.alarmSound){
                    result.template.alarmSound="alarmc";
                }
                if(!result.user || !result.user.fcmToken) {
                    console.error("alarm was created, but no FCM Token for user was available");
                    return;
                }
                const data = {
                    title: result.template.notification_titel??'Mögliches Feuer!', // REQUIRED for Android
                    topic: 'all', // REQUIRED for iOS (apn and gcm)
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
                            alarmSound:result.template.alarmSound,
                            notification_body: result.template.notification_body??'Achtung Alarm, bitte sofort prüfen!',
                            notification_titel: result.template.notification_titel??'Mögliches Feuer!'
                        }
                    },
                    icon: 'notification_icon', 
                    badge: 2, // gcm for ios, apn
                    sound: result.template.reminder?'':result.template.alarmSound.toLowerCase()+'.wav', // gcm, apn with extension
                    android_channel_id: result.template.reminder?'reminder':result.template.alarmSound, // gcm - Android Channel ID
                    category: 'alarm', // apn and gcm for ios
                    truncateAtWordEnd: true, // apn and gcm for ios
                    mutableContent: 0, // apn
                    pushType: 'alert',
                };
                const result = await push.send(result.user.fcmToken, data);

                if (result[0].failure > 0){
                    logger.error("error on push: %O", result);

                    if(result[0].message[0].errorMsg == "NotRegistered" || result[0].message[0].errorMsg == "Requested entity was not found."){
                        logger.error("FCM Token not registered anymore, deleting fcmtoken");
                        // await strapi.services.user.update({ id }, ctx.request.body);
                    }
                }
            } catch (err) {
                logger.error("error on push: %O", err);
            }
          
        },
      },
};
