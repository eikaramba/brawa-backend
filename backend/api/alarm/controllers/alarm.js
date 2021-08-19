'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
 const { sanitizeEntity } = require('strapi-utils');
 const isOwner = require("../../../config/policies/isOwner");
 
 const ownerPath = "user.id";
 module.exports = {

  async find(ctx) {
    ctx.query = await isOwner(ctx, ownerPath); //custom code to prevent access
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.alarm.search(ctx.query);
    } else {
      entities = await strapi.services.alarm.find(ctx.query);
    }

    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.alarm }));
  },
  async findOne(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.alarm.findOne({ id });
    await isOwner(ctx, ownerPath, entity); //custom code to prevent access
    return sanitizeEntity(entity, { model: strapi.models.alarm });
  },

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
      if(!id) return;

      if(ctx.request.body.opened_at) {
        const currentEntry = await strapi.query('alarm').findOne({id}, ['opened_at']);
        if(!currentEntry) return;
        if(currentEntry.opened_at) delete ctx.request.body.opened_at
      }
  
      let entity = await strapi.services.alarm.update({ id }, ctx.request.body);
  
      return sanitizeEntity(entity, { model: strapi.models.alarm });
    },
  };