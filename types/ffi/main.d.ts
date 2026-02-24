declare function _default(url: string, options: import("../index.js").MainOptions & import("reflected-ffi/local").LocalOptions): Promise<Worker & {
    ffi: {
        assign: {
            <T extends {}, U>(target: T, source: U): T & U;
            <T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
            <T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
            (target: object, ...sources: any[]): any;
        };
        gather: (target: any, ...keys: (string | symbol)[][]) => any[];
        query: (target: any, path: string) => any;
        direct<T extends WeakKey>(value: T): T;
        evaluate: (callback: Function, ...args: any[]) => any;
        reflect(method: number, uid: number | null, ...args: any[]): any;
        terminate(): void;
    };
    terminate(): void;
}>;
export default _default;
