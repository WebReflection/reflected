import reflect, { channel } from '../../dist/index.js';

// ℹ️ must await the initialization
const reflected = await reflect({
  // receives the returned data from the main thread.
  // use this helper to transform such data into something
  // that the worker can use/understand after invoke
  // ℹ️ must be synchronous and it's invoked synchronously
  onsync(response) {
    return response;
  },

  async onsend(payload) {
    return payload;
  },
});

// retrive the result of `test_sum(1, 2, 3)`
// directly from the main thread.
// only the async channel variant would need to await
const value = reflected({
  invoke: 'test_sum',
  args: [1, 2, 3]
});

console.log({ channel, value });
