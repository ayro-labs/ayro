const settings = require('../configs/settings');
const Promise = require('bluebird');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const uuid = require('uuid').v4;

const $ = this;

const ALGORITHM = 'aes-256-ctr';
const ENCODING_UTF8 = 'utf8';
const ENCODING_HEX = 'hex';

const randomBytesAsync = Promise.promisify(crypto.randomBytes);
const hashAsync = Promise.promisify(bcrypt.hash);
const compareAsync = Promise.promisify(bcrypt.compare);

exports.uuid = () => {
  return uuid().replace(/-/g, '');
};

exports.token = () => {
  return randomBytesAsync(20).then((buffer) => {
    return buffer.toString(ENCODING_HEX);
  });
};

exports.hash = (data) => {
  return hashAsync(data, 10);
};

exports.compare = (data, hash) => {
  return compareAsync(data, hash);
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
