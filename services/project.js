'use strict';

let Project          = require('../models').Project,
    ProjectSecretKey = require('../models').ProjectSecretKey,
    cryptography     = require('../utils/cryptography'),
    Promise          = require('bluebird');

exports.createProject = function(account, name) {
  return cryptography.generateId().then(function(token) {
    let project = new Project({
      account: account._id,
      name: name,
      token: token,
      registration_date: new Date()
    });
    return project.save();
  });
};

exports.getProject = function(id) {
  return Project.findById(id).exec();
};

exports.getProjectByToken = function(token) {
  return Project.findOne({token: token}).exec();
};

exports.createSecretKey = function(account, project) {
  return cryptography.generateId().then(function(secret) {
    let secretKey = new ProjectSecretKey({
      project: project._id,
      secret: secret,
      registration_date: new Date()
    });
    return secretKey.save();
  });
};

exports.removeSecretKey = function(account, secretKey) {
  return ProjectSecretKey.findByIdAndRemove(secretKey._id).exec();
};