const fastifyPlugin = require('fastify-plugin');
const { renderFile } = require('ejs');
const path = require('path');
const nodemailer = require('nodemailer');

const emailPlugin = fastifyPlugin(async function (fastify, opts) {
  const templatePath = path.join(
    __dirname,
    '..',
    'templates',
    'email',
    'taskAdded.ejs',
  );
  fastify.decorate('sendEmail', async function (email, subject, data) {
    console.log(data);
    const html = await renderFile(templatePath, { data });
    const info = await fastify.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: html,
    });
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
});

module.exports = emailPlugin;
