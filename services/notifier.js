'use strict';

let settings = require('../configs/settings'),
    logger = require('../utils/logger'),
    http = require('http'),
    restify = require('restify'),
    faye = require('faye');

let server = restify.createServer({
  name: 'Notifier'
});
server.use(restify.queryParser());
server.use(restify.bodyParser());

var pubSubServer = http.createServer();
let bayeux = new faye.NodeAdapter({mount: '/'});
bayeux.attach(pubSubServer);

server.post('/users/:user/messages', function(req, res, next) {
  bayeux.getClient().publish(`/users/${req.params.user}`, {
    event: 'chat_message',
    message: req.body
  });
});

server.listen(settings.notifier.port, settings.notifier.host, null, function() {
  logger.info('%s listening at %s', server.name, server.url);
});

pubSubServer.listen(settings.notifier.pubSub.port, settings.notifier.pubSub.host, null, function() {
  logger.info('Notifier Pub/Sub listening at http://%s:%s', settings.notifier.pubSub.host, settings.notifier.pubSub.port);
});
