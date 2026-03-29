let i = 0;

const FALSE = i++;
const TRUE = i++;

const UNDEFINED = i++;
const NULL = i++;

const NUMBER = i++;
const UI8 = i++;
const NAN = i++;
const INFINITY = i++;
const N_INFINITY = i++;
const ZERO = i++;
const N_ZERO = i++;

const BIGINT = i++;
const BIGUINT = i++;

const STRING = i++;

const SYMBOL = i++;

const ARRAY = i++;
const BUFFER = i++;
const DATE = i++;
const ERROR = i++;
const MAP = i++;
const OBJECT = i++;
const REGEXP = i++;
const SET = i++;
const VIEW = i++;

const IMAGE_DATA = i++;
const BLOB = i++;
const FILE = i++;

const RECURSION = i++;

class Never {}

const ImageData = globalThis.ImageData || /** @type {typeof ImageData} */(Never);

const decoder = new TextDecoder;

const encoder = new TextEncoder;

const buffer = new ArrayBuffer(8);
const dv = new DataView(buffer);
const u8a8 = new Uint8Array(buffer);

export { ARRAY as A, BLOB as B, DATE as D, ERROR as E, FILE as F, INFINITY as I, MAP as M, NULL as N, OBJECT as O, RECURSION as R, SYMBOL as S, TRUE as T, UI8 as U, VIEW as V, ZERO as Z, BIGUINT as a, BIGINT as b, N_ZERO as c, dv as d, N_INFINITY as e, NAN as f, FALSE as g, REGEXP as h, IMAGE_DATA as i, ImageData as j, SET as k, STRING as l, decoder as m, BUFFER as n, NUMBER as o, UNDEFINED as p, encoder as q, u8a8 as u };
