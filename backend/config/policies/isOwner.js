var pluralize = require('pluralize')

const getDescendantProp = (obj, path) => (
    path.split('.').reduce((acc, part) => acc && acc[part], obj)
);
const getRootObject = (obj) => (
    obj.split('.')[0]
);

module.exports = async (ctx, ownerPath, response) => {
    try {

        let errMsg = "You are not allowed to perform this action.";
        const currentUser = ctx.state.user;

        //current user is admin
        if(currentUser.roles?.findIndex(role => role.code==='strapi-super-admin')>-1)
            return ctx.query;


        const { id } = await strapi.plugins['users-permissions'].services.jwt.getToken(ctx);

        if (typeof id === "undefined" || id === null) {
            return ctx.unauthorized(`${errMsg} [1]`);
        }

        // [find.one] Only query entities that owned by the current user
        if (ctx.request.method === 'GET') {
            if (Object.prototype.toString.call(response) === '[object Object]') {
                
                const prop = getDescendantProp(response,ownerPath);
                if (typeof prop === "undefined" || prop === null || prop.toString() !== id.toString()) {
                    return ctx.unauthorized(`${errMsg} [3]`);
                }
            }else{
                // [find, count] Only query entities that owned by the current user
                // Remove everything about owner in the query eg. owner.id_in, owner.id, owner etc.
                for (let key in ctx.query) {
                    if (key.includes("owner") || key.includes("user")) {
                        delete ctx.query[key];
                    }
                }

                // Reset owner.id to current user id
                return { ...ctx.query, [ownerPath]: id.toString() };
            }
        }



        // [update, delete] Check owner of an existing entity
        if ((ctx.request.method === 'DELETE' || ctx.request.method === 'PUT') && typeof ctx.params !== "undefined" && ctx.params !== null && typeof ctx.params.id !== "undefined" && ctx.params.id !== null && ctx.params.id !== '') {
            // Extract model name from request path eg. /messages/15
            var modelName = ctx.request.path.match(/^\/(.*)\/\d*$/);
            if (Array.isArray(modelName) === false || modelName.length !== 2 || modelName[1] === '') {
                return ctx.unauthorized(`Invalid request ${ctx.request.path}`);
            }
            // Get existing entity and check for ownership
            //was strapi.query(pluralize.singular(modelName[1])) before
            let existingEntity = await strapi.query(modelName[1]).findOne({
                id: ctx.params.id
            });
            if (typeof existingEntity === "undefined" || existingEntity === null) {
                return ctx.notFound('Not Found');
            }
            const prop = getDescendantProp(existingEntity,ownerPath);

            if (typeof prop === "undefined" || prop === null || prop.toString() !== id.toString()) {
                return ctx.unauthorized(`${errMsg} [2]`);
            }

            // Set owner to current user
            return { ...ctx.request.body, [ownerPath]: id.toString() };
        }

        // [create] Set owner for a new entity
        if (ctx.request.method === 'POST') {
            if(ctx.originalUrl==='/graphql' && ctx.query){
                //TODO: Test this
                /**
                 query {
                    integrations(where:{settings_contains:"\"deviceId\":\"test123\""}) {
                        id,
                        name,
                        type,
                        settings
                    }
                    }
                 */
                return { ...ctx.query, [ownerPath]: id.toString() };
            }else{
                //TODO: test this
                //integration rest create PASSED
                return { ...ctx.request.body, [getRootObject(ownerPath)]: id.toString() };
            }
        }



    } catch (error) {
        console.log("error", error);
        return ctx.unauthorized(error);
    }

};