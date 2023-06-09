const fastifyPlugin = require('fastify-plugin');
const nodemailer = require('nodemailer');

const mailPlugin = async function (fastify, opts) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });

  // const info = transporter.sendMail(
  //   {
  //     from: '"Rojan Dahal 👻"',
  //     to: 'mr.dahalrojan@gmail.com',
  //     subject: 'Hello ✔',
  //     text: 'Hello world?',
  //     html: '<b>Hello world?</b>',
  //   },
  //   (err, info) => {
  //     if (err) {
  //       console.error(err);
  //     } else {
  //       console.log(info);
  //     }
  //   },
  // );

  // console.log('Message sent: %s', info.messageId);

  // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

  fastify.decorate('transporter', transporter);
};

module.exports = fastifyPlugin(mailPlugin);
