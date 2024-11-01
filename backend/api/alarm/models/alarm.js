'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const PushNotifications = require("node-pushnotifications");
let firebaseConfig = process.env["FCM_SECRET"];
if(firebaseConfig) firebaseConfig = JSON.parse(firebaseConfig);
else firebaseConfig = require('./../../../firebase.json');

const settings = {
	fcm: {
		appName: "brawa",
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
                    collapseKey: Math.random().toString().replace('0.', ''),
                    title: result.template.notification_titel??'Mögliches Feuer!',
                    topic: 'all',
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
                    fcm_notification: {
                    },
                    icon: 'notification_icon',
                    sound: result.template.reminder?'':result.template.alarmSound.toLowerCase()+'.wav',
                    category: 'alarm',
                    truncateAtWordEnd: true,
                    pushType: 'alert',
                };
                const pushResult = await push.send(result.user.fcmToken, data);

                if (pushResult[0].failure > 0){
                    console.error("error on push", JSON.stringify(pushResult));

                    if(pushResult[0].message[0].errorMsg == "NotRegistered" || pushResult[0].message[0].errorMsg == "Requested entity was not found."){
                        console.error("FCM Token not registered anymore, deleting fcmtoken for user: ", result.user.id);
                        result.user.fcmToken = null;
                        await strapi.query('user', 'users-permissions').update({id:result.user.id}, result.user);
                    }
                }
            } catch (err) {
                console.error("error on push", err);
            }
          
        },
      },
};
