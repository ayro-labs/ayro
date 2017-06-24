'use strict';

let integrations = require('.'),
    constants = require('../../utils/constants'),
    _ = require('lodash');

const CONFIG_WEBSITE = [];

exports.add = function(app, configuration) {
  return integrations.add(app, constants.integration.types.WEBSITE, constants.integration.channels.USER, _.pick(configuration, CONFIG_WEBSITE));
};

exports.update = function(app, configuration)   {
  return integrations.update(app, constants.integration.types.WEBSITE, _.pick(configuration, CONFIG_WEBSITE));
};

exports.remove = function(app)   {
  return integrations.remove(app, constants.integration.types.WEBSITE);
};