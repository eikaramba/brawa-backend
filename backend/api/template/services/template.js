'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */
var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
const util = require('util')

module.exports = {

    async checkAlarms() {
        let alarmsCounter=0;
        const overdueAlarms = (await strapi
            .query('template')
            .model.query(qb => {
                // qb.whereRaw("published_at IS NOT NULL AND (ausgeloest = false OR reminder=true) AND DATETIME(ROUND(ausloesen_um / 1000), 'unixepoch')  < datetime(?)", [dayjs().format().toString()])
                qb.whereRaw("published_at IS NOT NULL AND (ausgeloest = false OR reminder=true) AND ausloesen_um <= ?", [dayjs().valueOf()])
            })
        .fetchAll({withRelated: ['groups', {'groups.users': qb => qb.columns('users-permissions_user.id','group_id','fcmToken')}]})).toJSON();
        // console.log(util.inspect(overdueAlarms, {showHidden: false, depth: null}));



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
            const update = {
                ausgeloest: true,
                ausgeloest_um: new Date()
            };

            if(alarm.reminder) {
                update.ausloesen_um = dayjs().add(alarm.reminder_schedule, 'day').toDate()
            }
            await strapi.query('template').update({ id: alarm.id }, update );
        }
        if(overdueAlarms.length>0)
        console.log(`created ${alarmsCounter} alarms`);
    }
};
