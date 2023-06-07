const fp = require('fastify-plugin');

const userVerification = async function (fastify, opts) {
  fastify.decorate('isLoggedIn', async function (req, reply) {
    reply.locals
      ? (reply.locals.loggedIn = false)
      : (reply.locals = { loggedIn: false });

    if (!req.session.user) {
      reply.locals.loggedIn = false;
      return;
    }

    if (req.url === '/api/v1/tasks') {
      reply.locals.loggedIn = true;
      return;
    }
    reply.locals.loggedIn = true;
    reply.redirect('/api/v1/tasks');
    return;
  });
};

module.exports = fp(userVerification);
