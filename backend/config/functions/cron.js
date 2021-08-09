'use strict';

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [SECOND (optional)] [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK]
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#cron-tasks
 */

module.exports = {
  /**
   * might NOT WORK because of pm2 see https://strapi.io/documentation/developer-docs/latest/guides/scheduled-publication.html#create-a-cron-task
   */
  // '*/5 * * * *': async () => {
  //   await strapi.api.template.services.template.checkAlarms();
  // }
};
