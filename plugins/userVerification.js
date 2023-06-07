const fp = require('fastify-plugin');

const userVerification = async function (fastify, opts) {
  fastify.decorate('isLoggedIn', async function (request, reply) {
    if (request.session.user) {
      await reply.redirect('/api/v1/tasks', { tab: 'Home' });
    }
  });
};

module.exports = fp(userVerification);
