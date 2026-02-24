declare function _default(options: any): Promise<{
    global: unknown;
    isProxy: (value: any) => boolean;
    assign<T extends {}, U>(target: T, source: U): T & U;
    assign<T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
    assign<T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
    assign(target: object, ...sources: any[]): any;
    direct<T extends WeakKey>(value: T): T;
    evaluate: (callback: Function, ...args: any[]) => any;
    gather(target: object, ...keys: (string | symbol)[]): any[];
    query: (target: any, path: string) => any;
    reflect: (method: number, uid: number | null, ...args: any[]) => Promise<any>;
}>;
export default _default;
