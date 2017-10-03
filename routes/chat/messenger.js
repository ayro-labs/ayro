const messengerService = require('../../services/chat/messenger');
const settings = require('../../configs/settings');
const logger = require('../../utils/logger');
const errors = require('../../utils/errors');
const xhub = require('express-x-hub');

const xhubMiddleware = xhub({
  algorithm: 'sha1',
  secret: settings.messenger.appSecret,
});

const SUBSCRIBE_EVENT = 'subscribe';

module.exports = (router, app) => {

  function confirmSubscription(req, res) {
    if (req.query['hub.mode'] !== SUBSCRIBE_EVENT || req.query['hub.verify_token'] !== settings.messenger.verificationToken) {
      logger.warn('(Messenger) Could not verify subscribe event');
      res.sendStatus(403);
      return;
    }
    res.send(req.query['hub.challenge']);
  }

  function postMessage(req, res) {
    if (!req.isXHub || !req.isXHubValid()) {
      logger.warn('(Messenger) Could not verify message signature');
      res.sendStatus(403);
      return;
    }
    messengerService.postMessage(req.body).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  router.get('/', confirmSubscription);
  router.post('/', xhubMiddleware, postMessage);

  app.use('/chat/messenger', router);

};
