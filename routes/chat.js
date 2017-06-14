'use strict';

module.exports = function(router, app) {

  let sendMessage = function(req, res, next) {
    res.json();
  };

  router.post('/', sendMessage);

  app.use('/chat', router);

};