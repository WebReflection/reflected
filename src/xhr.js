import main from './main/xhr.js';
import worker from './worker/xhr.js';

export { channel } from './worker/xhr.js';

export default (
  'importScripts' in globalThis ? worker : main
);
