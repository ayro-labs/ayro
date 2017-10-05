const Promise = require('bluebird');

exports.postMessage = (data) => {
  console.log(data);
  return Promise.resolve(data);
};
