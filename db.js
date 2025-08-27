/**
 * db.js — Tiny IndexedDB wrapper for "calapp"
 */
const DB_NAME = 'calapp';
const DB_VER = 1;
function openDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      const stores = ['user','targets','foods','weight','steps','training','hydration','recipes','favourites','checkins','settings'];
      stores.forEach(s=>{ if(!db.objectStoreNames.contains(s)){ db.createObjectStore(s, { keyPath:'id' }); } });
      ['foods','weight','steps','training','hydration','checkins'].forEach(s=>{
        const os = req.transaction.objectStore(s);
        if(os && !os.indexNames.contains('dateISO')) os.createIndex('dateISO','dateISO',{unique:false});
      });
    };
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
}
export async function put(store, obj){ const db = await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(store,'readwrite'); tx.objectStore(store).put(obj); tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error); }); }
export async function get(store, id){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(store); const r=tx.objectStore(store).get(id); r.onsuccess=()=>res(r.result||null); r.onerror=()=>rej(r.error); }); }
export async function byDate(store, fromISO, toISO){
  const db=await openDB();
  return new Promise((res,rej)=>{
    const tx=db.transaction(store); const idx=tx.objectStore(store).index('dateISO'); const range = IDBKeyRange.bound(fromISO, toISO);
    const out=[]; idx.openCursor(range).onsuccess = e=>{ const c=e.target.result; if(c){ out.push(c.value); c.continue(); } else res(out); }; tx.onerror=()=>rej(tx.error);
  });
}
export async function all(store){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(store); const req=tx.objectStore(store).getAll(); req.onsuccess=()=>res(req.result||[]); req.onerror=()=>rej(req.error); }); }
export async function wipeAll(){ const db=await openDB(); return new Promise((res)=>{ const stores=[...db.objectStoreNames]; let left=stores.length; stores.forEach(s=>{ const tx=db.transaction(s,'readwrite'); tx.objectStore(s).clear(); tx.oncomplete=()=>{ if(--left===0) res(); }; }); }); }
