import reflected from '../src/index.js';

const sync = await reflected({
  ondata: (data, ...rest) => {
    console.log('worker', [...data], rest);
    return data;
  }
});

console.log('result', sync('test'));
