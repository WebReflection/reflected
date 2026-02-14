import main from './main/broadcast.js';
import worker from './worker/broadcast.js';

export { channel } from './worker/broadcast.js';

export default (
  'importScripts' in globalThis ? worker : main
);
