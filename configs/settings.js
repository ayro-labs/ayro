'use strict';

let properties = require('./properties'),
    logger = require('../utils/logger'),
    path = require('path');

exports.env = properties.getValue('app.env', 'development');

exports.port = properties.getValue('app.port', 3000);

exports.debug = properties.getValue('app.debug', false);

exports.publicPath = properties.getValue('app.publicPath', path.join(__dirname, '../public'));

exports.domain = 'chatz.io';

exports.website = 'www.' + this.domain;

exports.websiteHttps = 'https://' + this.website;

exports.session = {
  secret: 'chatz.io',
  prefix: 'session:',
  requestHeader: 'token',
  maxAge: Number.MAX_SAFE_INTEGER
};

exports.database = {
  host: properties.getValue('database.host', 'localhost'),
  port: properties.getValue('database.port', 27017),
  schema: properties.getValue('database.schema', 'chatz')
};

exports.redis = {
  host: properties.getValue('redis.host', 'localhost'),
  port: properties.getValue('redis.port', 6379),
  password: properties.getValue('redis.password')
};

exports.notifier = {
  host: properties.getValue('notifier.host', '0.0.0.0'),
  port: properties.getValue('notifier.port', 3100),
  pubSub: {
    host: properties.getValue('notifier.pubSub.host', '0.0.0.0'),
    port: properties.getValue('notifier.pubSub.port', 3102)
  }
};

exports.slack = {
  clientId: '4332799729.201066840038',
  clientSecret: '1d8e1127054e9577da4cc6e25b83e74e',
  verificationToken: 'tHYsNNTDP00nL2HlqhAdEraQ'
};

logger.info('Using %s environment settings', this.env);
logger.info('Debug mode is %s', this.debug ? 'ON' : 'OFF');