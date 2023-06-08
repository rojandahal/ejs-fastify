'use strict';

const {
  getTask,
  setTasks,
  updateTasks,
  deleteTask,
} = require('../../controller/handler/tasksHandler');

module.exports = async function (fastify, opts) {
  fastify.get('/', {
    preValidation: fastify.isLoggedIn,
    handler: getTask,
  });

  fastify.post('/', {
    handler: setTasks,
  });

  fastify.post('/update', {
    handler: updateTasks,
  });

  fastify.delete('/:id', {
    preValidation: fastify.isLoggedIn,
    handler: deleteTask,
  });
};
