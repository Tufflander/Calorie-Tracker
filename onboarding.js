/**
 * onboarding.js — multi-step wizard to capture user profile and set targets.
 */
import { setUser, setTargets, getState } from './store.js';
import { calcTargets } from './targets.js';
export function renderOnboarding(root){
  root.innerHTML = `
    <section class="card glass">
      <h2>Welcome</h2>
      <p>Let’s set smart targets. You can edit any time.</p>
      <form id="ob" class="grid">
        <div class="grid two">
          <div>
            <label>Sex at birth</label>
            <select name="sexAtBirth" required>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label>Age (years)</label>
            <input type="number" name="age" min="14" max="100" required>
          </div>
          <div>
            <label>Height (cm)</label>
            <input type="number" name="heightCm" min="120" max="230" required>
          </div>
          <div>
            <label>Current weight (kg)</label>
            <input type="number" name="weightKg" min="30" max="250" step="0.1" required>
          </div>
          <div>
            <label>Body fat % (optional)</label>
            <input type="number" name="bodyFatPct" min="3" max="60" step="0.1" placeholder="optional">
          </div>
          <div>
            <label>Activity level</label>
            <select name="activityLevel">
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate" selected>Moderate</option>
              <option value="high">High</option>
              <option value="athlete">Athlete</option>
            </select>
          </div>
          <div>
            <label>Goal</label>
            <select name="goal">
              <option value="lose" selected>Lose fat</option>
              <option value="gain">Build muscle</option>
              <option value="recomp">Recomp</option>
              <option value="maintain">Maintain</option>
            </select>
          </div>
          <div>
            <label>Target weight (kg, optional)</label>
            <input type="number" name="targetWeightKg" step="0.1" placeholder="optional">
          </div>
        </div>
        <div>
          <button class="btn primary" type="submit">Create plan</button>
        </div>
      </form>
      <div id="ob-preview" class="card glass" style="margin-top:10px"></div>
    </section>
  `;
  const form = root.querySelector('#ob');
  const preview = root.querySelector('#ob-preview');
  function updatePreview(){
    const data = Object.fromEntries(new FormData(form).entries());
    ['age','heightCm','weightKg','bodyFatPct','targetWeightKg'].forEach(k=>{ if(data[k]==='') delete data[k]; else data[k]=Number(data[k]); });
    const u = {...getState().user, ...data};
    const t = calcTargets(u);
    preview.innerHTML = `
      <h3>Plan preview</h3>
      <p>Daily: <strong>${t.calorieTargetKcal} kcal</strong> (${Math.round(t.calorieTargetKcal*4.184)} kJ),
         Protein <strong>${t.proteinG} g</strong>, Fat <strong>${t.fatG} g</strong>, Carbs <strong>${t.carbG} g</strong></p>
      <p>Weekly budget: <strong>${t.weeklyBudgetKcal} kcal</strong></p>
      ${t.guardrails.clamped ? `<div class="warn">We raised calories for safety. Very low calories can be risky. Consider chatting with a professional.</div>`:''}
    `;
  }
  form.addEventListener('input', updatePreview);
  updatePreview();
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    ['age','heightCm','weightKg','bodyFatPct','targetWeightKg'].forEach(k=>{ if(data[k]==='') delete data[k]; else data[k]=Number(data[k]); });
    const user = { id:'user', sexAtBirth:data.sexAtBirth, age:data.age, heightCm:data.heightCm, weightKg:data.weightKg,
      bodyFatPct:data.bodyFatPct ?? null, targetWeightKg:data.targetWeightKg ?? null, activityLevel:data.activityLevel, goal:data.goal,
      typicalSteps:6000, trainingSessionsPerWeek:2, macroPreset:'high_protein' };
    const targets = calcTargets(user);
    const { setUser, setTargets } = await import('./store.js');
    await setUser(user); await setTargets(targets);
    location.hash = '#/today';
  });
}
