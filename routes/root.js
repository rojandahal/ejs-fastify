'use strict';
module.exports = async function (fastify, opts) {
  fastify.get('/', {
    handler: async function (req, reply) {
      await reply.view('/index.ejs', {
        tab: 'Home',
        title: 'Task Manager',
        username: req.session.user ? req.session.username : '',
        loggedIn: req.session.user ? true : false,
      });
    },
  });

  //Google OAuth2 Callback URL
  fastify.get('/login/google/callback', function (req, reply) {
    fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
      req,
      async (err, result) => {
        if (err) {
          reply.send(err);
          return;
        }

        let temp;
        //Get User details if not present and also save the user details in database
        await fastify
          .verifyUser(req, result.token)
          .then((data) => {
            temp = { ...result.token, userId: data.id };
          })
          .catch((err) => {
            console.error(err);
            throw new Error(err);
          });
        req.session.user = temp.userId;
        req.session.token = result;
        reply.redirect(`${process.env.baseURL}/api/v1/tasks`);
        // reply.redirect(
        //   `${process.env.baseURL}${process.env.API_VERSION}/users`,
        // );
      },
    );
  });

  fastify.get('/auth/google', function (req, reply) {
    reply.redirect('/api/v1/login/google');
  });
};
