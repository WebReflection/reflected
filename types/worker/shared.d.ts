export function handler(promise: Promise<[SharedArrayBuffer, Options, MessageChannel | BroadcastChannel]>, listener: (event: MessageEvent) => void): (options: Options) => Promise<(data: unknown, ...rest: unknown[]) => unknown>;
export type Options = {
    /**
     * transforms the resulting `Int32Array` from *main* thread into a value usable within the worker.
     */
    ondata: (data: Int32Array) => unknown;
    /**
     * invoked to define what to return to the *main* thread when it calls `worker.send(data)`.
     */
    onsend: (data: unknown) => unknown;
};
