const path = require('path');
const Nodist = require('../lib/nodist');

const testPath = path.resolve(__dirname + '/tmp');

const createNodistInstance = () => new Nodist(
  process.env.NODIST_NODE_MIRROR || 'https://nodejs.org/dist',
  process.env.NODIST_IOJS_MIRROR || 'https://iojs.org/dist',
  path.resolve(testPath)
);

const promiseWithCallback = (promise, callback) => promise.then(
  res => { callback(null, res); },
  err => { callback(err); },
);

module.exports = {
  createNodistInstance,
  promiseWithCallback,
  testPath,
};
