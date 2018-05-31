'use strict';

const settings = require('configs/settings');
const axios = require('axios');
const Promise = require('bluebird');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid').v4;

const ACCOUNT_LOGO_DIMENSION = 160;
const APP_ICON_DIMENSION = 160;
const USER_PHOTO_DIMENSION = 128;

const writeFileAsync = Promise.promisify(fs.writeFile);
const unlinkAsync = Promise.promisify(fs.unlink);
const statAsync = Promise.promisify(fs.stat);

async function downloadImage(url, outputFile) {
  const response = await axios.get(url, {responseType: 'arraybuffer'});
  await writeFileAsync(outputFile, response.data);
}

async function fixImage(inputFile, outputFile, dimension) {
  return sharp(inputFile)
    .resize(dimension)
    .png()
    .toFile(outputFile);
}

exports.createDirSync = (dir) => {
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

exports.fileExists = async (file) => {
  try {
    await statAsync(file);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
};

exports.removeFile = async (file) => {
  await unlinkAsync(file);
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

exports.downloadUserPhoto = async (user, photoUrl) => {
  const photoPath = path.join(settings.userPhotoPath, uuid());
  await downloadImage(photoUrl, photoPath);
  const finalPhotoFile = `${user.id}_${Date.now()}.png`;
  const finalPhotoPath = path.join(settings.userPhotoPath, finalPhotoFile);
  await fixImage(photoPath, finalPhotoPath, USER_PHOTO_DIMENSION);
  await unlinkAsync(photoPath);
  return finalPhotoFile;
};

exports.fixAppIcon = async (app, iconPath) => {
  const finalIconFile = `${app.id}_${Date.now()}.png`;
  const finalIconPath = path.join(settings.appIconPath, finalIconFile);
  await fixImage(iconPath, finalIconPath, APP_ICON_DIMENSION);
  await unlinkAsync(iconPath);
  return finalIconFile;
};

exports.fixAccountLogo = async (account, logoPath) => {
  const finalLogoFile = `${account.id}_${Date.now()}.png`;
  const finalLogoPath = path.join(settings.accountLogoPath, finalLogoFile);
  await fixImage(logoPath, finalLogoPath, ACCOUNT_LOGO_DIMENSION);
  await unlinkAsync(logoPath);
  return finalLogoFile;
};
