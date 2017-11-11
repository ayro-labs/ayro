const settings = require('../configs/settings');
const logger = require('../utils/logger');
const sessions = require('../utils/sessions');
const fs = require('fs');
const http = require('http');
const https = require('https');
const restify = require('restify');
const faye = require('faye');
const util = require('util');

const SUBSCRIPTION_PATTERN = '/users/%s';
const SUBSCRIBE_CHANNEL = '/meta/subscribe';
const AUTH_ERROR = 'api.token.invalid';

function emitAuthError(message, callback) {
  message.error = AUTH_ERROR;
  callback(message);
}

const authentication = {
  incoming: (message, request, callback) => {
    if (message.channel !== SUBSCRIBE_CHANNEL) {
      callback(message);
      return;
    }
    if (!message.ext || !message.ext.api_token) {
      emitAuthError(message, callback);
      return;
    }
    sessions.getUser(message.ext.api_token).then((user) => {
      if (util.format(SUBSCRIPTION_PATTERN, user.id) === message.subscription) {
        logger.info('Subscribing user %s', user.id);
        callback(message);
      } else {
        emitAuthError(message, callback);
      }
    }).catch((err) => {
      logger.error('Could not get user from session', err);
      emitAuthError(message, callback);
    });
  },
};

const httpsCert = settings.https ? fs.readFileSync(settings.https.cert) : null;
const httpsKey = settings.https ? fs.readFileSync(settings.https.key) : null;

const server = restify.createServer({
  name: 'Web Cloud Messaging',
  certificate: httpsCert,
  key: httpsKey,
});
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

const pubSubServer = settings.https ? https.createServer({cert: httpsCert, key: httpsKey}) : http.createServer();
const bayeux = new faye.NodeAdapter({mount: '/'});
bayeux.addExtension(authentication);
bayeux.attach(pubSubServer);

server.post('/push/:user', (req, res) => {
  logger.debug('Publishing message of event %s to user %s', req.body.event, req.params.user);
  bayeux.getClient().publish(`/users/${req.params.user}`, req.body);
  res.send(200);
});

server.listen(settings.webcm.port, null, () => {
  logger.info('Web Cloud Messaging listening on port %s', settings.webcm.port);
});

pubSubServer.listen(settings.webcm.pubSub.port, null, null, () => {
  logger.info('Web Cloud Messaging (Pub/Sub) listening on port %s', settings.webcm.pubSub.port);
});
