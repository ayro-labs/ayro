'use strict';

let settings = require('../configs/settings'),
    Promise = require('bluebird'),
    bcrypt = require('bcrypt'),
    crypto = require('crypto'),
    $ = this;

const ALGORITHM = 'aes-256-ctr';

exports.hash = function(data) {
  return new Promise(function(resolve, reject) {
    bcrypt.hash(data, 10, function(err, hash) {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
};

exports.compare = function(data, hash) {
  return new Promise(function(resolve, reject) {
    bcrypt.compare(data, hash, function(err, equals) {
      if (err) {
        reject(err);
      } else {
        resolve(equals);
      }
    });
  });
};

exports.encryptSync = function(text) {
  let cipher = crypto.createCipher(ALGORITHM, settings.domain);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
};

exports.encrypt = function(text) {
  return new Promise(function(resolve, reject) {
    resolve($.encryptSync(text));
  });
};

exports.decrypt = function(text) {
  return new Promise(function(resolve, reject) {
    let decipher = crypto.createDecipher(ALGORITHM, settings.domain);
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    resolve(decrypted);
  });
};

exports.generateId = function() {
  return new Promise(function(resolve, reject) {
    crypto.randomBytes(25, function(err, buffer) {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString('hex'));
      }
    });
  });
};