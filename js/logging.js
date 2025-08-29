import { addFood, addWeight, addSteps, getFoodsByDate } from './store.js';import { toast } from './ui.js';import { iso } from './metrics.js';import { ensureFoodDB, searchFoods, startBarcodeScan } from './fooddb.js';export async function renderLog(root,params){await ensureFoodDB();root.innerHTML=`
    <section class="glass card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h2>Log</h2>
        <button class="btn" id="copyYesterday">Copy yesterday</button>
      </div>
      <div class="row">
        <div><input id="q" placeholder="Search foods" aria-label="Search foods"></div>
        <div><button class="btn" id="scan">Scan</button></div>
      </div>
      <div id="chips" style="margin-top:8px"></div>
      <div id="results" class="grid" style="margin-top:8px"></div>
    </section>`;const q=document.getElementById('q');const results=document.getElementById('results');q.addEventListener('input',show);show();function show(){const term=q.value.trim();const items=searchFoods(term).slice(0,30);results.innerHTML=items.map(f=>`
      <button class="btn" data-id="${'${'}f.id${'}'}" style="display:flex;justify-content:space-between">
        <span>${'${'}f.name${'}'} <small class="muted">${'${'}f.brand||''${'}'}${'${'}f.verified?' • ✓ verified':''${'}'}</small></span>
        <span>${'${'}f.kcal${'}'} kcal</span>
      </button>`).join('');results.querySelectorAll('button').forEach(b=>b.onclick=()=>addFromId(b.getAttribute('data-id')))}async function addFromId(id){const f=searchFoods(id,true)[0];if(!f)return;await addFood({id:crypto.randomUUID(),dateISO:iso(),meal:'lunch',name:f.name,brand:f.brand,kcal:f.kcal,proteinG:f.proteinG,fatG:f.fatG,carbG:f.carbG,source:'db'});toast('Logged to Today')}document.getElementById('scan').onclick=()=>{startBarcodeScan(async(code)=>{const f=searchFoods(code,true)[0];if(f){await addFood({id:crypto.randomUUID(),dateISO:iso(),meal:'snack',name:f.name,brand:f.brand,kcal:f.kcal,proteinG:f.proteinG,fatG:f.fatG,carbG:f.carbG,source:'barcode'});toast('Logged to Today')}else toast('Camera not available. Use Search or Quick kcal.')})};document.getElementById('copyYesterday').onclick=async()=>{const today=iso();const y=new Date();y.setDate(y.getDate()-1);const yISO=iso(y);const yFoods=await getFoodsByDate(yISO,yISO);if(!yFoods.length){toast('Nothing to copy');return}for(const f of yFoods){const copy={...f,id:crypto.randomUUID(),dateISO:today};await addFood(copy)}toast(`Copied ${'${'}yFoods.length${'}'} items`)}}