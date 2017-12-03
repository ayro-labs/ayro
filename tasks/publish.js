const projectPackage = require('../package');
const utils = require('./utils');
const path = require('path');
const Promise = require('bluebird');

const REPOSITORY_NAMESPACE = 'ayro';
const REPOSITORY_URL = '554511234717.dkr.ecr.us-west-1.amazonaws.com';
const WORKING_DIR = path.resolve(__dirname, '../');

function exec(command, dir) {
  return utils.exec(command, dir || WORKING_DIR);
}

function checkoutTag(version) {
  return Promise.coroutine(function* () {
    utils.log(`Checking out the tag ${version}...`);
    yield exec(`git checkout ${version}`);
  })();
}

function lintProject() {
  return Promise.coroutine(function* () {
    utils.log('Linting project...');
    yield exec('npm run lint');
  })();
}

function buildImage() {
  return Promise.coroutine(function* () {
    utils.log('Building image...');
    yield exec(`docker build -t ${REPOSITORY_NAMESPACE}/${projectPackage.name} .`);
    utils.log('Tagging image...');
    yield exec(`docker tag ${REPOSITORY_NAMESPACE}/${projectPackage.name}:latest ${REPOSITORY_URL}/${REPOSITORY_NAMESPACE}/${projectPackage.name}:latest`);
  })();
}

function publishToECR() {
  return Promise.coroutine(function* () {
    utils.log('Publishing to Amazon ECR...');
    yield exec(`docker push ${REPOSITORY_URL}/${REPOSITORY_NAMESPACE}/${projectPackage.name}:latest`);
  })();
}

// Run this if call directly from command line
if (require.main === module) {
  Promise.coroutine(function* () {
    try {
      const {version} = projectPackage;
      utils.log(`Publishing version ${version} to Amazon ECR...`);
      yield checkoutTag(version);
      yield lintProject();
      yield buildImage();
      yield publishToECR();
      yield checkoutTag('master');
      utils.log(`Version ${version} published with success!`);
    } catch (err) {
      utils.logError(err);
      process.exit(1);
    }
  })();
}
