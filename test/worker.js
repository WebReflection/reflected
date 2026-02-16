import reflected, { channel } from '../dist/index.js';

const sync = await reflected({
  ondata: (data, ...rest) => {
    // console.log('worker', [...data], rest);
    return data;
  }
});

for (let i = 0; i < 4; i++) sync('test');

console.time('sync');
const result = sync('test');
console.timeEnd('sync');

console.log(channel, result);

postMessage(`${channel} - [${result?.join?.(',')}]`);
