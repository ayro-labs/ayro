'use strict';

const messengerService = require('../../services/chat/messenger');
const settings = require('../../configs/settings');
const errors = require('../../utils/errors');
const {logger} = require('@ayro/commons');
const bodyParser = require('body-parser');
const xhub = require('x-hub-signature').middleware;

const SUBSCRIBE_EVENT = 'subscribe';

const facebookXhub = xhub({
  algorithm: 'sha1',
  secret: settings.facebook.appSecret,
});

function confirmSubscription(req, res) {
  if (req.query['hub.mode'] !== SUBSCRIBE_EVENT || req.query['hub.verify_token'] !== settings.messenger.verificationToken) {
    logger.warn('(Messenger) Could not verify subscribe event');
    res.sendStatus(403);
    return;
  }
  res.send(req.query['hub.challenge']);
}

async function postMessage(req, res) {
  try {
    await messengerService.postMessage(req.body.entry[0].messaging[0]);
    res.end();
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.get('/', confirmSubscription);
  router.post('/', facebookXhub, postMessage);

  app.use('/chat/messenger', router);
};
