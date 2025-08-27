/**
 * router.js — tiny hash router for main views
 */
const routes = new Map();
export function route(path, render){ routes.set(path, render); }
export function initRouter(){
  const go = ()=>{
    const path = location.hash.slice(1) || '/today';
    const render = routes.get(path) || routes.get('/today');
    document.querySelectorAll('.tab').forEach(a=>{
      a.setAttribute('aria-current', a.getAttribute('data-route')===path.slice(1) ? 'page' : 'false');
    });
    render?.();
  };
  window.addEventListener('hashchange', go); go();
}
