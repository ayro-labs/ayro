const properties = require('./properties');
const logger = require('../utils/logger');
const path = require('path');

exports.env = properties.getValue('app.env', 'development');

exports.port = properties.getValue('app.port', 3000);

exports.debug = properties.getValue('app.debug', false);

exports.publicPath = properties.getValue('app.publicPath', path.join(__dirname, '../public'));

exports.appIconPath = properties.getValue('app.appIconPath', path.join(this.publicPath, 'img/apps'));

exports.accountLogoPath = properties.getValue('app.accountLogoPath', path.join(this.publicPath, 'img/accounts'));

exports.domain = 'chatz.io';

exports.session = {
  secret: 'chatz.io',
  prefix: 'session:',
  requestHeader: 'token',
  maxAge: Number.MAX_SAFE_INTEGER,
};

exports.database = {
  host: properties.getValue('database.host', 'localhost'),
  port: properties.getValue('database.port', 27017),
  schema: properties.getValue('database.schema', 'chatz'),
  debug: properties.getValue('database.debug', false),
};

exports.redis = {
  host: properties.getValue('redis.host', 'localhost'),
  port: properties.getValue('redis.port', 6379),
  password: properties.getValue('redis.password'),
};

exports.webcm = {
  host: properties.getValue('webcm.host', '0.0.0.0'),
  port: properties.getValue('webcm.port', 3100),
  pubSub: {
    host: properties.getValue('webcm.pubSub.host', '0.0.0.0'),
    port: properties.getValue('webcm.pubSub.port', 3102),
  },
};

exports.slack = {
  clientId: '4332799729.201066840038',
  clientSecret: '1d8e1127054e9577da4cc6e25b83e74e',
  verificationToken: 'tHYsNNTDP00nL2HlqhAdEraQ',
};

logger.info('Using %s environment settings', this.env);
logger.info('Debug mode is %s', this.debug ? 'ON' : 'OFF');
