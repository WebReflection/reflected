let t=!0;try{crypto.randomUUID()}catch(o){t=!1}const o=t?()=>crypto.randomUUID():()=>(Date.now()+Math.random()).toString(36);export{o as r};
