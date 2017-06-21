'use strict';

let integrations = require('.'),
    constants = require('../../utils/constants'),
    _ = require('lodash');

const CONFIG_WEBSITE = [];

exports.add = function(project, configuration) {
  return integrations.add(project, constants.integrationTypes.WEBSITE, constants.channels.USER, _.pick(configuration, CONFIG_WEBSITE));
};

exports.update = function(project, configuration)   {
  return integrations.update(project, constants.integrationTypes.WEBSITE, _.pick(configuration, CONFIG_WEBSITE));
};

exports.remove = function(project)   {
  return integrations.remove(project, constants.integrationTypes.WEBSITE);
};