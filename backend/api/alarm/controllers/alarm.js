'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
 const { sanitizeEntity } = require('strapi-utils');
 
 module.exports = {

    // async create(ctx) {
    //   let entity = await strapi.services.alarm.create(ctx.request.body);
    //   return sanitizeEntity(entity, { model: strapi.models.alarm });
    // },

    async addModuleResult(ctx) {
      const { id,moduleStep } = ctx.params;
      if(ctx.request.body.results) {
        const currentEntry = await strapi.query('alarm').findOne({id}, ['moduleResults']);
        //iterate over currentEntry.moduleResults and check if the moduleStep is already in there. If yes, update the result, if not add it
        if(currentEntry.moduleResults) {
          currentEntry.moduleResults.forEach((entry) => {
            if(entry.moduleStep === moduleStep) {
              entry.results = ctx.request.body.results;
              entry.moduleId = ctx.request.body.moduleId;
              entry.submitted_at = ctx.request.body.submitted_at;
            }
          });
        }
        else {
          currentEntry.moduleResults = [{
            moduleStep,
            ...ctx.request.body
          }];
        }
        await strapi.query('alarm').update({id}, currentEntry);
        
      }
      return {}
    },

    async update(ctx) {
      const { id } = ctx.params;

      if(ctx.request.body.opened_at) {
        const currentEntry = await strapi.query('alarm').findOne({id}, ['opened_at']);
        if(currentEntry.opened_at) delete ctx.request.body.opened_at
      }
  
      let entity = await strapi.services.alarm.update({ id }, ctx.request.body);
  
      return sanitizeEntity(entity, { model: strapi.models.alarm });
    },
  };