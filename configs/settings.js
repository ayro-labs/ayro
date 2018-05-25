'use strict';

const files = require('../utils/files');
const {configs, paths} = require('@ayro/commons');

const config = configs.load(paths.root('config.properties'));

exports.env = config.get('app.env', 'development');
exports.port = config.get('app.port', 3000);
exports.debug = config.get('app.debug', false);

exports.publicUrl = this.env === 'production' ? 'https://api.ayro.io' : `http://localhost:${this.port}`;
exports.publicPath = config.get('app.publicPath', paths.root('public'));

exports.appIconUrl = `${this.publicUrl}/img/apps`;
exports.appIconPath = paths.join(this.publicPath, 'img/apps');

exports.accountLogoUrl = `${this.publicUrl}/img/accounts`;
exports.accountLogoPath = paths.join(this.publicPath, 'img/accounts');

exports.userPhotoUrl = `${this.publicUrl}/img/users`;
exports.userPhotoPath = paths.join(this.publicPath, 'img/users');

exports.webcmUrl = config.get('webcm.url', this.env === 'production' ? 'https://webcm.ayro.io:3100' : 'http://localhost:3100');

exports.session = {
  prefix: 'session:',
  keyId: config.get('session.keyId'),
  secret: config.get('session.secret'),
  expiresIn: config.get('session.expiresIn', '24 hours'),
};

exports.mongo = {
  host: config.get('mongo.host', 'localhost'),
  port: config.get('mongo.port', 27017),
  debug: config.get('mongo.debug', false),
  schema: config.get('mongo.schema', 'ayro'),
  username: config.get('mongo.username', 'ayro'),
  password: config.get('mongo.password'),
};

exports.redis = {
  host: config.get('redis.host', 'localhost'),
  port: config.get('redis.port', 6379),
  password: config.get('redis.password'),
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

files.createDirSync(this.publicPath);
files.createDirSync(this.appIconPath);
files.createDirSync(this.accountLogoPath);
files.createDirSync(this.userPhotoPath);

if (!this.session.keyId) {
  throw new Error('Property session.keyId is required');
}
if (!this.session.secret) {
  throw new Error('Property session.secret is required');
}
