const properties = require('../configs/properties');
const winston = require('winston');

const level = properties.getValue('app.debug', false) ? 'debug' : 'info';
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level,
      timestamp: true,
      colorize: true,
      debugStdout: level === 'debug',
    }),
  ],
});

module.exports = logger;
module.exports.stream = {
  write: (message) => {
    logger.debug(message);
  },
};
