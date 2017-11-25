const properties = require('../configs/properties');
const winston = require('winston');
const path = require('path');

const level = properties.getValue('app.debug', false) ? 'debug' : 'info';

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level,
      timestamp: true,
      colorize: true,
      debugStdout: level === 'debug',
    }),
    new (winston.transports.File)({
      level,
      filename: path.join(__dirname, '../ayro.log'),
    }),
  ],
});

module.exports = logger;
module.exports.stream = {
  write: (message) => {
    logger.debug(message);
  },
};
