export function activityMult(lvl){return{sedentary:1.2,light:1.375,moderate:1.55,high:1.725,athlete:1.9}[lvl]||1.55}
export function reeMifflin({sexAtBirth,weightKg,heightCm,age}){return 10*weightKg+6.25*heightCm-5*age+(sexAtBirth==='male'?5:-161)}
export function reeKatch({weightKg,bodyFatPct}){const LBM=weightKg*(1-(bodyFatPct||0)/100);return 370+21.6*LBM}
export function calcTargets(user){
  const useK=user.bodyFatPct!=null&&user.bodyFatPct>3&&user.bodyFatPct<60;
  const REE=useK?reeKatch(user):reeMifflin(user);
  const TDEE=REE*activityMult(user.activityLevel||'moderate');
  let pct=0;if(user.goal==='lose')pct=-0.15;else if(user.goal==='gain')pct=0.1;else if(user.goal==='recomp')pct=-0.05;
  let cal=Math.round(TDEE*(1+pct));
  const minK=user.sexAtBirth==='female'?1200:1500;
  const clamped=cal<minK;cal=Math.max(minK,cal);
  const targetBW=user.targetWeightKg||user.weightKg;
  const proteinG=Math.round(2.0*targetBW);
  const fatG=Math.round(0.7*targetBW);
  const carbG=Math.max(0,Math.round((cal-proteinG*4-fatG*9)/4));
  return{tdeeKcal:Math.round(TDEE),calorieTargetKcal:cal,weeklyBudgetKcal:cal*7,proteinG,fatG,carbG,guardrails:{clamped}};
}
