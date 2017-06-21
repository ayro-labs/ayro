'use strict';

let integrations = require('.'),
    constants = require('../../utils/constants'),
    _ = require('lodash');

const CONFIG_IOS = [];

exports.add = function(project, configuration) {
  return integrations.add(project, constants.integrationTypes.IOS, constants.channels.USER, _.pick(configuration, CONFIG_IOS));
};

exports.update = function(project, configuration)   {
  return integrations.update(project, constants.integrationTypes.IOS, _.pick(configuration, CONFIG_IOS));
};

exports.remove = function(project)   {
  return integrations.remove(project, constants.integrationTypes.IOS);
};