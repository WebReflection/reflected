export { channel } from "./worker/message.js";
declare const _default: ((options: import("./worker/shared.js").Options) => Promise<(payload: unknown, ...rest: unknown[]) => unknown>) | ((scriptURL: string, options: import("./main/shared.js").Options) => Promise<{
    new (scriptURL: any, options: any, resolve: any): {
        get channel(): string;
        "__#private@#next": any;
        "__#private@#requests": Map<any, any>;
        send(payload: any, ...rest: any[]): any;
        postMessage(message: any, transfer: Transferable[]): void;
        postMessage(message: any, options?: StructuredSerializeOptions): void;
        terminate(): void;
        addEventListener<K extends keyof WorkerEventMap>(type: K, listener: (this: Worker, ev: WorkerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof WorkerEventMap>(type: K, listener: (this: Worker, ev: WorkerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
        dispatchEvent(event: Event): boolean;
        onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null;
        onmessage: (this: Worker, ev: MessageEvent) => any;
        onmessageerror: (this: Worker, ev: MessageEvent) => any;
    };
}>);
export default _default;
