import SHARED_CHANNEL from '../channel.js';

const { isArray } = Array;

export default options => {
  addEventListener('message', async event => {
    const { data } = event;
    if (isArray(data) && data[0] === SHARED_CHANNEL) {
      event.stopImmediatePropagation();
      event.preventDefault();
      const [id, payload] = data[1];
      postMessage([SHARED_CHANNEL, [id, await options.onsend(payload)]]);
    }
  });
  return options;
};
