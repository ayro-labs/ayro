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

function downloadImage(url, outputFile) {
  return Promise.coroutine(function* () {
    const response = yield axios.get(url, {responseType: 'arraybuffer'});
    yield writeFileAsync(outputFile, response.data);
  })();
}

function fixImage(inputFile, outputFile, dimension) {
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

exports.downloadUserPhoto = (user) => {
  return Promise.coroutine(function* () {
    if (!user.photo_url) {
      return null;
    }
    const photoPath = path.join(settings.userPhotoPath, user.id);
    const finalPhotoFile = `${user.id}.jpg`;
    const finalPhotoPath = path.join(settings.userPhotoPath, finalPhotoFile);
    yield downloadImage(user.photo_url, photoPath);
    yield fixImage(photoPath, finalPhotoPath, USER_PHOTO_DIMENSION);
    yield unlinkAsync(photoPath);
    return finalPhotoFile;
  })();
};

exports.fixAppIcon = (app) => {
  return Promise.coroutine(function* () {
    if (!app.icon) {
      return null;
    }
    const iconPath = path.join(settings.appIconPath, app.id);
    const finalIconFile = `${app.id}.jpg`;
    const finalIconPath = path.join(settings.appIconPath, finalIconFile);
    yield fixImage(iconPath, finalIconPath, APP_ICON_DIMENSION);
    yield unlinkAsync(iconPath);
    return finalIconFile;
  })();
};


exports.fixAccountLogo = (account) => {
  return Promise.coroutine(function* () {
    if (!account.logo) {
      return null;
    }
    const logoPath = path.join(settings.accountLogoPath, account.id);
    const finalLogoFile = `${account.id}.jpg`;
    const finalLogoPath = path.join(settings.accountLogoPath, finalLogoFile);
    yield fixImage(logoPath, finalLogoPath, ACCOUNT_LOGO_DIMENSION);
    yield unlinkAsync(logoPath);
    return finalLogoFile;
  })();
};
