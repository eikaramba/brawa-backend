module.exports = {
  settings: {
    cors: {
      enabled: true,
      origin: ['http://localhost:3000', 'http://localhost:1337','https://app.eikaramba.de'],
      "expose": [
        "WWW-Authenticate",
        "Server-Authorization",
        "Access-Control-Expose-Headers"
      ],
      "maxAge": 31536000,
      "credentials": true,
      "methods": [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
        "HEAD"
      ],
      "headers": [
        "Content-Type",
        "Authorization",
        "X-Frame-Options",
        "Origin",
        "Access-Control-Allow-Headers",
        "access-control-allow-origin"
      ]
    },
    parser: {
      enabled: true,
      multipart: true,
      includeUnparsed: true
    }
  },
};
