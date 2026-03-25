import reflected, { channel } from '../dist/proxy/worker/proxy.js';

const proxy = await reflected({
  onsend: (data, ...rest) => {
    console.log('worker onsend', [...data], rest);
    return data;
  },
  onsync: (payload) => {
    console.log('worker onsync', payload);
    return payload;
  }
});

for (let i = 0; i < 4; i++) proxy.test(1, 2, 3);

console.time('sync');
const result = proxy.test(1, 2, 3);
console.timeEnd('sync');

console.log(channel, result);

// postMessage(`${channel} - [${result?.join?.(',')}]`);
