import { o as object } from './shared-5Nhc4gvB.js';

const { getPrototypeOf } = Object;
const { construct } = Reflect;
const { toStringTag } = Symbol;
const { toString } = object;

const toTag = (ref, name = ref[toStringTag]) =>
  name in globalThis ? name : toTag(construct(getPrototypeOf(ref.constructor),[0]));

export { toTag as t };
