export const minByteLength: number;
export function SAB({ initByteLength, maxByteLength }: {
    initByteLength?: number;
    maxByteLength?: number;
}): SharedArrayBuffer;
export function bootstrap(Worker: Worker): (scriptURL: string, options: Options) => Promise<Worker>;
export function handler(sab: any, options: any, useAtomics: any): ({ data }: {
    data: any;
}) => Promise<void>;
export function post(sab: any, options: any): any[];
export function url(scriptURL: any, reflected: any, options: any): any[];
/**
 * see https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#options
 */
export type ServiceWorkerOptions = {
    /**
     * will use the `serviceWorker` value if that is a `string`, otherwise it refers to where the service worker file is located.
     */
    url?: string;
    type?: "classic" | "module";
    updateViaCache?: "all" | "imports" | "none";
};
export type Options = {
    /**
     * invoked when the worker expect a response as `Int32Array` to populate the SharedArrayBuffer with.
     */
    onsync: (data: unknown) => Promise<Int32Array>;
    /**
     * invoked when the worker replies to a `worker.send(data)` call.
     */
    onsend?: (data: unknown) => unknown;
    /**
     * defines the initial byte length of the SharedArrayBuffer.
     */
    initByteLength?: number;
    /**
     * defines the maximum byte length (growth) of the SharedArrayBuffer.
     */
    maxByteLength?: number;
    /**
     * defines the service worker to use as fallback if SharedArrayBuffer is not supported. If not defined, the `async` fallback will be used so that no `sync` operations from the worker will be possible.
     */
    serviceWorker?: string | ServiceWorkerOptions;
};
