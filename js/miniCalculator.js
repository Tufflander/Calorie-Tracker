import { modal } from './ui.js';
export function openMiniCalc(applyCb){
  const el=modal(`
    <h2>Goal timeframe</h2>
    <div class="row3">
      <div><label>Current weight (kg)</label><input id="mc-cur" type="number" step="0.1"></div>
      <div><label>Target weight (kg)</label><input id="mc-tgt" type="number" step="0.1"></div>
      <div>
        <label>Exercise tier</label>
        <select id="mc-tier">
          <option value="0">Sedentary (0)</option>
          <option value="100">Light (100)</option>
          <option value="200" selected>Moderate (200)</option>
          <option value="300">High (300)</option>
          <option value="400">Athlete (400)</option>
        </select>
      </div>
    </div>
    <div class="row" style="margin-top:8px">
      <div><label>Daily deficit (kcal)</label><input id="mc-def" type="number" step="50" value="300" min="0" max="750"></div>
      <div><label>What if</label><input id="mc-range" type="range" min="0" max="750" step="50" value="300"></div>
    </div>
    <div id="mc-out" style="margin-top:6px"></div>
    <div style="display:flex; gap:8px; margin-top:8px">
      <button id="apply" class="btn primary">Send to targets</button>
    </div>
  `,{id:'miniCalcModal'});
  const $=s=>el.querySelector(s);
  const cur=$('#mc-cur'),tgt=$('#mc-tgt'),tier=$('#mc-tier'),def=$('#mc-def'),rng=$('#mc-range'),out=$('#mc-out');
  [cur,tgt,tier,def,rng].forEach(i=>i.addEventListener('input',calc));
  rng.addEventListener('input',()=>def.value=rng.value);
  def.addEventListener('input',()=>rng.value=def.value);
  function calc(){
    const w=Number(cur.value||0),g=Number(tgt.value||0);
    let d=Number(def.value||0);
    const tierD=Number(tier.value||0);
    if(!d)d=tierD;
    d=Math.max(0,Math.min(750,d));
    const weekly=d*7;
    const change=weekly/7700;
    const need=Math.abs(g-w);
    const weeks=change?Math.ceil(need/change):0;
    const min=Math.round(weeks*0.85),max=Math.round(weeks*1.15);
    out.innerHTML=`<div>Weekly deficit: <strong>${weekly}</strong> kcal</div>
      <div>Expected change: <strong>${change.toFixed(2)} kg/week</strong></div>
      <div>Estimated timeframe: <strong>${min||0} to ${max||0} weeks</strong></div>`;
    return{weekly,change,weeks};
  }
  const last=calc();
  $('#apply').onclick=()=>{const {change}=calc();applyCb?.(change)};
}
