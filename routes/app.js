'use strict';

const {App, AppSecret} = require('models');
const appService = require('services/app');
const settings = require('configs/settings');
const errors = require('utils/errors');
const {accountAuthenticated, accountOwnsApp} = require('routes/middlewares');
const {logger} = require('@ayro/commons');
const multer = require('multer');

const upload = multer({dest: settings.uploadsPath});

async function listApps(req, res) {
  try {
    const apps = await appService.listApps(req.account, req.query.integrations === 'true', req.query.plugins === 'true');
    res.json(apps);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getApp(req, res) {
  try {
    const app = await appService.getApp(req.params.app, req.query.integrations === 'true', req.query.plugins === 'true');
    res.json(app);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function createApp(req, res) {
  try {
    const app = await appService.createApp(req.account, req.body.name);
    res.json(app);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateApp(req, res) {
  try {
    let app = new App({id: req.params.app});
    app = await appService.updateApp(app, req.body);
    res.json(app);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function deleteApp(req, res) {
  try {
    const app = new App({id: req.params.app});
    await appService.deleteApp(app);
    res.json({});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getAppIcon(req, res) {
  try {
    const icon = await appService.getAppIcon(req.params.app);
    res.redirect(icon);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateAppIcon(req, res) {
  try {
    let app = new App({id: req.params.app});
    app = await appService.updateIcon(app, req.file);
    res.json(app);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listAppSecrets(req, res) {
  try {
    const app = new App({id: req.params.app});
    const appSecrets = await appService.listAppSecrets(app);
    res.json(appSecrets);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function createAppSecret(req, res) {
  try {
    const app = new App({id: req.params.app});
    const appSecret = await appService.createAppSecret(app);
    res.json(appSecret);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function removeAppSecret(req, res) {
  try {
    const app = new App({id: req.params.app});
    const appSecret = new AppSecret({id: req.params.app_secret});
    await appService.removeAppSecret(app, appSecret);
    res.json({});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.get('', accountAuthenticated, listApps);
  router.get('/:app', [accountAuthenticated, accountOwnsApp], getApp);
  router.post('', accountAuthenticated, createApp);
  router.put('/:app', [accountAuthenticated, accountOwnsApp], updateApp);
  router.get('/:app/icon', getAppIcon);
  router.put('/:app/icon', [accountAuthenticated, accountOwnsApp, upload.single('icon')], updateAppIcon);
  router.delete('/:app', [accountAuthenticated, accountOwnsApp], deleteApp);

  router.get('/:app/secrets', [accountAuthenticated, accountOwnsApp], listAppSecrets);
  router.post('/:app/secrets', [accountAuthenticated, accountOwnsApp], createAppSecret);
  router.delete('/:app/secrets/:app_secret', [accountAuthenticated, accountOwnsApp], removeAppSecret);

  app.use('/apps', router);
};
