'use strict';

const { loginOpts } = require('../../controller/schema/loginSchema');

const { loginUser } = require('../../controller/handler/authHandler');

module.exports = async function (fastify, opts) {
  fastify.post('/', {
    preValidation: fastify.isLoggedIn,
    handler: loginUser,
  });

  fastify.get('/', {
    onRequest: fastify.isLoggedIn,
    handler: async function (req, reply) {
      await reply.view('/login.ejs', { tab: 'Login', message: '' });
    },
  });
};
