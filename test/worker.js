import reflected, { channel } from '../dist/proxy/worker/proxy.js';

const proxy = await reflected({
  onsync: (payload) => {
    console.log('worker onsync', payload);
    return payload;
  }
});

proxy.compute = (name, value) => {
  console.log('computing', proxy.test(1, 2, 3));
  return Promise.resolve({ name, value });
};

for (let i = 0; i < 4; i++) proxy.test(1, 2, 3);

console.time('sync');
const result = proxy.test(1, 2, 3);
console.timeEnd('sync');

console.log(channel, result);

// postMessage(`${channel} - [${result?.join?.(',')}]`);
