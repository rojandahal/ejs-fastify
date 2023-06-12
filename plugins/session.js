const fastifyPlugin = require('fastify-plugin');
const session = require('@fastify/session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const sessionConnect = async (fastify, opts) => {
  //Register session plugin
  // const pool = new Pool({
  //   connectionString: process.env.DB_CONNECTION_STRING, // Replace with your PostgreSQL connection details
  // });
  const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
		ssl: {
			rejectUnauthorized: false,
		},
  });

  fastify.register(session, {
    secret: process.env.SESSION_SECRET,
    cookie: {
      path: '/',
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // Session expiration time (in milliseconds)
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
    },
    saveUninitialized: false,
    store: new pgSession({
      pool,
      tableName: 'sessions', // Name of the session table in the database
      createTableIfMissing: true, // Disable table creation if missing
			pruneSessionInterval: 60 * 60 * 24 * 7, // prune expired sessions every 7 days
    }),
  });

  fastify.register(require('@fastify/csrf-protection'), {
    getUserInfo: (req) => req.session.user,
    getToken: (req) => req.session.csrfToken,
    sessionPlugin: '@fastify/session',
  });
};
// const fastifyPlugin = require('fastify-plugin');
// const session = require('fastify-session');

// const sessionConnect = async (fastify, opts) => {

// }

module.exports = fastifyPlugin(sessionConnect);
