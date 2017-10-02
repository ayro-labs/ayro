const messengerService = require('../../services/chat/messenger');
const logger = require('../../utils/logger');
const errors = require('../../utils/errors');

module.exports = (router, app) => {

  function confirmSubscription(req, res) {
    res.json(req.query['hub.challenge']);
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
