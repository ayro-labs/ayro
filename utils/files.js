'use strict';

const settings = require('configs/settings');
const constants = require('utils/constants');
const axios = require('axios');
const Promise = require('bluebird');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const uuid = require('uuid').v4;
const AWS = require('aws-sdk');

Promise.promisifyAll(mkdirp);
Promise.promisifyAll(fs);

const ACCOUNT_LOGO_DIMENSION = 160;
const APP_ICON_DIMENSION = 160;
const USER_PHOTO_DIMENSION = 128;

const s3 = new AWS.S3();

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
  const relativePath = path.join(file.relativeDir, file.name);
  if (settings.env === constants.environments.PRODUCTION) {
    const sourceDir = path.dirname(sourcePath);
    const sourceFileName = path.basename(sourcePath);
    const finalPath = path.join(sourceDir, `${sourceFileName}_${Date.now()}`);
    if (await isImage(file)) {
      await processImage(sourcePath, finalPath, options);
    }
    await s3.putObject({
      Bucket: settings.mediaS3Bucket,
      Key: relativePath,
      Body: await fs.readFileAsync(finalPath),
      ContentType: file.mimeType,
    }).promise();
    fileUrl = `${settings.mediaCDNUrl}/${relativePath}`;
    await fs.unlinkAsync(sourcePath);
    await fs.unlinkAsync(finalPath);
  } else {
    const finalDir = path.join(settings.mediaPath, file.relativeDir);
    const finalPath = path.join(settings.mediaPath, relativePath);
    if (await isImage(file)) {
      await mkdirp.mkdirpAsync(finalDir);
      await processImage(sourcePath, finalPath, options);
      await fs.unlinkAsync(sourcePath);
    } else {
      await fs.renameAsync(sourcePath, finalPath);
    }
    fileUrl = `${settings.mediaUrl}/${relativePath}`;
  }
  return fileUrl;
}

exports.uploadUserAvatar = async (user, photoUrl) => {
  const photoPath = path.join(settings.uploadsPath, uuid());
  await downloadImage(photoUrl, photoPath);
  const file = {
    name: `avatar_${Date.now()}.png`,
    relativeDir: path.join('users', user.id),
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
    name: `icon_${Date.now()}.png`,
    relativeDir: path.join('apps', app.id),
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
    name: `logo_${Date.now()}.png`,
    relativeDir: path.join('accounts', account.id),
    mimeType: 'image/png',
  };
  const options = {
    png: true,
    dimension: ACCOUNT_LOGO_DIMENSION,
  };
  return uploadMedia(logoPath, file, options);
};

exports.uploadUserFile = async (user, userFile) => {
  const file = {
    name: `upload_${Date.now()}${path.extname(userFile.name)}`,
    relativeDir: path.join('users', user.id, 'uploads'),
    mimeType: userFile.mimeType,
  };
  return uploadMedia(userFile.path, file);
};
