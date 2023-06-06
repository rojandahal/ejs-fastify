'use strict';
const { setUserOpts } = require('../../controller/schema/userSchema');

const { setUser } = require('../../controller/handler/userHandler');

module.exports = async function (fastify, opts) {
  fastify.post('/', {
    handler: setUser,
  });

  fastify.get('/', async function (req, reply) {
    await reply.view('/signup.ejs', { tab: 'Signup' }); // Pass the message to the template
  });
};
