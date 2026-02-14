import main from './main/service.js';
import worker from './worker/service.js';

export { channel } from './worker/service.js';

export default (
  'importScripts' in globalThis ? worker : main
);
