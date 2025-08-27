/**
 * logging.js — quick add (kcal/protein), food search, barcode hook, weight & steps
 */
import { addLog, getState } from './store.js';
import { iso } from './utils.js';
import { searchFoods, ensureFoodDB, startBarcodeScan } from './fooddb.js';
import { toast } from './ui.js';
export async function renderLog(root){
  await ensureFoodDB();
  root.innerHTML = `
    <section class="glass card">
      <h2>Quick add</h2>
      <div class="row">
        <div>
          <label>Energy (kcal)</label>
          <input id="qa-kcal" type="number" inputmode="numeric" placeholder="e.g. 250">
        </div>
        <div>
          <label>Protein (g)</label>
          <input id="qa-pro" type="number" inputmode="numeric" placeholder="e.g. 20">
        </div>
      </div>
      <div style="margin-top:8px;display:flex;gap:8px">
        <button class="btn primary" id="qa-add">Add</button>
        <button class="btn" id="scan">Scan barcode</button>
      </div>
    </section>

    <section class="glass card">
      <h2>Food search (AU)</h2>
      <input id="q" placeholder="Search Woolies/Coles, sushi, Thai…" aria-label="Search foods">
      <div id="results" class="grid"></div>
    </section>

    <section class="glass card">
      <h2>Weight & steps</h2>
      <div class="row">
        <div><label>Weight (kg)</label><input id="w-kg" type="number" step="0.1"></div>
        <div><label>Steps</label><input id="w-steps" type="number" step="1"></div>
      </div>
      <div style="margin-top:8px;display:flex;gap:8px">
        <button class="btn" id="w-save">Save</button>
      </div>
    </section>
  `;
  document.getElementById('qa-add').onclick = async ()=>{
    const kcal = Number(document.getElementById('qa-kcal').value||0);
    const proteinG = Number(document.getElementById('qa-pro').value||0);
    if(!kcal){ toast('Enter kcal'); return; }
    await addLog('foods', { id:crypto.randomUUID(), dateISO:iso(), meal:'snack', name:'Quick add', kcal, proteinG, fatG:0, carbG:0, source:'quick' });
    toast('Added');
  };
  document.getElementById('scan').onclick = async ()=>{
    startBarcodeScan(async (ean)=>{
      const found = searchFoods(ean, true)[0];
      if(found){
        await addLog('foods', { id:crypto.randomUUID(), dateISO:iso(), meal:'snack', name:found.name, brand:found.brand, kcal:found.kcal, proteinG:found.proteinG, fatG:found.fatG, carbG:found.carbG, source:'barcode' });
        toast('Scanned and added');
      } else {
        toast('No match, quick add instead');
      }
    });
  };
  const q = document.getElementById('q');
  const results = document.getElementById('results');
  q.addEventListener('input', ()=>{
    const items = searchFoods(q.value).slice(0,20);
    results.innerHTML = items.map(f=>`
      <button class="btn" aria-label="Add ${f.name}" data-id="${f.id}" style="justify-content:space-between;display:flex">
        <span>${f.name} <small class="muted">— ${f.brand||''}</small></span>
        <span>${f.kcal} kcal</span>
      </button>`).join('');
    results.querySelectorAll('button').forEach(b=>{
      b.onclick = async ()=>{
        const id = b.getAttribute('data-id');
        const f = searchFoods(id, true)[0];
        if(!f) return;
        await addLog('foods', { id:crypto.randomUUID(), dateISO:iso(), meal:'lunch', name:f.name, brand:f.brand, kcal:f.kcal, proteinG:f.proteinG, fatG:f.fatG, carbG:f.carbG, source:'db' });
        toast('Added to today');
      };
    });
  });
  document.getElementById('w-save').onclick = async ()=>{
    const kg = Number(document.getElementById('w-kg').value||0);
    const steps = Number(document.getElementById('w-steps').value||0);
    if(kg) await addLog('weight', { id:iso()+':w', dateISO:iso(), kg });
    if(steps) await addLog('steps', { id:iso()+':s', dateISO:iso(), steps });
    toast('Saved');
  };
}
