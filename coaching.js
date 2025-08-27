/**
 * coaching.js — weekly check-in and rule-based suggestions
 */
import { toast } from './ui.js';
export function renderCoach(root){
  root.innerHTML = `
    <section class="glass card">
      <h2>Weekly check-in</h2>
      <form id="wk">
        <div class="row">
          <div><label>Hunger (0–10)</label><input name="hunger" type="number" min="0" max="10"></div>
          <div><label>Sleep (hrs)</label><input name="sleepHrs" type="number" min="0" max="14" step="0.1"></div>
        </div>
        <div class="row">
          <div><label>Cravings (0–10)</label><input name="cravings" type="number" min="0" max="10"></div>
          <div><label>Stress (0–10)</label><input name="stress" type="number" min="0" max="10"></div>
        </div>
        <div><label>Training quality (0–10)</label><input name="trainingQuality" type="number" min="0" max="10"></div>
        <div style="margin-top:8px"><button class="btn primary">Get suggestion</button></div>
      </form>
      <div id="suggest" class="card glass" style="margin-top:8px"></div>
    </section>
  `;
  root.querySelector('#wk').onsubmit = (e)=>{
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target).entries());
    const hunger = Number(f.hunger||0), sleep = Number(f.sleepHrs||0), cravings=Number(f.cravings||0), stress=Number(f.stress||0);
    let msg = "Nice work showing up. Keep it simple this week: hit protein and a 300 kcal deficit on weekdays.";
    if(sleep<6) msg = "Sleep looks low. Try a 15-minute earlier bedtime and keep caffeine before midday.";
    if(hunger>7) msg = "Hunger is high. Add 10 g fibre and 300 ml water to two meals. Keep protein steady.";
    if(stress>7) msg = "Stress is up. Keep steps consistent and aim for maintenance calories for two days.";
    root.querySelector('#suggest').innerText = msg;
    toast('Suggestion updated');
  };
}
