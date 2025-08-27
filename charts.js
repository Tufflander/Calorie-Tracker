/**
 * charts.js — Chart.js helpers
 */
let weightChart, energyChart, miniChart;
export function mountWeightChart(ctx, labels, dots, trend){
  weightChart?.destroy();
  weightChart = new Chart(ctx, {
    type:'scatter',
    data:{ labels, datasets:[
      { type:'scatter', label:'Scale', data:dots, pointRadius:3, backgroundColor:'#64748b' },
      { type:'line', label:'Trend', data:trend, tension:.25, borderWidth:2, borderColor:'#0ea5e9', pointRadius:0 }
    ]},
    options:{ plugins:{legend:{display:false}}, scales:{x:{display:false}} }
  });
}
export function mountEnergyChart(ctx, labels, bars, line){
  energyChart?.destroy();
  energyChart = new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets:[
      { type:'bar', label:'Intake', data:bars, backgroundColor:'#60a5fa' },
      { type:'line', label:'4wk avg', data:line, borderColor:'#0ea5e9', tension:.25 }
    ]},
    options:{ plugins:{legend:{display:false}} }
  });
}
export function mountMiniCalcChart(ctx, labels, series){
  miniChart?.destroy();
  miniChart = new Chart(ctx, {
    type:'line',
    data:{ labels, datasets:[{ data:series, borderColor:'#0ea5e9', tension:.28, fill:false }]},
    options:{ plugins:{legend:{display:false}} }
  });
}
