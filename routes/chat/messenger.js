const messengerService = require('../../services/chat/messenger');
const settings = require('../../configs/settings');
const logger = require('../../utils/logger');
const errors = require('../../utils/errors');

module.exports = (router, app) => {

  function confirmSubscription(req, res) {
    if (req.query['hub.verify_token'] === settings.messenger.verificationToken) {
      res.send(req.query['hub.challenge']);
    } else {
      res.sendStatus(403);
    }
  }

  function postMessage(req, res) {
    messengerService.postMessage(req.body).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  router.get('/', confirmSubscription);
  router.post('/', postMessage);

  app.use('/chat/messenger', router);

};
