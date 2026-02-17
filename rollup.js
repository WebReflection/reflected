import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

import { writeFileSync } from 'fs';

writeFileSync(`./src/channel.js`, `export default '${crypto.randomUUID()}';`);

const plugins = [nodeResolve()].concat(process.env.NO_MIN ? [] : [terser()]);

export default [
  {
    plugins,
    input: './src/index.js',
    output: {
      esModule: true,
      dir: './dist'
    }
  },
  {
    plugins,
    input: './src/broadcast.js',
    output: {
      esModule: true,
      dir: './dist'
    }
  },
  {
    plugins,
    input: './src/message.js',
    output: {
      esModule: true,
      dir: './dist'
    }
  },
  {
    plugins,
    input: './src/xhr.js',
    output: {
      esModule: true,
      dir: './dist'
    }
  },
  {
    plugins,
    input: './src/async.js',
    output: {
      esModule: true,
      dir: './dist'
    }
  },
  {
    plugins,
    input: './src/service/worker.js',
    output: {
      esModule: true,
      file: './dist/sw.js'
    }
  },
];
