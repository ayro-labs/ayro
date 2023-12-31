'use strict';

const chatService = require('services/chat');
const eventService = require('services/event');
const settings = require('configs/settings');
const errors = require('utils/errors');
const {userAuthenticated} = require('routes/middlewares');
const {logger} = require('@ayro/commons');
const multer = require('multer');

const upload = multer({dest: settings.uploadsPath});

async function listMessages(req, res) {
  try {
    const chatMessages = await chatService.listMessages(req.user, req.channel);
    res.json(chatMessages);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function postMessage(req, res) {
  try {
    const chatMessage = await chatService.postMessage(req.user, req.channel, req.body);
    // Asynchronously because it can take a long time
    (async () => {
      await eventService.trackMessagesPosted(req.user);
    })();
    res.json(chatMessage);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function postFile(req, res) {
  try {
    const {file} = req;
    const chatMessage = await chatService.postFile(req.user, req.channel, {
      path: file.path,
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
    // Asynchronously because it can take a long time
    (async () => {
      await eventService.trackMessagesPosted(req.user);
    })();
    res.json(chatMessage);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.get('/', userAuthenticated, listMessages);
  router.post('/', userAuthenticated, postMessage);
  router.post('/files', [userAuthenticated, upload.single('file')], postFile);

  app.use('/chat', router);
};
