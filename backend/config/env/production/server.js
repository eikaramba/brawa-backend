module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  url: env("STRAPI_URL"),
  port: env.int("PORT", 1338),
  proxy: true,
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
  }
});
