/**
 * utils.js — helpers (dates, units, maths, EWMA)
 */
export const DAY = 86400000;
export function iso(d=new Date()){ return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); }
export function addDays(d, n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
export const kcalToKJ = (kcal)=> Math.round(kcal * 4.184);
export const kJToKcal = (kj)=> Math.round(kj / 4.184);
export const clamp = (v,min,max)=> Math.max(min, Math.min(max,v));
export function ewma(values, alpha=0.25){ const out=[]; let prev=null; for(const v of values){ if(v==null){ out.push(prev); continue; } prev = prev==null ? v : alpha*v + (1-alpha)*prev; out.push(prev);} return out; }
export const mean = (arr)=> arr.length? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
export function slopePerDay(values){ const ys = values.filter(v=>typeof v==='number'); if(ys.length<2) return 0; const xs = ys.map((_,i)=>i); const n = ys.length; const sx = xs.reduce((a,b)=>a+b,0); const sy = ys.reduce((a,b)=>a+b,0); const sxy = xs.reduce((a,x,i)=>a + x*ys[i], 0); const sxx = xs.reduce((a,x)=>a + x*x, 0); const m = (n*sxy - sx*sy)/(n*sxx - sx*sx || 1); return m; }
export function activityMult(level){ return { sedentary:1.2, light:1.375, moderate:1.55, high:1.725, athlete:1.9 }[level] || 1.55; }
export function reeMifflin({sexAtBirth, weightKg, heightCm, age}){ return 10*weightKg + 6.25*heightCm - 5*age + (sexAtBirth==='male'?5:-161); }
export function reeKatch({weightKg, bodyFatPct}){ const LBM = weightKg * (1 - (bodyFatPct||0)/100); return 370 + 21.6 * LBM; }
