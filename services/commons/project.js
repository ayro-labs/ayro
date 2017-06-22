'use strict';

let Project = require('../../models').Project,
    errors = require('../../utils/errors');

exports.getProject = function(id, populate) {
  return Project.findById(id).populate(populate).exec().then(function(project) {
    if (!project) {
      throw errors.notFoundError('project.doesNotExist', 'Project does not exist');
    }
    return project;
  });
};