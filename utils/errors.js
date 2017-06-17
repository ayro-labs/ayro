'use strict';

let settings = require('../configs/settings'),
    util = require('util');

let ChatzError = function(status, key, message, cause) {
  if (!cause && ChatzError.super_.captureStackTrace) {
    ChatzError.super_.captureStackTrace(this, this.constructor);
  } else if (cause) {
    this.stack = cause.stack;
  }
  this.name = this.constructor.name;
  this.status = status;
  this.key = key;
  this.message = message;
  this.cause = cause;
  this.json = function() {
    let json = {status: this.status, key: this.key, message: this.message};
    if (settings.debug === true && cause) {
      json.cause = cause.message;
    }
    return json;
  };
  this.toString = function() {
    return this.message;
  };
};
util.inherits(ChatzError, Error);

exports.chatzError = function(key, message, cause) {
  return new ChatzError(400, key, message, cause);
};

exports.notFoundError = function(key, message, cause) {
  return new ChatzError(404, key, message, cause);
};

exports.internalError = function(message, cause) {
  return new ChatzError(500, 'internalError', message, cause);
};

exports.respondWithError = function(res, err) {
  if (err instanceof ChatzError) {
    res.status(err.status).json(err.json())
  } else {
    let internal = this.internalError(err.message, err);
    res.status(internal.status).json(internal.json());
  }
};