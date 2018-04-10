const charts = {}
document.querySelectorAll(".charts #chart_pow, #chart_met, #chart_mot, #chart_dev").forEach(chart => {
  charts[chart.id] = new Chart(document.getElementById(chart.id).getContext("2d"), {
      type:"scatter",
      data:{
        labels:[0],
        datasets:[]
      },
      options:{
        scales: {
          yAxes: [{
            display: true,
            ticks: {
              min:0,
              max:1,
            }
          }],
          xAxes:[{
            ticks: {
              min:0,
              max:1000,
              maxRotation:0,
              minRotation:0,
              callback(label, index, labels) { return Math.floor(label/1000) }
            }
          }]
        },
        animation:{
          duration:200
        }
      }
  })
})
/*
document.querySelectorAll(".charts #chart_met").forEach(chart => {
  charts[chart.id] = new Chart(document.getElementById(chart.id).getContext("2d"), {
      type:"bar",
      data:[],
      options:{
        scales: {
          yAxes: [{
            ticks: {
              min:0,
              max:1,
            }
          }]

        },
        animation:{
          duration:200
        }
      }
  })
})

{
  labels:["interest", "stress", "relaxation", "excitement", "engagement", "long term excitement"],
  datasets:[{data:[0.5, 1, 0, 1, 1, 0]}]
}
*/
/*
var myBarChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
});



  int	interest value
str	stress value
rel	relaxation value
exc	excitement value
eng	engagement value
lex	long term excitement value
foc
*/
