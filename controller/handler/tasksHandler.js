'use strict';

const setTasks = async (req, reply) => {
  const taskDetails = req.body;
  console.log(req.body);
  const userId = req.session.user;
  const user = { ...taskDetails, user: userId };
  const task = await req.server.task.create(user);
  reply.redirect('/api/v1/tasks');
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
      tasks: [],
      message: 'No tasks found',
    });
    return;
  }

  // task.map((task) => console.log(task.dataValues));
  await reply.view('/tasks.ejs', { tab: 'Tasks', tasks: task, message: '' });
};

module.exports = {
  setTasks,
  updateTasks,
  getTask,
};
