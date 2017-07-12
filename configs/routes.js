const logger = require('../utils/logger');
const authRoutes = require('../routes/auth');
const accountRoutes = require('../routes/account');
const appRoutes = require('../routes/app');
const userRoutes = require('../routes/user');
const chatRoutes = require('../routes/chat');

exports.configure = (express, app) => {

  logger.info('Configuring routes');

  authRoutes(express.Router(), app);
  accountRoutes(express.Router(), app);
  appRoutes(express.Router(), app);
  userRoutes(express.Router(), app);
  chatRoutes(express.Router(), app);

};
