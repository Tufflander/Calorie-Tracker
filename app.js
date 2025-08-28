import { hydrate, getState, setSettings, addFood, addWeight, addHydration, addSteps, getFoodsByDate } from './store.js';import { route, initRouter, nav } from './router.js';import { toast, modal, sheet } from './ui.js';import { openMiniCalc } from './miniCalculator.js';import { renderLog } from './logging.js';import { renderCoach } from './coaching.js';import { mountMacroRing, updateMacroRing } from './charts.js';import { iso, startOfWeek, endOfWeek, sumKcal, sumProtein, kcalToKJ } from './metrics.js';import { calcTargets } from './targets.js';import { ensureFoodDB, searchFoods, startBarcodeScan } from './fooddb.js';
const themeToggle=document.getElementById('themeToggle');const unitsToggle=document.getElementById('unitsToggle');
async function renderToday(){const root=document.getElementById('app');const s=getState();await ensureFoodDB();const todayISO=iso();const weekFrom=iso(startOfWeek(new Date()));const weekTo=iso(new Date(endOfWeek(new Date())-1));const foodsToday=await getFoodsByDate(todayISO,todayISO);const kcalToday=sumKcal(foodsToday);const proToday=sumProtein(foodsToday);const t=s.targets;root.innerHTML=`
    <section class="glass card" id="today-macro-card">
      <div class="macro-card">
        <div class="macro-ring"><canvas id="macroCanvas" width="120" height="120" aria-label="Calories ring"></canvas></div>
        <div class="macro-labels">
          ${'${'}t? `<div style="font-size:26px;font-weight:800">${'${'}displayEnergy(kcalToday,s.settings.units)${'}'} / ${'${'}displayEnergy(t.calorieTargetKcal,s.settings.units)${'}'}</div>` : `<div class="warn">Complete onboarding to get targets</div>`${'}'}
          <div class="week-ticker" id="weekTicker"></div>
          <div class="kj-badge">Double tap ring to toggle kcal/kJ</div>
        </div>
      </div>
    </section>
    <section class="glass card">
      <div class="quick-row">
        <button class="btn quick-mini" id="qScan">Scan</button>
        <button class="btn quick-mini" id="qSearch">Search</button>
        <button class="btn quick-mini" id="qKcal">Quick kcal</button>
        <button class="btn quick-mini" id="qProtein">Protein</button>
        <button class="btn quick-mini" id="qWater">Water +250 ml</button>
        <button class="btn quick-mini" id="qWeigh">Weigh-in</button>
      </div>
    </section>
    <section class="glass card">
      <h3>Today’s meals</h3>
      <div id="meals" class="meal-list grid"></div>
      <div id="yChip" style="margin-top:8px"></div>
    </section>
    <section class="glass card">
      <h3>Movement & steps</h3>
      <div id="stepsRow"></div>
      <div style="margin-top:8px"><button class="btn" id="bumpSteps">+2,000 steps today</button></div>
    </section>
    <section class="glass card">
      <h3>Protein progress</h3>
      <div class="progress-bar"><span id="proteinBar" style="width:0%"></span></div>
      <div id="proteinCopy" style="margin-top:6px"></div>
    </section>
    <section class="glass card" id="miniNudge"></section>`;if(t){mountMacroRing(document.getElementById('macroCanvas'),kcalToday,t.calorieTargetKcal);const ring=document.getElementById('macroCanvas');let tapCount=0,tapTimer=null;ring.addEventListener('click',()=>{tapCount++;if(tapCount===2){unitsToggle.checked=!unitsToggle.checked;unitsToggle.onchange();updateHeader();tapCount=0;clearTimeout(tapTimer);return}tapTimer=setTimeout(()=>tapCount=0,250);setTimeout(()=>nav('/log',{mode:'search'}),260)})}updateHeader();async function updateHeader(){const foodsWeek=await getFoodsByDate(weekFrom,weekTo);const sumWeek=sumKcal(foodsWeek);const remaining=t?(t.weeklyBudgetKcal-sumWeek):0;document.getElementById('weekTicker').innerText=t?`Weekly remaining: ${'${'}displayEnergy(remaining,s.settings.units)${'}'}`:''}renderMeals();async function renderMeals(){const foods=await getFoodsByDate(todayISO,todayISO);const el=document.getElementById('meals');if(!foods.length){el.innerHTML='<div class="muted">No items yet</div>'}else{el.innerHTML=foods.map(f=>`
        <div class="item" data-id="${'${'}f.id${'}'}" title="Long-press to favourite">
          <span>${'${'}f.name${'}'}</span>
          <span class="kcal">${'${'}f.kcal${'}'} kcal</span>
          <button class="icon-btn" data-del="${'${'}f.id${'}'}" aria-label="Delete">✕</button>
        </div>`).join('');el.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{await (await import('./store.js')).removeFood(b.getAttribute('data-del'));toast('Removed item');renderToday()});el.querySelectorAll('.item').forEach(it=>{let timer=null;const id=it.getAttribute('data-id');const start=()=>timer=setTimeout(async()=>{const store=await import('./db.js');const rec=foods.find(x=>x.id===id);await store.put('favourites',{id:rec.name,type:'food',data:rec});toast('Saved to Favourites')},600);const cancel=()=>{if(timer){clearTimeout(timer);timer=null}};it.addEventListener('mousedown',start);it.addEventListener('touchstart',start);it.addEventListener('mouseup',cancel);it.addEventListener('mouseleave',cancel);it.addEventListener('touchend',cancel)})}const y=new Date();y.setDate(y.getDate()-1);const yISO=iso(y);const yFoods=await getFoodsByDate(yISO,yISO);const chip=document.getElementById('yChip');chip.innerHTML=yFoods.length?`<button class="chip" id="copyY">Copy yesterday’s dinner</button>`:'';const btn=document.getElementById('copyY');if(btn){btn.onclick=async()=>{for(const f of yFoods){await addFood({...f,id:crypto.randomUUID(),dateISO:iso()})}toast(`Copied ${'${'}yFoods.length${'}'} items`);renderToday()}}}const stepGoal=(s.settings.tempStepGoalDate===todayISO&&s.settings.tempStepGoal)?s.settings.tempStepGoal:(s.user?.typicalSteps||8000);const steps=0;const stepsRow=document.getElementById('stepsRow');stepsRow.textContent=`${'${'}steps${'}'} / ${'${'}stepGoal${'}'} steps`;document.getElementById('bumpSteps').onclick=()=>{const x={...s.settings,tempStepGoal:stepGoal+2000,tempStepGoalDate:todayISO};setSettings(x);toast('Goal bumped for today')};const pct=t?Math.min(100,Math.round(proToday/t.proteinG*100)):0;document.getElementById('proteinBar').style.width=pct+'%';document.getElementById('proteinCopy').innerHTML=t?`${'${'}proToday${'}'} g / ${'${'}t.proteinG${'}'} g ${'${'}pct>=100? '<span class="badge">Protein target hit</span>':''${'}'}`:'Set targets to see protein goals';const now=new Date();let nudge='';if(t&&now.getHours()>=13&&proToday<0.4*t.proteinG){nudge='Protein is a bit low by lunch. Add a 25 g snack.'}else{nudge='Keep showing up. Small steps add up.'}document.getElementById('miniNudge').innerText=nudge;document.getElementById('qSearch').onclick=()=>nav('/log',{mode:'search'});document.getElementById('qKcal').onclick=()=>{const sh=sheet(`<h3>Quick kcal</h3>
      <div class="row"><button class="btn" data-k="100">+100</button><button class="btn" data-k="200">+200</button></div>
      <div class="row" style="margin-top:6px"><button class="btn" data-k="300">+300</button><div><label>Custom kcal</label><input id="kCustom" type="number"></div></div>
      <div style="margin-top:8px"><button class="btn primary" id="kSave">Add</button></div>`,{id:'sheet-kcal'});sh.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>sh.querySelector('#kCustom').value=b.getAttribute('data-k'));sh.querySelector('#kSave').onclick=async()=>{const v=Number(sh.querySelector('#kCustom').value||0)||100;await addFood({id:crypto.randomUUID(),dateISO:iso(),meal:'snack',name:'Quick kcal',kcal:v,proteinG:0,fatG:0,carbG:0,source:'quick'});sh.remove();toast('Logged to Today');renderToday()}};document.getElementById('qProtein').onclick=()=>{const sh=sheet(`<h3>Protein quick add</h3>
      <div><label>Grams</label><input id="pG" type="number" value="20"></div>
      <div style="margin-top:8px"><button class="btn primary" id="pSave">Add</button></div>`,{id:'sheet-pro'});sh.querySelector('#pSave').onclick=async()=>{const g=Number(sh.querySelector('#pG').value||20);await addFood({id:crypto.randomUUID(),dateISO:iso(),meal:'snack',name:'Protein quick add',kcal=g*4,proteinG:g,fatG:0,carbG:0,source:'quick'});sh.remove();toast('Logged to Today');renderToday()}};document.getElementById('qWater').onclick=async()=>{await addHydration({id:crypto.randomUUID(),dateISO:iso(),waterMl:250});toast('Added 250 ml water')};document.getElementById('qWeigh').onclick=()=>{const m=modal(`<h3>Weigh-in</h3><div><label>Weight (kg)</label><input id="wkg" type="number" step="0.1"></div>
      <div style="margin-top:8px"><button class="btn primary" id="wsave">Save</button></div>`,{id:'weigh'});m.querySelector('#wsave').onclick=async()=>{const kg=Number(m.querySelector('#wkg').value||0);await addWeight({id:iso()+':w',dateISO:iso(),kg});m.remove();toast(`Weight saved ${'${'}kg${'}'} kg`)}};document.getElementById('qScan').onclick=()=>{startBarcodeScan(async(code)=>{const f=searchFoods(code,true)[0];if(f){await addFood({id:crypto.randomUUID(),dateISO:iso(),meal:'snack',name:f.name,brand:f.brand,kcal:f.kcal,proteinG:f.proteinG,fatG:f.fatG,carbG:f.carbG,source:'barcode'});toast('Logged to Today');renderToday()}else toast('Camera not available. Use Search or Quick kcal.')})};window.bus.on('log:addFood',async()=>{const foods=await getFoodsByDate(todayISO,todayISO);const kcal=sumKcal(foods);updateMacroRing(kcal,s.targets?.calorieTargetKcal||0);toast('Logged to Today')})}
function displayEnergy(kcal,units){return units==='kJ'?`${'${'}Math.round(kcalToKJ(kcal))${'}'} kJ`:`${'${'}kcal${'}'} kcal`}
async function renderWeekly(){const root=document.getElementById('app');const s=getState();const t=s.targets;const weekFrom=startOfWeek(new Date());const weekTo=endOfWeek(new Date());const foods=await (await import('./store.js')).getFoodsByDate(iso(weekFrom),iso(new Date(+weekTo-1)));const sum=sumKcal(foods);const remaining=t?t.weeklyBudgetKcal-s:0;root.innerHTML=`
    <section class="glass card"><h2>Weekly budget</h2>
      <div class="progress-bar"><span style="width:${'${'}t?Math.min(100,Math.round(sum/t.weeklyBudgetKcal*100)):0${'}'}%"></span></div>
      <div style="margin-top:6px">Remaining: <strong>${'${'}displayEnergy(remaining,s.settings.units)${'}'}</strong></div>
    </section>
    <section class="glass card"><h3>Calendar</h3><p>Rebalance coming next.</p></section>
    <section class="glass card"><h3>Adherence</h3><p>Tiles coming next.</p></section>`}
async function renderProgress(){document.getElementById('app').innerHTML=`<section class="glass card"><h2>Progress</h2><p>Trend charts will appear as you log more weigh-ins.</p></section>`}
function renderMore(){const root=document.getElementById('app');const s=getState();root.innerHTML=`
    <section class="glass card">
      <h2>Settings</h2>
      <div class="row">
        <div><label>Theme</label>
          <select id="set-theme"><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select>
        </div>
        <div><label>Units</label>
          <select id="set-units"><option value="kcal">kcal</option><option value="kJ">kJ</option></select>
        </div>
      </div>
      <div style="margin-top:8px"><button class="btn" id="wipe">Delete my data</button></div>
    </section>`;document.getElementById('set-theme').value=s.settings.theme;document.getElementById('set-units').value=s.settings.units;document.getElementById('set-theme').onchange=e=>setSettings({...s.settings,theme:e.target.value});document.getElementById('set-units').onchange=e=>setSettings({...s.settings,units:e.target.value});document.getElementById('wipe').onclick=async()=>{if(prompt('Type DELETE to confirm')?.toUpperCase()==='DELETE'){await (await import('./db.js')).wipeAll();localStorage.clear();location.reload()}}}
function mount(path,fn){route(path,()=>fn())}mount('/today',renderToday);mount('/log',(params)=>renderLog(document.getElementById('app'),params));mount('/weekly',renderWeekly);mount('/progress',renderProgress);mount('/coach',(root)=>renderCoach(document.getElementById('app')));mount('/more',renderMore);initRouter();
hydrate().then(()=>{const s=getState();applyTheme(s.settings.theme);themeToggle.checked=s.settings.theme==='dark';unitsToggle.checked=s.settings.units==='kJ'});themeToggle.onchange=()=>{const v=themeToggle.checked?'dark':'light';applyTheme(v);setSettings({...getState().settings,theme:v})};unitsToggle.onchange=()=>{const v=unitsToggle.checked?'kJ':'kcal';setSettings({...getState().settings,units:v})};function applyTheme(mode){document.body.classList.remove('theme-auto','theme-light','theme-dark');document.body.classList.add('theme-'+mode)}
const fab=document.getElementById('fabMain');let lpTimer=null;fab.addEventListener('mousedown',()=>lpTimer=setTimeout(()=>openMiniCalc((pace)=>{toast('Pace applied to plan')}),500));fab.addEventListener('mouseup',()=>{if(lpTimer){clearTimeout(lpTimer);lpTimer=null}});fab.addEventListener('click',()=>{const sh=sheet(`<h3>Quick Add</h3>
    <div class="grid two">
      <button class="btn" id="qa-search">Search</button>
      <button class="btn" id="qa-scan">Scan</button>
      <button class="btn" id="qa-kcal">Quick kcal</button>
      <button class="btn" id="qa-pro">Protein</button>
      <button class="btn" id="qa-water">Water +250 ml</button>
      <button class="btn" id="qa-weigh">Weigh-in</button>
    </div>`,{id:'qa-sheet'});sh.querySelector('#qa-search').onclick=()=>{sh.remove();location.hash='#/log?mode=search'};sh.querySelector('#qa-scan').onclick=()=>{sh.remove();document.getElementById('qScan')?.click()};sh.querySelector('#qa-kcal').onclick=()=>{sh.remove();document.getElementById('qKcal')?.click()};sh.querySelector('#qa-pro').onclick=()=>{sh.remove();document.getElementById('qProtein')?.click()};sh.querySelector('#qa-water').onclick=async()=>{sh.remove();await addHydration({id:crypto.randomUUID(),dateISO:iso(),waterMl:250});toast('Added 250 ml water')};sh.querySelector('#qa-weigh').onclick=()=>{sh.remove();document.getElementById('qWeigh')?.click()}});
window.addEventListener('keydown',(e)=>{if(e.key.toLowerCase()==='a')fab.click();if(e.key.toLowerCase()==='s')document.getElementById('qScan')?.click();if(e.key.toLowerCase()==='w')document.getElementById('qWeigh')?.click();if(e.key.toLowerCase()==='c')openMiniCalc((pace)=>{toast('Pace applied to plan')})});
if('serviceWorker' in navigator && location.protocol.startsWith('https')){navigator.serviceWorker.register('sw.js')}