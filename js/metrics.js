export const DAY=86400000;
export function iso(d=new Date()){return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
export function startOfWeek(d=new Date()){const x=new Date(d);const day=(x.getDay()+6)%7;x.setHours(0,0,0,0);x.setDate(x.getDate()-day);return x}
export function endOfWeek(d=new Date()){const x=startOfWeek(d);x.setDate(x.getDate()+7);return x}
export function kcalToKJ(k){return Math.round(k*4.184)}
export function sumKcal(foods){return Math.round(foods.reduce((a,f)=>a+(Number(f.kcal)||0),0))}
export function sumProtein(foods){return Math.round(foods.reduce((a,f)=>a+(Number(f.proteinG)||0),0))}
