/**
 * targets.js — compute targets & macros with guardrails
 */
import { clamp, activityMult, reeMifflin, reeKatch } from './utils.js';
export function calcTargets(user){
  const useKatch = user.bodyFatPct!=null && user.bodyFatPct>3 && user.bodyFatPct<60;
  const REE = useKatch? reeKatch(user) : reeMifflin(user);
  const TDEE = REE * activityMult(user.activityLevel);
  let pct = 0;
  if(user.goal==='lose') pct = -0.15;
  else if(user.goal==='gain') pct = 0.1;
  else if(user.goal==='recomp') pct = -0.05;
  let cal = Math.round(TDEE * (1 + pct));
  const minKcal = user.sexAtBirth==='female'?1200:1500;
  const clampedLow = cal < minKcal;
  cal = Math.max(minKcal, cal);
  const targetBW = user.targetWeightKg || user.weightKg;
  const proteinPerKg = 2.0;
  const fatPerKg = 0.7;
  const proteinG = Math.round(proteinPerKg * targetBW);
  const fatG = Math.round(fatPerKg * targetBW);
  const carbsG = Math.max(0, Math.round((cal - proteinG*4 - fatG*9)/4));
  return { tdeeKcal: Math.round(TDEE), calorieTargetKcal: cal, weeklyBudgetKcal: cal*7, proteinG, fatG, carbG: carbsG, guardrails:{ clamped: clampedLow } };
}
