/**
 * store.js — App state + pub/sub + mirror to localStorage
 */
import * as db from './db.js';
const listeners = new Map();
export function subscribe(ev, fn){ if(!listeners.has(ev)) listeners.set(ev,new Set()); listeners.get(ev).add(fn); return ()=>listeners.get(ev).delete(fn); }
export function emit(ev, data){ (listeners.get(ev)||[]).forEach(fn=>fn(data)); }
const mem = { user:null, targets:null, settings:{ theme:'auto', units:'kcal' }, cache:{} };
export function getState(){ return mem; }
export async function hydrate(){
  const [user, targets, settings] = await Promise.all([ db.get('user','user'), db.get('targets','targets'), db.get('settings','settings') ]);
  mem.user = user?.data || JSON.parse(localStorage.getItem('user')||'null');
  mem.targets = targets?.data || JSON.parse(localStorage.getItem('targets')||'null');
  mem.settings = settings?.data || JSON.parse(localStorage.getItem('settings')||'null') || mem.settings;
  emit('hydrated', mem);
}
export async function setUser(u){ mem.user=u; localStorage.setItem('user', JSON.stringify(u)); await db.put('user',{id:'user',data:u}); emit('user',u); }
export async function setTargets(t){ mem.targets=t; localStorage.setItem('targets', JSON.stringify(t)); await db.put('targets',{id:'targets',data:t}); emit('targets',t); }
export async function setSettings(s){ mem.settings=s; localStorage.setItem('settings', JSON.stringify(s)); await db.put('settings',{id:'settings',data:s}); emit('settings',s); }
export async function addLog(kind, item){ await db.put(kind, item); emit(kind, item); }
