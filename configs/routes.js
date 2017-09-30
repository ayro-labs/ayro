const logger = require('../utils/logger');
const authRoutes = require('../routes/auth');
const accountRoutes = require('../routes/account');
const appRoutes = require('../routes/app');
const userRoutes = require('../routes/user');
const slackChatRoutes = require('../routes/chat/slack');
const messengerChatRoutes = require('../routes/chat/messenger');
const chatRoutes = require('../routes/chat');

exports.configure = (express, app) => {

  logger.info('Configuring routes');

  authRoutes(express.Router(), app);
  accountRoutes(express.Router(), app);
  appRoutes(express.Router(), app);
  userRoutes(express.Router(), app);
  slackChatRoutes(express.Router(), app);
  messengerChatRoutes(express.Router(), app);
  chatRoutes(express.Router(), app);

};
