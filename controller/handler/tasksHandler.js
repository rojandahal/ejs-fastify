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
  if (!userId) {
    reply.redirect('/api/v1');
    return;
  }

  const task = await req.server.task.findAll();
  if (task.length === 0) {
    await reply.view('/tasks.ejs', {
      tab: 'Tasks',
      tasks: 'No Tasks',
    });
    return;
  }

  // task.map((task) => console.log(task.dataValues));
  await reply.view('/tasks.ejs', { tab: 'Tasks', tasks: task });
};

module.exports = {
  setTasks,
  updateTasks,
  getTask,
};
