const settings = require('../configs/settings');
const Promise = require('bluebird');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const $ = this;

const ALGORITHM = 'aes-256-ctr';
const ENCODING_UTF8 = 'utf8';
const ENCODING_HEX = 'hex';

exports.hash = (data) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(data, 10, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
};

exports.compare = (data, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(data, hash, (err, equals) => {
      if (err) {
        reject(err);
      } else {
        resolve(equals);
      }
    });
  });
};

exports.encryptSync = (text) => {
  const cipher = crypto.createCipher(ALGORITHM, settings.domain);
  let crypted = cipher.update(text, ENCODING_UTF8, ENCODING_HEX);
  crypted += cipher.final(ENCODING_HEX);
  return crypted;
};

exports.encrypt = (text) => {
  return new Promise((resolve) => {
    resolve($.encryptSync(text));
  });
};

exports.decrypt = (text) => {
  return new Promise((resolve) => {
    const decipher = crypto.createDecipher(ALGORITHM, settings.domain);
    let decrypted = decipher.update(text, ENCODING_HEX, ENCODING_UTF8);
    decrypted += decipher.final(ENCODING_UTF8);
    resolve(decrypted);
  });
};

exports.generateId = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString(ENCODING_HEX));
      }
    });
  });
};
