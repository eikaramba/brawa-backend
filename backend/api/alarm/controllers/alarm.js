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