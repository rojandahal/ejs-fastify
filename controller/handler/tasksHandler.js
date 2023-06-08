'use strict';

const setTasks = async (req, reply) => {
  const taskDetails = req.body;
  delete taskDetails.id;
  console.log(req.body);
  const userId = req.session.user;
  const user = { ...taskDetails, user: userId };
  const task = await req.server.task.create(user);
  await reply.redirect('/api/v1/tasks');
};

const updateTasks = async (req, reply) => {
  const taskDetails = req.body;
  const user = { ...taskDetails };
  const task = await req.server.task.update(user, {
    where: { id: taskDetails.id },
  });
  reply.redirect('/api/v1/tasks');
};

const getTask = async (req, reply) => {
  const userId = req.session.user;
  if (!userId) {
    reply.redirect('/api/v1');
    return;
  }

  const task = await req.server.task.findAll();
  await task.map(async (t) => {
    const userId = await req.server.user.findOne({ where: { id: t.user } });
    t.dataValues.username = userId.dataValues.username;
    t.dataValues.user = userId.dataValues.id;
  });

  if (task.length === 0) {
    await reply.view('/tasks.ejs', {
      tab: 'Tasks',
      tasks: [],
      message: 'No tasks found',
    });
    return;
  }

  // task.map((task) => console.log(task.dataValues));
  await reply.view('/tasks.ejs', {
    tab: 'Tasks',
    tasks: task,
    message: '',
    currentUser: userId,
  });
};

const deleteTask = async (req, reply) => {
  const { id } = req.params;
  const task = await req.server.task.destroy({ where: { id } });
  reply.redirect('/api/v1/tasks');
};

module.exports = {
  setTasks,
  updateTasks,
  getTask,
  deleteTask,
};
