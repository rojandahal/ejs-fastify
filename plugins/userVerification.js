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
    const username = await req.server.user.findOne({
      where: { id: req.session.user },
    });
    if (req.url === '/api/v1/tasks') {
      reply.locals.username = username.dataValues.username;
      reply.locals.loggedIn = true;
      return;
    }
    reply.locals.username = username.dataValues.username;
    reply.locals.loggedIn = true;
    reply.redirect('/api/v1/tasks');
    return;
  });
};

module.exports = fp(userVerification);
