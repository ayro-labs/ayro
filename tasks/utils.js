const childProcess = require('child_process');
const Promise = require('bluebird');

function log(data, buffer) {
  buffer += data.toString();
  const lines = buffer.split('\n');
  for (let i = 0; i < lines.length - 1; i += 1) {
    const line = lines[i];
    console.log(line);
  }
  return lines[lines.length - 1];
}

exports.exec = (command, dir) => {
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(command, {
      shell: true,
      cwd: dir,
    });
    let outBuffer = '';
    let errBuffer = '';
    child.stdout.on('data', (data) => {
      outBuffer = log(data, outBuffer);
    });
    child.stderr.on('data', (data) => {
      errBuffer = log(data, errBuffer);
    });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Error executing command: ${command}`));
      }
    });
  });
};
