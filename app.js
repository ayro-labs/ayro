const settings = require('./configs/settings');
const middlewares = require('./configs/middlewares');
const routes = require('./configs/routes');
const logger = require('./utils/logger');
const loggerServer = require('./utils/logger-server');
const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
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
app.use(cors());
app.use(express.static(settings.publicPath));

const redisClient = redis.createClient({
  host: settings.redis.host,
  port: settings.redis.port,
  password: settings.redis.password,
});

app.use(session({
  client: redisClient,
  secret: settings.session.secret,
  keyspace: settings.session.prefix,
  requestArg: settings.session.requestHeader,
  maxAge: settings.session.maxAge,
}));

middlewares.configure(app);
routes.configure(express, app);

if (settings.https) {
  const cert = fs.readFileSync(settings.https.cert);
  const key = fs.readFileSync(settings.https.key);
  https.createServer({cert, key}, app).listen(app.get('port'), () => {
    logger.info('Ayro server is listening on port %s', app.get('port'));
  });
} else {
  app.listen(app.get('port'), () => {
    logger.info('Ayro server is listening on port %s', app.get('port'));
  });
}
