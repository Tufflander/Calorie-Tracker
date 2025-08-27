/**
 * ui.js — toasts & modal
 */
export function toast(msg, ms=2200){
  const host = document.getElementById('toast');
  host.innerHTML = `<div class="toast" role="status">${msg}</div>`;
  setTimeout(()=> host.innerHTML='', ms);
}
export function modal(html, {id='modal', onClose}={}){
  const el = document.createElement('div');
  el.id = id;
  el.className = 'glass card';
  el.style.cssText = 'position:fixed; inset:auto 12px 88px 12px; z-index:30; padding:14px;';
  el.innerHTML = html + `<div style="display:flex;gap:8px;margin-top:10px"><button class="btn" id="${id}-close">Close</button></div>`;
  document.body.appendChild(el);
  document.getElementById(`${id}-close`).onclick = ()=>{ el.remove(); onClose?.(); };
  return el;
}
