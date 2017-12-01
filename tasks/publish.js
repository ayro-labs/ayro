const projectPackage = require('../package');
const path = require('path');
const childProcess = require('child_process');
const Promise = require('bluebird');

const REPOSITORY_URL = 'docker.ayro.io';
const REPOSITORY_OWNER = 'ayro';
const REPOSITORY_NAME = `${REPOSITORY_OWNER}/${projectPackage.name}`;
const REGISTRY_USERNAME = process.env.DOCKER_REGISTRY_USERNAME;
const REGISTRY_PASSWORD = process.env.DOCKER_REGISTRY_PASSWORD;
const WORKING_DIR = path.resolve(__dirname, '../');

const execAsync = Promise.promisify(childProcess.exec);

function exec(command, options) {
  return execAsync(command, options || {cwd: WORKING_DIR});
}

function checkoutTag(version) {
  return Promise.coroutine(function* () {
    console.log(`Checking out the tag ${version}...`);
    yield exec(`git checkout ${version}`);
  })();
}

function buildImage() {
  return Promise.coroutine(function* () {
    console.log('Building image...');
    yield exec(`docker build -t ${REPOSITORY_NAME} .`);
    console.log('Tagging image...');
    yield exec(`docker tag ${REPOSITORY_NAME} ${REPOSITORY_URL}/${REPOSITORY_NAME}`);
  })();
}

function publishToRegistry() {
  return Promise.coroutine(function* () {
    console.log('Publishing to Registry...');
    yield exec(`docker login ${REPOSITORY_URL} -u ${REGISTRY_USERNAME} -p ${REGISTRY_PASSWORD}`);
    yield exec(`docker push ${REPOSITORY_URL}/${REPOSITORY_NAME}`);
  })();
}

// Run this if call directly from command line
if (require.main === module) {
  Promise.coroutine(function* () {
    try {
      const {version} = projectPackage;
      console.log(`Publishing version ${version} to Registry...`);
      yield checkoutTag(version);
      yield buildImage();
      yield publishToRegistry();
      yield checkoutTag('master');
      console.log(`Version ${version} published with success!`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}
