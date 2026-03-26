export const assign: {
    <T extends {}, U>(target: T, source: U): T & U;
    <T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
    <T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
    (target: object, ...sources: any[]): any;
};
export const create: {
    (o: object | null): any;
    (o: object | null, properties: PropertyDescriptorMap & ThisType<any>): any;
};
export const byteOffset: number;
export function identity(value: any): any;
export function randomUUID(): string;
