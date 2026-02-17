import withResolvers from '@webreflection/utils/with-resolvers';
import i32 from 'weak-id/i32';

import SHARED_CHANNEL from '../channel.js';

const { isArray } = Array;

const onsend = value => value;

export default class Sender extends Worker {
  #next;
  #requests;
  constructor(scriptURL, options) {
    super(scriptURL, options);
    this.#next = i32();
    this.#requests = new Map;
    if (!options.onsend) options.onsend = onsend;
    super.addEventListener('message', async event => {
      const { data } = event;
      if (isArray(data) && data[0] === SHARED_CHANNEL) {
        event.stopImmediatePropagation();
        event.preventDefault();
        const [id, payload] = data[1];
        const resolve = this.#requests.get(id);
        this.#requests.delete(id);
        resolve(await options.onsend(payload));
      }
    });
  }

  send(payload, ...rest) {
    const id = this.#next();
    const { promise, resolve } = withResolvers();
    this.#requests.set(id, resolve);
    super.postMessage([SHARED_CHANNEL, [id, payload]], ...rest);
    return promise;
  }
}
