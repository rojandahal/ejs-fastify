'use strict';

const {
  getTask,
  setTasks,
  updateTasks,
} = require('../../controller/handler/tasksHandler');

module.exports = async function (fastify, opts) {
  fastify.get('/', {
    handler: getTask,
  });

  fastify.post('/', {
    handler: setTasks,
  });

  fastify.put('/', {
    handler: updateTasks,
  });
};
