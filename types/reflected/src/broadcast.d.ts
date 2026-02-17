export { channel } from "./worker/broadcast.js";
declare const _default: ((scriptURL: string, options: Options) => Promise<Worker>) | ((options: import("./worker/shared.js").Options) => Promise<(data: unknown, ...rest: unknown[]) => unknown>);
export default _default;
