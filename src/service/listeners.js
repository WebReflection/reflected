import CHANNEL from '../channel.js';

import nextResolver from 'next-resolver';

const [next, resolve] = nextResolver();

const { protocol, host, pathname } = location;
const url = `${protocol}//${host}${pathname}`;

const bc = new BroadcastChannel(CHANNEL);
bc.addEventListener('message', ({ data: [op, details] }) => {
  if (op === 'response') {
    const [uid, data] = details;
    resolve(uid, `[${data.join(',')}]`);
  }
});

const respond = async details => {
  const [uid, promise] = next();
  bc.postMessage(['request', [uid, details]]);
  return new Response(await promise);
};

export const activate = event => event.waitUntil(clients.claim());

export const fetch = async event => {
  const { request: r } = event;
  if (r.method === 'POST' && r.url.startsWith(url)) {
    event.stopImmediatePropagation();
    event.respondWith(r.json().then(respond));
    event.preventDefault();
  }
};

export const install = () => skipWaiting();
