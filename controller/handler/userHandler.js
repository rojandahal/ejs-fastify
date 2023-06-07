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
  otp = Math.floor(100000 + Math.random() * 900000);
  user.otp = otp;

  try {
    const row = await userModel.create(user);
    fastify.transporter.sendMail(
      {
        from: '"Rojan Dahal 👻"',
        to: user.email,
        text: `Don't share this otp with anyone.`,
        subject: 'User Registration OTP ✔',
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    		<div style="margin:50px auto;width:70%;padding:20px 0">
    			<div style="border-bottom:1px solid #eee">
    				<a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Rojan Dahal Node App</a>
    			</div>
    			<p style="font-size:1.1em">Hi,</p>
    			<p>Thank you for choosing us. Use the following OTP to complete your Sign Up procedures.</p>
    			<h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    			<p style="font-size:0.9em;">Regards,<br />Your Brand</p>
    			<hr style="border:none;border-top:1px solid #eee" />
    			<div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
    				<p>Node App Inc</p>
    				<p>Baneshwor, Kathmandu</p>
    				<p>Nepal</p>
    			</div>
    		</div>
    	</div>`,
      },
      async (err, info) => {
        if (err) {
          console.error(err);
        } else {
          console.log(info);
        }
      },
    );
    reply.redirect('/api/v1');
    return;
  } catch (error) {
    console.error(error);
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
