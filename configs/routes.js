'use strict';

let logger = require('../utils/logger');

exports.configure = function(express, app) {

  logger.info('Configuring routes');

  let router = express.Router();

  require('../routes/auth')(router, app);
  require('../routes/account')(router, app);
  require('../routes/project')(router, app);
  require('../routes/user')(router, app);
  require('../routes/chat')(router, app);

};