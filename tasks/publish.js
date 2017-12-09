const projectPackage = require('../package');
const {commands} = require('@ayro/commons');
const path = require('path');
const Promise = require('bluebird');

const ECR_REPOSITORY_URL = '554511234717.dkr.ecr.us-west-1.amazonaws.com';
const ECR_REPOSITORY_NAMESPACE = 'ayro';
const ECR_REPOSITORY_REGION = 'us-west-1';
const WORKING_DIR = path.resolve(__dirname, '../');

function exec(command, dir) {
  return commands.exec(command, dir || WORKING_DIR);
}

function checkoutTag(version) {
  return Promise.coroutine(function* () {
    commands.log(`Checking out the tag ${version}...`);
    yield exec(`git checkout ${version}`);
  })();
}

function lintProject() {
  return Promise.coroutine(function* () {
    commands.log('Linting project...');
    yield exec('npm run lint');
  })();
}

function buildImage() {
  return Promise.coroutine(function* () {
    commands.log('Building image...');
    yield exec(`docker build -t ${ECR_REPOSITORY_NAMESPACE}/${projectPackage.name} .`);
    commands.log('Tagging image...');
    yield exec(`docker tag ${ECR_REPOSITORY_NAMESPACE}/${projectPackage.name}:latest ${ECR_REPOSITORY_URL}/${ECR_REPOSITORY_NAMESPACE}/${projectPackage.name}:latest`);
  })();
}

function publishToECR() {
  return Promise.coroutine(function* () {
    commands.log('Signing in to Amazon ECR...');
    yield exec(`eval $(aws ecr get-login --no-include-email --region ${ECR_REPOSITORY_REGION})`);
    commands.log('Publishing to Amazon ECR...');
    yield exec(`docker push ${ECR_REPOSITORY_URL}/${ECR_REPOSITORY_NAMESPACE}/${projectPackage.name}:latest`);
  })();
}

// Run this if call directly from command line
if (require.main === module) {
  Promise.coroutine(function* () {
    try {
      const {version} = projectPackage;
      commands.log(`Publishing version ${version} to Amazon ECR...`);
      yield checkoutTag(version);
      yield lintProject();
      yield buildImage();
      yield publishToECR();
      yield checkoutTag('master');
      commands.log(`Version ${version} published with success!`);
    } catch (err) {
      commands.logError(err);
      process.exit(1);
    }
  })();
}
