'use strict';

let integrations = require('.'),
    constants = require('../../utils/constants'),
    _ = require('lodash');

const CONFIG_IOS = [];

exports.add = function(app, configuration) {
  return integrations.add(app, constants.integration.types.IOS, constants.integration.channels.USER, _.pick(configuration, CONFIG_IOS));
};

exports.update = function(app, configuration)   {
  return integrations.update(app, constants.integration.types.IOS, _.pick(configuration, CONFIG_IOS));
};

exports.remove = function(app)   {
  return integrations.remove(app, constants.integration.types.IOS);
};