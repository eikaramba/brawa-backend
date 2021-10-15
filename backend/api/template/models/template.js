'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

 module.exports = {
    lifecycles: {
      async beforeUpdate(params, data) {
        if (params.id) {
          if (data.modules) {
            await strapi.connections.default.raw(
              `DELETE FROM modules_templates__templates_modules WHERE template_id=${params.id};`
            );
            for (const module of data.modules) {
              await strapi.connections.default.raw(
                `INSERT INTO modules_templates__templates_modules (template_id, module_id) VALUES (${params.id}, ${module});`
              );
            }
          }
        }
      },
    },
  };