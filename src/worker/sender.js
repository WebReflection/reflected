import SHARED_CHANNEL from '../channel.js';

import { identity } from '../shared.js';

const { isArray } = Array;

export default options => {
  const onsend = options.onsend ?? identity;
  addEventListener('message', async event => {
    const { data } = event;
    if (isArray(data) && data[0] === SHARED_CHANNEL) {
      event.stopImmediatePropagation();
      event.preventDefault();
      const [id, payload] = data[1];
      postMessage([SHARED_CHANNEL, [id, await onsend(payload)]]);
    }
  });
  return options;
};
