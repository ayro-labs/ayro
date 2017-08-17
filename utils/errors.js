const settings = require('../configs/settings');
const util = require('util');

function ChatzError(status, key, message, cause) {
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
  this.json = () => {
    const json = {status: this.status, key: this.key, message: this.message};
    if (settings.debug === true && cause) {
      json.cause = cause.message;
    }
    return json;
  };
  this.toString = () => this.message;
}
util.inherits(ChatzError, Error);

exports.chatzError = (key, message, cause) => {
  return new ChatzError(400, key, message, cause);
};

exports.permissionError = (key, message, cause) => {
  return new ChatzError(401, key, message, cause);
};

exports.notFoundError = (key, message, cause) => {
  return new ChatzError(404, key, message, cause);
};

exports.internalError = (message, cause) => {
  return new ChatzError(500, 'internalError', message, cause);
};

exports.respondWithError = (res, err) => {
  if (err instanceof ChatzError) {
    res.status(err.status).json(err.json());
  } else {
    const internal = this.internalError(err.message, err);
    res.status(internal.status).json(internal.json());
  }
};
