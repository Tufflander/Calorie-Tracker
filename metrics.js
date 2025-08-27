/**
 * metrics.js — trend, adherence, back-calculated TDEE (hooks)
 */
import { ewma, slopePerDay, addDays, mean } from './utils.js';
export function trendSeries(weights){ const vals = weights.map(w=>w?.kg ?? null); return ewma(vals, 0.25); }
export function paceToGoal(trendKg, datesISO, targetKg){
  if(trendKg.length<7) return null;
  const recent = trendKg.slice(-30).filter(x=>typeof x==='number');
  if(recent.length<7) return null;
  const slope = slopePerDay(recent);
  if(slope===0) return null;
  const current = recent[recent.length-1];
  const delta = targetKg - current;
  const days = Math.abs(delta / slope);
  return { weeksMin: Math.max(1, Math.round(days/7*0.85)), weeksMax: Math.max(1, Math.round(days/7*1.15)) };
}
export function adherence(daysWithAny, totalDays){ return totalDays? Math.round(100*daysWithAny/totalDays) : 0; }
export function proteinConsistency(proteinPerDay, targetProtein){ const hits = proteinPerDay.filter(x=>x>=targetProtein).length; return proteinPerDay.length? Math.round(100*hits/proteinPerDay.length) : 0; }
export function estimateTDEE(avgIntakeKcal, trendStartKg, trendEndKg, days){ const energyImplied = -(trendEndKg - trendStartKg) * 7700; return Math.round(avgIntakeKcal + (energyImplied / days) * 7); }
