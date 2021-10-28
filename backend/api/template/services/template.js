'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */
var dayjs = require('dayjs')
const util = require('util')

module.exports = {

    async checkAlarms() {
        let alarmsCounter=0;
        // const overdueAlarms = await strapi.query('template').find({ausgeloest:false,ausloesen_um_lt: new Date()});

        const overdueAlarms = (await strapi
            .query('template')
            .model.query(qb => {
                qb.where('ausgeloest', false).orWhere('reminder', true);
                qb.where('ausloesen_um', '<',new Date());
            })
        .fetchAll({withRelated: ['groups', {'groups.users': qb => qb.columns('users-permissions_user.id','group_id','fcmToken')}]})).toJSON();
        // console.log(util.inspect(overdueAlarms, {showHidden: false, depth: null}));




        for (const alarm of overdueAlarms) {
            for (const group of alarm.groups) {
                for (const user of group.users) {
                    console.log(user);
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
