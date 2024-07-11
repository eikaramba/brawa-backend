"use strict";

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

/**
 *
SELECT json_agg(json_build_object('email', email, 'group', '2')) FROM public.participations
left join public.users on participations."userId" = users.id
WHERE participations.uuid in (
  ...
)

then copy straight from data output the row to /repo/import.json
 */
module.exports = async () => {
  try {
    var json = require("fs").readFileSync("./public/uploads/import.json", "utf8");
    // if file exists
    if (json) {
      console.log("creating users from import.json");
      var data = JSON.parse(json);
      for (const user of data) {
        try {
          const existing = await strapi
            .query("user", "users-permissions")
            .find({ email: user.email });
          if (existing.length == 0) {
              const obj = {
                blocked: false,
                confirmed: true,
                username: user.email,
                email: user.email,
                password: user.email, //will be hashed automatically
                provider: "local", //provider
                created_by: 1, //user admin id
                updated_by: 1, //user admin id
                role: 1 //role id
              };
              if(user.group){
                  //if group is of type array
                    if(Array.isArray(user.group)){
                        obj.groups = user.group;
                    }else{
                        obj.groups = [user.group];
                    }
              }
            await strapi.plugins["users-permissions"].services.user.add(obj);
          }else{
            if(user.group){
              //if group is of type array
              if(Array.isArray(user.group)){
                existing[0].groups = [...existing[0].groups,...user.group];
              }else{
                existing[0].groups = [...existing[0].groups,user.group];
              }
              await strapi.query('user', 'users-permissions').update({id:existing[0].id}, existing[0]);
            }
          }
        } catch (err) {
          console.error("error creating user", err);
        }
      }
    }
  } catch (err) {}
  // await strapi.api.template.services.template.checkAlarms();
};
