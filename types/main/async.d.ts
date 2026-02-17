export class Worker extends Sender {
    constructor(scriptURL: any, options: any, resolve: any);
    get channel(): string;
}
declare const _default: (scriptURL: string, options: import("./shared.js").Options) => Promise<typeof Worker>;
export default _default;
import Sender from './sender.js';
