const messengerService = require('../../services/chat/messenger');
const logger = require('../../utils/logger');
const errors = require('../../utils/errors');

module.exports = (router, app) => {

  function postMessage(req, res) {
    messengerService.postMessage(req.body).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  router.get('/', postMessage);

  app.use('/chat/messenger', router);

};
