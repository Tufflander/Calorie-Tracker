let macroChart;
export function mountMacroRing(el,eaten,target){
  if(!el)return;const ctx=el.getContext('2d');
  const data=[Math.min(eaten,target),Math.max(0,target-Math.min(eaten,target))];
  macroChart?.destroy();
  macroChart=new Chart(ctx,{type:'doughnut',data:{labels:['Eaten','Remaining'],datasets:[{data, borderWidth:0, hoverOffset:0, cutout:'60%', backgroundColor:['#60a5fa','#e2e8f0']}]},options:{plugins:{legend:{display:false}},animation:{duration:500}}});
  return macroChart;
}
export function updateMacroRing(eaten,target){
  if(!macroChart)return;
  const d=macroChart.data.datasets[0].data;
  d[0]=Math.min(eaten,target);d[1]=Math.max(0,target-Math.min(eaten,target));
  macroChart.update();
}
