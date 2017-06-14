'use strict';

module.exports = function(router, app) {

  let addSlack = function(req, res, next) {
    res.json();
  };

  let addWebsite = function(req, res, next) {
    res.json();
  };

  let addAndroid = function(req, res, next) {
    res.json();
  };

  let addIOS = function(req, res, next) {
    res.json();
  };

  router.post('/slack', addWebsite);
  router.post('/website', addWebsite);
  router.post('/android', addAndroid);
  router.post('/ios', addIOS);

  app.use('/integrations', router);

};