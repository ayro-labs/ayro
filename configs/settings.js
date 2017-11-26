const properties = require('./properties');
const logger = require('../utils/logger');
const files = require('../utils/files');
const path = require('path');

exports.env = properties.getValue('app.env', 'development');
exports.port = properties.getValue('app.port', 3000);
exports.debug = properties.getValue('app.debug', false);

exports.publicPath = properties.getValue('app.publicPath', path.join(__dirname, '../public'));
exports.publicUrl = this.env === 'production' ? 'https://api.ayro.io' : `http://localhost:${this.port}`;

exports.appIconPath = path.join(this.publicPath, 'img/apps');
exports.appIconUrl = `${this.publicUrl}/img/apps`;

exports.accountLogoPath = path.join(this.publicPath, 'img/accounts');
exports.accountLogoUrl = `${this.publicUrl}/img/accounts`;

exports.userPhotoPath = path.join(this.publicPath, 'img/users');
exports.userPhotoUrl = `${this.publicUrl}/img/users`;

exports.domain = 'ayro.io';

exports.session = {
  secret: 'ayro.io',
  prefix: 'session:',
  requestHeader: 'token',
  maxAge: Number.MAX_SAFE_INTEGER,
};

exports.mongo = {
  host: properties.getValue('mongo.host', 'localhost'),
  port: properties.getValue('mongo.port', 27017),
  debug: properties.getValue('mongo.debug', false),
  schema: properties.getValue('mongo.schema', 'ayro'),
  username: properties.getValue('mongo.username', 'ayro'),
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
  appId: '2149355741952296',
  appSecret: 'ddd354f9a28d85876bda6a03594aae7b',
};

exports.messenger = {
  pageToken: 'EAAei0ZBFZBuSgBABnjH355XjzZAY1YagKBsSAfjDF85TXrvtZBwnKZCr5OTSQuHCmS4dfv8OZAzJnqNvlYuMDp1HRN0ylvJOVKzDGAqnbcr1pAgz6Y2a9k65QrDnMuW4jtHgqBMcQE7m1zeKduzUbNESXGRhxhqEziGnhJT92eBAZDZD',
  verificationToken: '36e7c68cd97b9290475365ff8aef950f0dc0fd62',
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

files.createDir(this.publicPath);
files.createDir(this.appIconPath);
files.createDir(this.accountLogoPath);
files.createDir(this.userPhotoPath);

logger.info('Using %s environment settings', this.env);
logger.info('Debug mode is %s', this.debug ? 'ON' : 'OFF');
