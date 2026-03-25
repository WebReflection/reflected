const t=2*Int32Array.BYTES_PER_ELEMENT;let r=!0;try{crypto.randomUUID()}catch(t){r=!1}const o=r?()=>crypto.randomUUID():()=>(Date.now()+Math.random()).toString(36);export{t as b,o as r};
