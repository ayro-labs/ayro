'use strict';

let Project = require('../models').Project,
    ProjectSecretKey = require('../models').ProjectSecretKey,
    cryptography = require('../utils/cryptography'),
    modelUtils = require('../utils/model'),
    Promise = require('bluebird');

exports.createProject = function(account, name) {
  return cryptography.generateId().then(function(token) {
    let project = new Project({
      account: account._id,
      name: name,
      token: token,
      registration_date: new Date()
    });
    return modelUtils.toObject(project.save());
  });
};

exports.getProject = function(id) {
  return Project.findById(id).lean().exec();
};

exports.getProjectByToken = function(token) {
  return Project.findOne({token: token}).lean().exec();
};

exports.listProjects = function(account) {
  return Project.find({account: account._id}).lean().exec();
};