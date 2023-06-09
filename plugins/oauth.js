const fastifyPlugin = require('fastify-plugin');
const oauthPlugin = require('@fastify/oauth2');
const sget = require('simple-get');
const crypto = require('crypto');
const { v4: uuid_v4 } = require('uuid');

const oauth = fastifyPlugin(async function (fastify, opts) {
  fastify.register(oauthPlugin, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: process.env.GOOGLE_OAUTH_CLIENT_ID,
        secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      },
      auth: oauthPlugin.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: `${process.env.API_VERSION}/login/google`,
    callbackUri: `${process.env.baseURL}${process.env.API_VERSION}/login/google/callback`,
    callbackUriParams: {
      // custom query param that will be passed to callbackUri
      access_type: 'offline', // will tell Google to send a refreshToken too
    },
  });

  function isGoogleTokenExpired(token) {
    const currentTime = new Date(); // Convert to seconds
    const expirationTime = new Date(token.expires_at);
    console.log(currentTime > expirationTime);
    return currentTime > expirationTime;
  }

  fastify.decorate('authenticate', async function (req, reply, done) {
    const token = req.session.token;
    const user = req.session.user;
    console.log(user);
    if (user === undefined) {
      reply.code(401).send({ error: 'Unauthorized User' });
      return done();
    }
    if (token !== undefined) {
      if (isGoogleTokenExpired(token)) {
        req.server.googleOAuth2.getNewAccessTokenUsingRefreshToken(
          req.session.token,
          {
            scope: ['profile', 'email'],
          },
          (err, accessToken) => {
            if (err) {
              reply.send(err);
              return;
            }
            const refresh_token = req.session.token.refresh_token;
            const newToken = {
              ...accessToken.token,
              refresh_token: refresh_token,
            };
            req.session.token = newToken;
            reply.redirect(
              `${process.env.baseURL}${process.env.API_VERSION}/users`,
            );
          },
        );
      }
    }
    done();
  });

  //Get User details and also save the user details in database
  const verifyUser = async (req, result) => {
    const access_token = result.access_token;

    return new Promise((resolve, reject) => {
      sget.concat(
        {
          url: 'https://www.googleapis.com/oauth2/v2/userinfo',
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + access_token,
          },
          json: true,
        },
        async function (err, res, data) {
          if (err) {
            reject(err);
            return;
          }
          // console.log(data);
          //Create random hashed password as login is done through google
          const hash = crypto.createHash('sha256');
          const id = uuid_v4();
          hash.update(id);
          const hashedPw = hash.digest('hex');

          try {
            const [user, created] = await req.server.user.findOrCreate({
              where: {
                email: data.email,
              },
              defaults: {
                username: (
                  data.given_name.toLowerCase() +
                  data.family_name.toLowerCase() +
                  Math.floor(Math.random() * 900 + 100)
                ).toLowerCase(),
                email: data.email,
                password: hashedPw,
                otp: 0,
                verified: true,
              },
            });
            resolve(user.dataValues);
          } catch (error) {
            console.error(error);
            throw new Error(error.errors[0].message);
          }
        },
      );
    });
  };

  fastify.decorate('verifyUser', verifyUser);
});

module.exports = oauth;
