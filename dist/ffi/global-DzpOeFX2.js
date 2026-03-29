import { o as object } from './shared-CjWXp6-D.js';

const { getPrototypeOf } = Object;
const { construct } = Reflect;
const { toStringTag } = Symbol;
const { toString } = object;

const toName = (ref, name = toString.call(ref).slice(8, -1)) =>
  name in globalThis ? name : toName(getPrototypeOf(ref) || object);

const toTag = (ref, name = ref[toStringTag]) =>
  name in globalThis ? name : toTag(construct(getPrototypeOf(ref.constructor),[0]));

export { toTag as a, toName as t };
