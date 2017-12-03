const properties = require('./properties');
const logger = require('../utils/logger');
const files = require('../utils/files');
const path = require('path');

exports.env = properties.getValue('app.env', 'development');
exports.port = properties.getValue('app.port', 3000);
exports.debug = properties.getValue('app.debug', false);

exports.publicUrl = this.env === 'production' ? 'https://api.ayro.io' : `http://localhost:${this.port}`;
exports.publicPath = properties.getValue('app.publicPath', path.join(__dirname, '../public'));

exports.appIconUrl = `${this.publicUrl}/img/apps`;
exports.appIconPath = path.join(this.publicPath, 'img/apps');

exports.accountLogoUrl = `${this.publicUrl}/img/accounts`;
exports.accountLogoPath = path.join(this.publicPath, 'img/accounts');

exports.userPhotoUrl = `${this.publicUrl}/img/users`;
exports.userPhotoPath = path.join(this.publicPath, 'img/users');

exports.webcmUrl = properties.getValue('webcm.url', this.env === 'production' ? 'https://webcm.ayro.io:3100' : 'http://localhost:3100');

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

exports.facebook = {
  appId: '2149355741952296',
  appSecret: 'ddd354f9a28d85876bda6a03594aae7b',
};

exports.messenger = {
  pageToken: 'EAAei0ZBFZBuSgBABnjH355XjzZAY1YagKBsSAfjDF85TXrvtZBwnKZCr5OTSQuHCmS4dfv8OZAzJnqNvlYuMDp1HRN0ylvJOVKzDGAqnbcr1pAgz6Y2a9k65QrDnMuW4jtHgqBMcQE7m1zeKduzUbNESXGRhxhqEziGnhJT92eBAZDZD',
  verificationToken: '36e7c68cd97b9290475365ff8aef950f0dc0fd62',
};

exports.slack = {
  clientId: '277516112707.277074206417',
  clientSecret: '62026310b3b8841342854eb14f65ae70',
  verificationToken: 'BVUOTnQlEn5vBZQG6AaACegL',
};

files.createDir(this.publicPath);
files.createDir(this.appIconPath);
files.createDir(this.accountLogoPath);
files.createDir(this.userPhotoPath);

logger.info('Using %s environment settings', this.env);
logger.info('Debug mode is %s', this.debug ? 'ON' : 'OFF');
