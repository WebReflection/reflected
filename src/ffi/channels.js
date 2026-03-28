import CHANNEL from '../channel.js';

// Main thread <-> Worker thread
export const MAIN = 'M:' + CHANNEL;
export const WORKER = 'W:' + CHANNEL;

// Worker thread <-> Server thread
export const SOCKET = 'S:' + CHANNEL;
export const DRIVER = 'D:' + CHANNEL;

