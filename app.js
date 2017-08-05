const settings = require('./configs/settings');
const middlewares = require('./configs/middlewares');
const routes = require('./configs/routes');
const logger = require('./utils/logger');
const loggerServer = require('./utils/logger-server');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const redis = require('redis');
const session = require('jwt-redis-session');

require('json.date-extensions');

// Parse string to date when call JSON.parse
JSON.useDateParser();

const app = express();

app.set('env', settings.env);
app.set('port', settings.port);

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('tiny', {stream: loggerServer.stream}));
app.use(express.static(settings.publicPath));

const redisClient = redis.createClient(settings.redis.port, settings.redis.host);
if (settings.redis.password) {
  redisClient.auth(settings.redis.password, (err) => {
    if (err) {
      logger.error('Could not authenticate to redis.', err);
      process.exit(1);
    }
  });
}

app.use(session({
  client: redisClient,
  secret: settings.session.secret,
  keyspace: settings.session.prefix,
  requestArg: settings.session.requestHeader,
  maxAge: settings.session.maxAge,
}));

middlewares.configure(app);
routes.configure(express, app);

app.listen(app.get('port'), () => {
  logger.info('Chatz server is listening on port %s', app.get('port'));
});
