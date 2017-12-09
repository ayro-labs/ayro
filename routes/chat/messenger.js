const messengerService = require('../../services/chat/messenger');
const settings = require('../../configs/settings');
const errors = require('../../utils/errors');
const logger = require('@ayro/commons');
const Promise = require('bluebird');

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
    Promise.coroutine(function* () {
      try {
        yield messengerService.postMessage(req.body.entry[0].messaging[0]);
        res.end();
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  router.get('/', confirmSubscription);
  router.post('/', postMessage);

  app.use('/chat/messenger', router);

};
