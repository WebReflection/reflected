import reflected, { channel } from '../dist/index.js';

const sync = await reflected({
  onsend: (data, ...rest) => {
    // console.log('worker', [...data], rest);
    return data;
  },
  onsync: (data, ...rest) => {
    // console.log('worker', [...data], rest);
    return data;
  }
});

for (let i = 0; i < 4; i++) sync('test');

console.time('sync');
const result = await sync('test');
console.timeEnd('sync');

console.log(channel, result);

postMessage(`${channel} - [${result?.join?.(',')}]`);
