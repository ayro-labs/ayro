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

exports.mongo = {
  host: properties.getValue('mongo.host', 'localhost'),
  port: properties.getValue('mongo.port', 27017),
  debug: properties.getValue('mongo.debug', false),
  schema: properties.getValue('mongo.schema', 'chatz'),
  username: properties.getValue('mongo.username'),
  password: properties.getValue('mongo.password'),
};

exports.redis = {
  host: properties.getValue('redis.host', 'localhost'),
  port: properties.getValue('redis.port', 6379),
  password: properties.getValue('redis.password'),
};

exports.webcm = {
  host: properties.getValue('webcm.host', 'localhost'),
  port: properties.getValue('webcm.port', 3100),
  pubSub: {
    host: properties.getValue('webcm.pubSub.host', 'localhost'),
    port: properties.getValue('webcm.pubSub.port', 3102),
  },
};

exports.facebook = {
  appId: '1577343385621250',
  appSecret: '28a2b0321aec6799be5f0e884431f626',
};

exports.messenger = {
  pageToken: 'EAAWaleAwUwIBANNlqHDrZA7xZA2gu4bXEjtvwqC33k3NU6QzcZANwXUiOuqynPZBBq8JnEZCEwhUIYye4oKbEsodU5XwcsmwGR9ikZAISV7G0BNVNDsRDhRAgfa52a3YvJPGwHLq7aiGzCabdxDh5TnnlIqJAwUrajsNnWDEhRxAZDZD',
  verificationToken: '9f28f2cff653df1e950f4808213b800d7acd9fe0',
};

exports.slack = {
  clientId: '238285510608.246046996448',
  clientSecret: 'a10204a6416c5e4b50a1209c6380568f',
  verificationToken: '5aRssO4wD1yjYeyfDNuA6np2',
};

if (properties.getValue('https')) {
  exports.https = {
    key: properties.getValue('https.key'),
    cert: properties.getValue('https.cert'),
  };
}

if (this.env === 'production' && !this.https) {
  throw new Error('Https is required when running in production environment');
}

logger.info('Using %s environment settings', this.env);
logger.info('Debug mode is %s', this.debug ? 'ON' : 'OFF');
