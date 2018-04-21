'use strict';

const settings = require('../configs/settings');
const axios = require('axios');
const Promise = require('bluebird');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ACCOUNT_LOGO_DIMENSION = 160;
const APP_ICON_DIMENSION = 160;
const USER_PHOTO_DIMENSION = 128;
const IMAGE_QUALITY = 90;
const IMAGE_BACKGROUND = '#ffffff';
const IMAGE_FORMAT = 'jpg';

const writeFileAsync = Promise.promisify(fs.writeFile);
const unlinkAsync = Promise.promisify(fs.unlink);

async function downloadImage(url, outputFile) {
  const response = await axios.get(url, {responseType: 'arraybuffer'});
  await writeFileAsync(outputFile, response.data);
}

async function fixImage(inputFile, outputFile, dimension) {
  return sharp(inputFile)
    .resize(dimension)
    .background(IMAGE_BACKGROUND)
    .flatten()
    .jpeg({quality: IMAGE_QUALITY})
    .toFormat(IMAGE_FORMAT)
    .toFile(outputFile);
}

exports.createDir = (dir) => {
  const separator = path.sep;
  const initDir = path.isAbsolute(dir) ? separator : '';
  dir.split(separator).reduce((parentDir, childDir) => {
    const currentDir = path.resolve(parentDir, childDir);
    if (!fs.existsSync(currentDir)) {
      fs.mkdirSync(currentDir);
    }
    return currentDir;
  }, initDir);
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

exports.downloadUserPhoto = async (user) => {
  if (!user.photo_url) {
    return null;
  }
  const photoPath = path.join(settings.userPhotoPath, user.photo_url);
  const finalPhotoFile = `${user.id}_${Date.now()}.jpg`;
  const finalPhotoPath = path.join(settings.userPhotoPath, finalPhotoFile);
  await downloadImage(user.photo_url, photoPath);
  await fixImage(photoPath, finalPhotoPath, USER_PHOTO_DIMENSION);
  await unlinkAsync(photoPath);
  return finalPhotoFile;
};

exports.fixAppIcon = async (app, iconPath) => {
  const finalIconFile = `${app.id}_${Date.now()}.jpg`;
  const finalIconPath = path.join(settings.appIconPath, finalIconFile);
  await fixImage(iconPath, finalIconPath, APP_ICON_DIMENSION);
  await unlinkAsync(iconPath);
  return finalIconFile;
};

exports.fixAccountLogo = async (account, logoPath) => {
  const finalLogoFile = `${account.id}_${Date.now()}.jpg`;
  const finalLogoPath = path.join(settings.accountLogoPath, finalLogoFile);
  await fixImage(logoPath, finalLogoPath, ACCOUNT_LOGO_DIMENSION);
  await unlinkAsync(logoPath);
  return finalLogoFile;
};
