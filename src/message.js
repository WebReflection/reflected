import main from './main/message.js';
import worker from './worker/message.js';

export { channel } from './worker/message.js';

export default (
  'importScripts' in globalThis ? worker : main
);
