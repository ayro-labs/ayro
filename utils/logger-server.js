'use strict';

let properties = require('../configs/properties'),
    winston    = require('winston');

let level = properties.getValue('app.debug', false) === true ? 'debug' : 'info';
let logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({timestamp: true, colorize: true, level: level, debugStdout: level === 'debug' ? true : false})
  ]
});

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding) {
    logger.debug(message);
  }
};