'use strict';
const { setUserOpts } = require('../../controller/schema/userSchema');

const { setUser } = require('../../controller/handler/userHandler');

module.exports = async function (fastify, opts) {
  fastify.post('/', {
    handler: setUser,
  });

  fastify.get('/', {
    onRequest: fastify.isLoggedIn,
    handler: async function (req, reply) {
      await reply.view('/signup.ejs', {
        tab: 'Signup',
        message: '',
      }); // Pass the message to the template
    },
  });

  fastify.post('/verifyotp', {
    onRequest: fastify.isLoggedIn,
    handler: async function (req, reply) {
      const userId = req.session.forVerification;
      const userModel = req.server.user;
      const { otp } = req.body;
      const row = await userModel.findOne({ where: { id: userId } });
      if (row) {
        if (row.otp === otp) {
          console.log('verification Completed');
          await row.update({ verified: true });
          req.session.user = row.id;
          const token = await reply.generateCsrf({
            userInfo: req.session.user,
          });
          req.session.csrfToken = token;
          reply.redirect('/api/v1/tasks');
        } else {
          await reply.view('/verifyotp.ejs', {
            tab: 'Verify OTP',
            message: 'Invalid OTP',
          });
        }
      } else {
        await reply.view('/verifyotp.ejs', {
          tab: 'Verify OTP',
          message: 'User not found, signup again',
        });
      }
    },
  });
};
