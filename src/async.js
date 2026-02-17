import main from './main/async.js';
import worker from './worker/async.js';

export { channel } from './worker/async.js';

export default (
  'importScripts' in globalThis ? worker : main
);
