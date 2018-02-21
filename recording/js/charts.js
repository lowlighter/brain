const charts = {}
document.querySelectorAll(".charts canvas").forEach(chart => {
  charts[chart.id] = new Chart(document.getElementById(chart.id).getContext("2d"), {
      type:"scatter",
      data:{
        labels:[0],
        datasets:[]
      },
      options:{
        title:{
          display:true,
          fontSize:20,
          text:chart.id
        },
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
