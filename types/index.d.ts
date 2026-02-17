export default module;
export type MainOptions = import("./main/shared.js").Options;
export type WorkerOptions = import("./worker/shared.js").Options;
/** @typedef {import('./main/shared.js').Options} MainOptions */
/** @typedef {import('./worker/shared.js').Options} WorkerOptions */
/** @type {string} */
export let channel: string;
/** @type {Function} */
declare let module: Function;
