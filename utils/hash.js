'use strict';

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

exports.token = async () => {
  const buffer = await randomBytesAsync(20);
  return buffer.toString(ENCODING_HEX);
};

exports.hash = async (data) => {
  return hashAsync(data, 10);
};

exports.compare = async (data, hash) => {
  return compareAsync(data, hash);
};

exports.encryptSync = (text) => {
  const cipher = crypto.createCipher(ALGORITHM, settings.domain);
  let crypted = cipher.update(text, ENCODING_UTF8, ENCODING_HEX);
  crypted += cipher.final(ENCODING_HEX);
  return crypted;
};

exports.encrypt = async (text) => {
  return $.encryptSync(text);
};

exports.decrypt = async (text) => {
  const decipher = crypto.createDecipher(ALGORITHM, settings.domain);
  let decrypted = decipher.update(text, ENCODING_HEX, ENCODING_UTF8);
  decrypted += decipher.final(ENCODING_UTF8);
  return decrypted;
};
