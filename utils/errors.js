const settings = require('../configs/settings');
const util = require('util');

function ChatzError(status, code, message, cause) {
  if (!cause && ChatzError.super_.captureStackTrace) {
    ChatzError.super_.captureStackTrace(this, this.constructor);
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
util.inherits(ChatzError, Error);

exports.chatzError = (code, message, cause) => {
  return new ChatzError(400, code, message, cause);
};

exports.permissionError = (code, message, cause) => {
  return new ChatzError(401, code, message, cause);
};

exports.notFoundError = (code, message, cause) => {
  return new ChatzError(404, code, message, cause);
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
