const crypto = require('crypto');

//Login User
const loginUser = async (req, reply) => {
  const { username, password } = req.body;
  const userModel = req.server.user;
  const hash = crypto.createHash('sha256');
  hash.update(password);
  const hashedPw = hash.digest('hex');

  try {
    const row = await userModel.findOne({ where: { username: username } });
    if (row) {
      if (row.password === hashedPw) {
        // const token = req.server.jwt.sign({
        //   id: row.id,
        //   username: row.username,
        // });
        req.session.user = row.id;
        // Set the token as a cookie
        // reply.setCookie('token', token, {
        //   expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
        // });
        const token = await reply.generateCsrf({
          userInfo: req.session.user,
        });
        req.session.csrfToken = token;
        reply.redirect('/api/v1/tasks');
      } else {
        await reply.view('/login.ejs', {
          tab: 'Login',
          message: 'Invalid email or password',
        });
      }
    } else {
      await reply.view('/login.ejs', {
        tab: 'Login',
        message: 'User not found',
      });
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

//Logout User
const logoutUser = async (req, reply) => {
  // Delete the session from the session store
  try {
    // Clear the token and session cookie
    await req.session.destroy();
    reply.clearCookie('sessionId');
    reply.redirect('/api/v1/');
    return;
  } catch (error) {
    console.error('Error deleting session:', error);
    reply.send({ error: 'An error occurred during logout' });
  }
};

module.exports = { loginUser, logoutUser };
