/**
 * miniCalculator.js — floating modal calculator with live chart and what-if slider
 */
import { modal } from './ui.js';
import { mountMiniCalcChart } from './charts.js';
export function openMiniCalc(){
  const el = modal(`
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
      <div><label>Daily deficit (kcal)</label><input id="mc-def" type="number" step="50" value="300"></div>
      <div><label>What if</label><input id="mc-range" type="range" min="100" max="900" step="50" value="300"></div>
    </div>
    <div class="card glass" style="margin-top:8px">
      <canvas id="mc-chart" height="130"></canvas>
      <div id="mc-out" style="margin-top:6px"></div>
    </div>
  `, { id:'miniCalcModal' });
  const $ = (sel)=> el.querySelector(sel);
  const cur = $('#mc-cur'), tgt = $('#mc-tgt'), tier = $('#mc-tier'), def = $('#mc-def'), rng = $('#mc-range');
  [cur,tgt,tier,def,rng].forEach(i=> i.addEventListener('input', calc));
  function calc(){
    const w = Number(cur.value||0), g=Number(tgt.value||0);
    let d = Number(def.value||0); const tierD = Number(tier.value||0); if(!d) d = tierD;
    const daily = Math.max(100, Math.min(1000, d)); // cap for tool
    const weekly = daily*7; const perWeekKg = +(weekly / 7700).toFixed(2);
    const needKg = Math.abs(g-w); const weeks = perWeekKg? Math.ceil(needKg / perWeekKg) : 0;
    const min = Math.round(weeks*0.85), max = Math.round(weeks*1.15);
    $('#mc-out').innerHTML = `<div>Weekly deficit: <strong>${weekly}</strong> kcal</div>
      <div>Expected change: <strong>${perWeekKg} kg/week</strong></div>
      <div>Estimated timeframe: <strong>${min} to ${max} weeks</strong></div>`;
    const labels = Array.from({length: Math.max(2, weeks||8)}, (_,i)=> `W${i+1}`);
    let series = []; let x=w; for(let i=0;i<labels.length;i++){ x += (g<w ? -perWeekKg : perWeekKg); series.push(+x.toFixed(1)); }
    const ctx = $('#mc-chart').getContext('2d'); mountMiniCalcChart(ctx, labels, series);
  }
  calc();
}
