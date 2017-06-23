'use strict';

let Project = require('../../models').Project,
    errors = require('../../utils/errors'),
    Promise = require('bluebird');

exports.getProject = function(id, populate) {
  return Promise.resolve().then(function() {
    let promise = Project.findById(id);
    if (populate) {
      promise.populate(populate);
    }
    return promise.exec();
  }).then(function(project) {
    if (!project) {
      throw errors.notFoundError('project.doesNotExist', 'Project does not exist');
    }
    return project;
  });
};