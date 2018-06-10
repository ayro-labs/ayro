'use strict';

const constants = require('utils/constants');
const {configs} = require('@ayro/commons');
const path = require('path');
const mkdirp = require('mkdirp');

const config = configs.load(path.resolve('config.yml'));

exports.env = config.get('app.env', constants.environments.DEVELOPMENT);
exports.port = config.get('app.port', 3000);
exports.debug = config.get('app.debug', false);

exports.publicUrl = this.env === constants.environments.PRODUCTION ? 'https://api.ayro.io' : `http://localhost:${this.port}`;
exports.publicPath = config.get('app.publicPath', path.resolve('public'));

exports.uploadsUrl = `${this.publicUrl}/uploads`;
exports.uploadsPath = path.join(this.publicPath, 'uploads');

exports.mediaUrl = `${this.publicUrl}/media`;
exports.mediaPath = path.join(this.publicPath, 'media');

exports.mediaS3Bucket = 'ayro-media';
exports.mediaCDNUrl = 'https://media.ayro.io';

exports.webcmUrl = config.get('webcm.url', this.env === constants.environments.PRODUCTION ? 'https://webcm.ayro.io:3100' : 'http://localhost:3100');

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

exports.aws = {
  keyId: config.get('aws.keyId'),
  secret: config.get('aws.secret'),
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

mkdirp.sync(this.publicPath);
mkdirp.sync(this.uploadsPath);
mkdirp.sync(this.mediaPath);

if (this.env === constants.environments.PRODUCTION) {
  if (!this.aws.keyId) {
    throw new Error('Property aws.keyId is required');
  }
  if (!this.aws.secret) {
    throw new Error('Property aws.secret is required');
  }
  process.env.AWS_ACCESS_KEY_ID = this.aws.keyId;
  process.env.AWS_SECRET_ACCESS_KEY = this.aws.secret;
}
if (!this.session.keyId) {
  throw new Error('Property session.keyId is required');
}
if (!this.session.secret) {
  throw new Error('Property session.secret is required');
}
