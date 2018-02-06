//====================================================
// CHART
//====================================================
//====================================================
  const charts = {delta:10}
  charts.emotions = new Chart(document.getElementById("chart-emotions").getContext('2d'), {
      type:'radar',
      data:{
        labels:['Neutral', 'Angry', 'Sad', 'Surprised', 'Happy'],
        datasets:[{
            label:"Machine Learning",
            backgroundColor:'rgba(255, 99, 132, 0.3)',
            borderColor:'rgba(255, 99, 132, 1)',
            data:[0, 0, 0, 0, 0]
        }, {
            label:"EEG Headset",
            backgroundColor:'rgba(54, 162, 235, 0.3)',
            borderColor:'rgba(54, 162, 235, 1)',
            data:[0, 0, 0, 0, 0]
        }]
      },
      options:{
        title:{
          display:true,
          fontSize:20,
          text:"Emotions detection"
        },
        legend:{
          position:"bottom"
        },
        scale:{
          ticks:{
            min:0,
            max:1,
            autoSkip:true,
            maxTicksLimit:5
          }
        }
      }
  })

  charts.correlation = new Chart(document.getElementById("chart-correlation").getContext('2d'), {
      type:'scatter',
      data:{
        labels:[0],
        datasets:[{
            borderColor:'rgba(255, 99, 132, 1)',
            fill:false,
            data:[],
            showLine:true,
            borderWidth:2,
        }]
      },
      options:{
        title:{
          display:true,
          fontSize:20,
          text:"Correlation"
        },
        legend:{
          display:false
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
              max:charts.delta * 1000,
              maxRotation:0,
              minRotation:0,
              callback(label, index, labels) { return Math.floor(label/1000) }
            }
          }]
        }
      }
  })



  charts.signals = new Chart(document.getElementById("chart-signals").getContext('2d'), {
      type:'scatter',
      data:{
        labels:[0],
        datasets:[{
            label:"AF3",
            borderColor:'rgba(255, 99, 132, 1)',
            fill:false,
            showLine:true,
            borderWidth:2,
            data:[]
        },{
            label:"AF4",
            borderColor:'rgba(255, 159, 64, 1)',
            fill:false,
            showLine:true,
            borderWidth:2,
            data:[]
        },{
            label:"T7",
            borderColor:'rgba(75, 192, 192, 1)',
            fill:false,
            showLine:true,
            borderWidth:2,
            data:[]
        },{
            label:"T8",
            borderColor:'rgba(54, 162, 235, 1)',
            fill:false,
            showLine:true,
            borderWidth:2,
            data:[]
        },{
            label:"Pz",
            borderColor:'rgba(153, 102, 255, 1)',
            fill:false,
            showLine:true,
            borderWidth:2,
            data:[]
        }]
      },
      options:{
        responsive: false,

        title:{
          display:true,
          fontSize:20,
          text:"Band power values"
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
              max:charts.delta * 1000,
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








//====================================================
// VIDEO
//====================================================
//====================================================
  //Initialization
    const video = document.getElementById('video')
    const overlay = document.getElementById('overlay')
    const overlayCC = overlay.getContext('2d')

  //Enable start
    function enablestart() {
      const button = document.getElementById('startbutton')
      button.innerHTML = "Start tracking"
      button.disabled = null
      startVideo()
    }

  //Update video proportions when resized
    function adjustVideoProportions() {
      const proportion = video.videoWidth/video.videoHeight
      video.width = Math.round(video.height * proportion)
      video.width = video.width
      overlay.width = video.width
    }

  //Camera stream if successfully retrieved user media
    function gumSuccess(stream) {
      if ("srcObject" in video) {
        video.srcObject = stream
      } else {
        video.src = (window.URL && window.URL.createObjectURL(stream))
      }
      video.onloadedmetadata = function() {
        adjustVideoProportions()
        video.play()
      }
      video.onresize = function() {
        adjustVideoProportions()
        if (trackingStarted) {
          ctrack.stop()
          ctrack.reset()
          ctrack.start(video)
        }
      }
    }

  //Failed to retrieve camera stream
    function gumFail() {
      alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
    }

  //Camera API
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
    window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL

  //Camera support
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({video : true}).then(gumSuccess).catch(gumFail);
    } else if (navigator.getUserMedia) {
      navigator.getUserMedia({video : true}, gumSuccess, gumFail);
    } else {
      alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
    }
    video.addEventListener('canplay', enablestart, false)


//====================================================
// EMOTIONS
//====================================================
//====================================================
  //Eigenvector 9 and 11 to not be regularized (detect better motion of the eyebrows)
    pModel.shapeModel.nonRegularizedVectors.push(9)
    pModel.shapeModel.nonRegularizedVectors.push(11)

  //Initialization
    const ctrack = new clm.tracker({useWebGL : true})
    ctrack.init(pModel)
    let trackingStarted = false
    let timeOrigin = 0

  //Start tracking
    function startVideo() {
      const button = document.getElementById('startbutton')
      button.innerHTML = "Tracking..."
      button.disabled = true
      video.play()
      ctrack.start(video)
      trackingStarted = true
      timeOrigin = Date.now()
      drawLoop()
    }

  //Tracking drawing
    function drawLoop() {
      requestAnimFrame(drawLoop)
      overlayCC.clearRect(0, 0, video.width, video.height)
      if (ctrack.getCurrentPosition()) {
        ctrack.draw(overlay,undefined,"vertices")
        document.getElementById('track-score').innerHTML = ctrack.getScore().toFixed(2)
        document.querySelector(".status.tracking").classList.remove("red")
        document.querySelector(".status.tracking").classList.add("green")
      }
      else {
        document.getElementById('track-score').innerHTML = "0.00"
        document.querySelector(".status.tracking").classList.remove("green")
        document.querySelector(".status.tracking").classList.add("red")
      }
      const er = ec.meanPredict(ctrack.getCurrentParameters())
      if (er) updateData(er)
    }

  //Update chart data
    function updateData(data) {
      const values = [0]
      data.forEach(datum => {
        if ((datum.emotion === "disgusted")||((datum.emotion === "fear"))) return null
        values.push(datum.value)
      })
      values[0] = 1 - Math.max.apply(null, values)
      charts.emotions.data.datasets[0].data = values
      charts.emotions.update()
    }

  //Update chart data (EEG)
    function updateEEGData(values, signals) {
      //Update scales
        const t = Date.now() - timeOrigin, min = Math.max(t - charts.delta * 1000, 0), max = Math.max(t, charts.delta * 1000)
        charts.correlation.options.scales.xAxes[0].ticks.min = min
        charts.correlation.options.scales.xAxes[0].ticks.max = max
        charts.correlation.update()
        charts.signals.options.scales.xAxes[0].ticks.min = min
        charts.signals.options.scales.xAxes[0].ticks.max = max
        charts.signals.update()
      //Updates values
        if (Array.isArray(values)) {
          charts.emotions.data.datasets[1].data = values
          charts.emotions.update()
          charts.correlation.data.datasets[0].data.push({x:t, y:Math.abs(correlation(values, charts.emotions.data.datasets[0].data))})
          if (charts.correlation.data.datasets[0].data.length > 1000) charts.correlation.data.datasets[0].data = charts.correlation.data.datasets[0].data.filter(v => v.x >= charts.correlation.options.scales.xAxes[0].ticks.min)
        }
      //Update signals
        if (Array.isArray(signals)) {
          charts.signals.data.datasets.forEach((dataset, index) => dataset.data.push({x:t, y:signals[index]}))

          if (charts.signals.data.datasets[0].data.length > 1000) charts.signals.data.datasets.forEach((dataset, index) => dataset.data = charts.signals.data.datasets[index].data.filter(v => v.x >= charts.signals.options.scales.xAxes[0].ticks.min))
        }
    }

  //Initialization
    const ec = new emotionClassifier()
    ec.init(emotionModel)
    ec.getBlank()


//====================================================
// CORRELATION
//====================================================
//====================================================
  //Average
    function average(a) {
    	return parseFloat((a.reduce((w, v) => w + v, 0)/a.length).toFixed(8))
    }

  //Correlation
    function correlation(a, b) {
    	const length = a.length, n = length - 1
    	const averages = {a:average(a), b:average(b), sum:0}
    	let sx = 0, sy = 0
    	for (let i = 0; i < length; i++) {
    		const x = a[i] - averages.a
    		const y = b[i] - averages.b
    		averages.sum += (x * y)
    		sx += (x ** 2)
    		sy += (y ** 2)
    	}
    	sx = Math.sqrt(sx / n)
    	sy = Math.sqrt(sy / n)
    	return parseFloat((averages.sum / (n * sx * sy)).toFixed(8))
    }

//====================================================
// EEG HEADSET
//====================================================
//====================================================
  //Show that headset is connected
    function connected(received) {
      document.getElementById('status').innerHTML = "Connected"
      document.getElementById('received').innerHTML = received
      document.querySelector(".status.headset").classList.remove("red")
      document.querySelector(".status.headset").classList.add("green")
    }

  //Websocket connection
    const ws = new WebSocket('ws://localhost:3001');
    ws.onmessage = event => {
      const data = JSON.parse(event.data)
      const type = data.shift()
      if (type === "dev") {
        //====================================================
        //TODO : Connectivity signals
        console.log(data)
      } else if (type === "fac") {
        //====================================================
        //TODO : Sad scoring
        const scores = {frown:0, surprise:0, smile:0, laugh:0, neutral:0, sad:0}
        connected(event.data)
        scores[data[1]] = data[2]
        scores[data[3]] = data[4]
        updateEEGData([scores.neutral, scores.frown, scores.sad, scores.surprise, Math.min(1, scores.smile + 1.5*scores.laugh)])
      }
    }
