'use strict';

const settings = require('configs/settings');
const constants = require('utils/constants');
const {URL} = require('url');
const axios = require('axios');
const Promise = require('bluebird');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const uuid = require('uuid').v4;
const AWS = require('aws-sdk');

var s3 = new AWS.S3();

const ACCOUNT_LOGO_DIMENSION = 160;
const APP_ICON_DIMENSION = 160;
const USER_PHOTO_DIMENSION = 128;

Promise.promisifyAll(mkdirp);
Promise.promisifyAll(fs);

async function isImage(file) {
  return file.mimeType.startsWith('image');
}

async function downloadImage(url, outputFile) {
  const response = await axios.get(url, {responseType: 'arraybuffer'});
  await fs.writeFileAsync(outputFile, response.data);
}

async function processImage(inputFile, outputFile, options) {
  const transformer = sharp(inputFile);
  if (options) {
    if (options.dimension) {
      transformer.resize(options.dimension);
    }
    if (options.png) {
      transformer.png();
    }
  }
  return transformer.toFile(outputFile);
}

async function uploadMedia(sourcePath, file, options) {
  let fileUrl = null;
  const relativePath = path.join(file.path, file.name);
  if (settings.env === constants.environments.PRODUCTION) {
    const sourceDir = path.dirname(sourcePath);
    const sourceFileName = path.basename(sourcePath);
    const finalPath = path.join(sourceDir, `${sourceFileName}_${Date.now()}`);
    if (isImage(file)) {
      await processImage(sourcePath, finalPath, options);
    }
    await s3.putObject({
      Bucket: settings.mediaS3Bucket,
      Key: relativePath,
      Body: await fs.readFileAsync(finalPath),
      ContentType: file.mimeType
    }).promise();
    fileUrl = `${settings.mediaCDNUrl}/${relativePath}`;
    await fs.unlinkAsync(sourcePath);
    await fs.unlinkAsync(finalPath);
  } else {
    const finalDir = path.join(settings.mediaPath, file.path);
    const finalPath = path.join(settings.mediaPath, relativePath);
    if (isImage(file)) {
      await mkdirp.mkdirpAsync(finalDir);
      await processImage(sourcePath, finalPath, options);
    } else {
      await fs.renameAsync(sourcePath, finalPath);
    }
    fileUrl = `${settings.mediaUrl}/${relativePath}`;
    await fs.unlinkAsync(sourcePath);
  }
  return fileUrl;
};

async function removeFile(file) {
  try {
    await fs.unlinkAsync(file);
  } catch (err) {
    // Nothing to do...
  }
};

exports.getUserPhoto = (user) => {
  return user.photo ? `${settings.userPhotoUrl}/${user.photo}` : null;
};

exports.getAppIcon = (app) => {
  return app.icon ? `${settings.appIconUrl}/${app.icon}` : null;
};

exports.getAccountLogo = (account) => {
  return account.logo ? `${settings.accountLogoUrl}/${account.logo}` : null;
};

exports.uploadUserPhoto = async (user, photoUrl) => {
  const photoPath = path.join(settings.uploadsPath, uuid());
  await downloadImage(photoUrl, photoPath);
  const file = {
    path: path.join('users', user.id),
    name: `${Date.now()}.png`,
    mimeType: 'image/png',
  };
  const options = {
    png: true,
    dimension: USER_PHOTO_DIMENSION,
  };
  return uploadMedia(photoPath, file, options);
};

exports.uploadAppIcon = async (app, iconPath) => {
  const file = {
    path: path.join('apps', app.id),
    name: `${Date.now()}.png`,
    mimeType: 'image/png',
  };
  const options = {
    png: true,
    dimension: APP_ICON_DIMENSION,
  };
  return uploadMedia(iconPath, file, options);
};

exports.uploadAccountLogo = async (account, logoPath) => {
  const file = {
    path: path.join('accounts', account.id),
    name: `${Date.now()}.png`,
    mimeType: 'image/png',
  };
  const options = {
    png: true,
    dimension: ACCOUNT_LOGO_DIMENSION,
  };
  return uploadMedia(logoPath, file, options);
};

exports.uploadUserFile = async (user, file) => {
  const fileOptions = {
    path: path.join('users', user.id, 'uploads'),
    name: Date.now() + path.extname(file.originalname),
    mimeType: file.mimetype,
  };
  return uploadMedia(file.path, fileOptions);
};

exports.removeMedia = async (mediaUrl) => {
  const parsedUrl = new URL(mediaUrl);
  if (settings.env === constants.environments.PRODUCTION) {
    const fileKey = parsedUrl.pathname.replace('/', '');
    if (mediaUrl.startsWith(settings.mediaCDNUrl)) {
      await s3.deleteObject({
        Bucket: settings.mediaS3Bucket,
        Key: fileKey,
      }).promise();
    }
  } else {
    if (mediaUrl.startsWith(settings.mediaUrl)) {
      const filePath = path.join(settings.publicPath, parsedUrl.pathname);
      await removeFile(filePath);
    }
  }
};
