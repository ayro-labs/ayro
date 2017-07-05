'use strict';

let settings = require('../configs/settings'),
    logger = require('../utils/logger'),
    http = require('http'),
    restify = require('restify'),
    faye = require('faye');

let server = restify.createServer({name: 'Notifier'});
server.use(restify.queryParser());
server.use(restify.bodyParser());

let authentication = {
  incoming: function(message, callback) {
    let subscription = message.subscription;
    if (message.ext && message.ext.api_token) {
      let apiToken = message.ext.api_token
    } else {
      message.error = 'api.token.invalid';
    }
    callback(message);
  }
};

let pubSubServer = http.createServer();
let bayeux = new faye.NodeAdapter({mount: '/'});
bayeux.addExtension(authentication);
bayeux.attach(pubSubServer);

server.post('/users/:user', function(req, res, next) {
  logger.info('Publishing message of event %s to user %s', req.body.event, req.params.user);
  bayeux.getClient().publish(`/users/${req.params.user}`, req.body);
  res.send(200);
});

server.listen(settings.notifier.port, settings.notifier.host, null, function() {
  logger.info('%s listening at %s', server.name, server.url);
});

pubSubServer.listen(settings.notifier.pubSub.port, settings.notifier.pubSub.host, null, function() {
  logger.info('Notifier Pub/Sub listening at http://%s:%s', settings.notifier.pubSub.host, settings.notifier.pubSub.port);
});
