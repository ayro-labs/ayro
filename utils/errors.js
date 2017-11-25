const settings = require('../configs/settings');
const util = require('util');

function AyroError(status, code, message, cause) {
  if (!cause && AyroError.super_.captureStackTrace) {
    AyroError.super_.captureStackTrace(this, this.constructor);
  } else if (cause) {
    this.stack = cause.stack;
  }
  this.name = this.constructor.name;
  this.status = status;
  this.code = code;
  this.message = message;
  this.cause = cause;
  this.json = () => {
    const json = {status: this.status, code: this.code, message: this.message};
    if (settings.debug === true && cause) {
      json.cause = cause.message;
    }
    return json;
  };
  this.toString = () => this.message;
}
util.inherits(AyroError, Error);

exports.ayroError = (code, message, cause) => {
  return new AyroError(400, code, message, cause);
};

exports.permissionError = (code, message, cause) => {
  return new AyroError(401, code, message, cause);
};

exports.notFoundError = (code, message, cause) => {
  return new AyroError(404, code, message, cause);
};

exports.internalError = (message, cause) => {
  return new AyroError(500, 'internalError', message, cause);
};

exports.respondWithError = (res, err) => {
  if (err instanceof AyroError) {
    res.status(err.status).json(err.json());
  } else {
    const internal = this.internalError(err.message, err);
    res.status(internal.status).json(internal.json());
  }
};
