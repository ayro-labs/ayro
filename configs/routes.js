'use strict';

const accountRoutes = require('../routes/account');
const appRoutes = require('../routes/app');
const integrationRoutes = require('../routes/integration');
const pluginRoutes = require('../routes/plugin');
const userRoutes = require('../routes/user');
const slackChatRoutes = require('../routes/chat/slack');
const messengerChatRoutes = require('../routes/chat/messenger');
const chatRoutes = require('../routes/chat');
const eventRoutes = require('../routes/event');
const {logger} = require('@ayro/commons');

exports.configure = (express, app) => {
  logger.info('Configuring routes');
  accountRoutes(express.Router({mergeParams: true}), app);
  appRoutes(express.Router({mergeParams: true}), app);
  integrationRoutes(express.Router({mergeParams: true}), app);
  pluginRoutes(express.Router({mergeParams: true}), app);
  userRoutes(express.Router({mergeParams: true}), app);
  eventRoutes(express.Router({mergeParams: true}), app);
  slackChatRoutes(express.Router({mergeParams: true}), app);
  messengerChatRoutes(express.Router({mergeParams: true}), app);
  chatRoutes(express.Router({mergeParams: true}), app);
};
