module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: env("STRAPI_URL", "http://localhost:1337"),
  cron: { enabled: true },
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "78e01ade2fea0d970741d45ffd5afc6d"),
    },
  },
});
