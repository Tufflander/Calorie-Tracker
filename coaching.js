import { toast } from './ui.js';export function renderCoach(root){root.innerHTML=`
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
        <div style="margin-top:8px"><button class="btn primary">Save check-in</button></div>
      </form>
      <div id="suggest" class="card glass" style="margin-top:8px"></div>
    </section>`;const form=root.querySelector('#wk');form.onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(form).entries());let msg="You logged again today. Nice work. Let us keep this week simple. Hit protein and a 300 kcal deficit on weekdays. Enjoy maintenance on Saturday.";const hunger=+v.hunger||0,sleep=+v.sleepHrs||0,stress=+v.stress||0;if(sleep<6)msg="Your weight is up today, likely water from salt or carbs. The trend is still on track.";if(hunger>7)msg="The last week was patchy. Let us reset with one small win today. Hit your protein target.";document.getElementById('suggest').innerText=msg;toast('Check-in saved')}}