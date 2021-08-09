'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {

    async checkAlarms() {
        console.log("checking overdue alarms");
        let alarmsCounter=0;
        const overdueAlarms = await strapi.query('template').find({ausgeloest:false,ausloesen_um_lt: new Date()});

        for (const alarm of overdueAlarms) {
            for (const group of alarm.groups) {
                for (const user of group.users) {
                    if(!user.fcmToken) continue; //do not send notifications to users without fcmToken
                    const params = {
                        template: alarm.id,
                        user: user.id,
                    };
                    
                    await strapi.query('alarm').create(params);
                    alarmsCounter++;
                }
            }
            await strapi.query('template').update({ id: alarm.id }, {
                ausgeloest: true,
                ausgeloest_um: new Date()
            });
        }
        if(overdueAlarms.length>0)
        console.log(`created ${alarmsCounter} alarms`);
    }
};
