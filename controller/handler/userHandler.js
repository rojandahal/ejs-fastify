const crypto = require('crypto');

//Create a new User
const setUser = async (req, reply) => {
  const fastify = req.server;
  const userModel = fastify.user;
  const user = req.body;
  const hash = crypto.createHash('sha256');

  hash.update(user.password);
  const hashedPw = hash.digest('hex');
  user.password = hashedPw;

  try {
    const row = await userModel.create(user);
    req.session.user = row.id;
    // const token = req.server.jwt.sign(row);
    // Set the token as a cookie
    // reply.setCookie('token', token, {
    //   path: '/api/v1',
    //   expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
    // });
    await reply.view('/index.ejs', {
      tab: 'Home',
      title: 'Task Application',
      loggedIn: true,
    });
  } catch (error) {
    await reply.view('/signup.ejs', {
      tab: 'Signup',
      loggedIn: false,
      message: error.errors[0].message,
    });
  }
};

//Get All users
const getUsers = async (req, reply) => {
  const fastify = req.server;
  const userModel = fastify.user;
  try {
    const users = await userModel.findAll();
    return users;
  } catch (error) {
    console.error(error);
    throw new Error(error.errors[0].message);
  }
};

//Update user details (username)
const updateUsers = async (req, reply) => {
  const { id } = req.params;
  const sessionUser = req.session.user;
  // const tokenDecoded = await req.server.getUserFromToken(req, reply);

  try {
    if (id === sessionUser) {
      const user = await req.server.user.findOne({ where: { id: id } });
      const updatedUser = { username: req.body.username };
      await user.update(updatedUser);
      // const token = req.server.jwt.sign({ id: user.id, username: user.username });
      // Set the token as a cookie
      // reply.setCookie('token', token, {
      //   path: '/api/v1',
      //   expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
      // });

      reply.code(200).send('User Updated');
      return;
    } else {
      reply.code(401).send({ Unauthorized: 'Unauthorized' });
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

//Delete user and clear all cookies
const deleteUser = async (req, reply) => {
  const { id } = req.params;
  const fastify = req.server;
  const user = await fastify.user.findOne({ where: { id: id } });
  if (user === null) {
    reply.code(200).send(`User with id ${id} not found`);
    return;
  }

  const sessionUser = await fastify.user.findOne({
    where: { id: req.session.user },
  });
  // const tokenDecoded = await req.server.getUserFromToken(req, reply);

  if (user.username === sessionUser.username) {
    await user.destroy();
    await req.session.destroy();
    reply.code(200).send(`User with id ${id} Deleted successfully `);
    return;
  }
  reply.code(401).send({ Unauthorized: 'Unauthorized' });
};

//Get single user details
const getUser = async (req, reply) => {
  const { id } = req.params;
  const fastify = req.server;
  const user = await fastify.user.findOne({ where: { id: id } });

  if (user === null) {
    reply.code(200).send(`User with id ${id} not found`);
    return;
  }
  reply.code(200).send({ user });
};

//Get Own Profile
const getOwnProfile = async (req, reply) => {
  const fastify = req.server;

  await fastify
    .verifyUser(req, req.session.token)
    .then((data) => {
      reply.send({
        token: req.session.token,
        id: req.session.user,
        data: data,
      });
    })
    .catch((err) => {
      console.error(err);
      throw new Error(err);
    });
};
module.exports = {
  setUser,
  getUsers,
  updateUsers,
  deleteUser,
  getUser,
  getOwnProfile,
};
