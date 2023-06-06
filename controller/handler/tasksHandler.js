'use strict';

const setTasks = async (req, reply) => {
  const taskDetails = req.body;
  const userId = req.session.user;
  const user = { ...taskDetails, user: userId };
  const task = await req.server.task.create(user);
  reply.code(201).send({ task });
};

const updateTasks = async (req, reply) => {
  //Update Task
};

const getTask = async (req, reply) => {
  const userId = req.session.user;
  // console.log(req.body);
  const task = await req.server.task.findAll({ where: { user: userId } });
  if (task.length === 0) {
    reply.code(200).send({ msg: 'No task found' });
    return;
  }
  await reply.view('/home.ejs', { tab: 'Tasks', task });
};

module.exports = {
  setTasks,
  updateTasks,
  getTask,
};
