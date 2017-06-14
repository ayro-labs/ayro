'use strict';

let logger = require('../utils/logger');

exports.configure = function(express, app) {

  logger.info('Configuring routes');

  require('../routes/auth')(express.Router(), app);
  require('../routes/account')(express.Router(), app);
  require('../routes/project')(express.Router(), app);
  require('../routes/integration')(express.Router(), app);
  require('../routes/chat')(express.Router(), app);

};