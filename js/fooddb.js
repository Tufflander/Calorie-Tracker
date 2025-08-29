let foods=[];let barcodeIndex=new Map();
export async function ensureFoodDB(){
  if(foods.length) return;
  const res=await fetch('data/au_food_sample.json'); foods=await res.json();
  barcodeIndex=new Map(); foods.forEach(f=>{ if(f.ean) barcodeIndex.set(String(f.ean),f) });
}
export function searchFoods(q,exact=false){
  if(!q) return foods;
  if(exact){
    const byId=foods.find(f=>f.id===q); if(byId) return [byId];
    const byEAN=barcodeIndex.get(String(q)); return byEAN ? [byEAN] : [];
  }
  const t=q.toLowerCase(); return foods.filter(f => (f.name+' '+(f.brand||'')).toLowerCase().includes(t));
}
export function startBarcodeScan(cb){
  const tag=document.getElementById('quagga-cdn');
  if(tag && !window.Quagga){
    const s=document.createElement('script'); s.src=tag.dataset.src; s.onload=()=>start(); document.body.appendChild(s);
  }else start();
  function start(){
    if(!window.Quagga){ alert('Scanner not available'); return }
    const overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:60;display:flex;align-items:center;justify-content:center';
    overlay.innerHTML='<div class="glass card" style="padding:8px"><video id="qg" style="width:min(96vw,480px);height:auto"></video><div style="display:flex;gap:8px;margin-top:6px"><button class="btn" id="stopQ">Cancel</button></div></div>';
    document.body.appendChild(overlay);
    const stop=()=>{window.Quagga.stop();overlay.remove()};
    overlay.querySelector('#stopQ').onclick=stop;
    window.Quagga.init({inputStream:{name:'Live',type:'LiveStream',target:overlay.querySelector('#qg')},decoder:{readers:['ean_reader','ean_8_reader']}},(err)=>{
      if(err){ alert('Camera error'); stop(); return }
      window.Quagga.start();
    });
    window.Quagga.onDetected(data=>{const code=data.codeResult.code; cb?.(code); stop()});
  }
}
