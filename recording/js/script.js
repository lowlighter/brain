//Websocket connection
  const ws = new WebSocket("ws://localhost:3001")
  ws.onmessage = event => {
    //Data
      const d = JSON.parse(event.data)
      const type = d.shift()
      const headset = d.shift()
    //
      if (type === "dev") document.getElementById("signal-strength").innerHTML = (d[2].reduce((w, v) => w + v)/5/4).toFixed(2)
      if (type !== "hdw") {
        //Logs
          if (recorded[type]) updateData(type, d)
      }

  }

//Recorded status
  const recorded = {
    get pow() { return document.querySelector(`[name="pow"]`).checked },
    get met() { return document.querySelector(`[name="met"]`).checked },
    get fac() { return document.querySelector(`[name="fac"]`).checked },
    get mot() { return document.querySelector(`[name="mot"]`).checked },
    get com() { return document.querySelector(`[name="com"]`).checked },
    get dev() { return document.querySelector(`[name="dev"]`).checked }
  }

//List of headers
  const header = {
    global:["n", "time"],
    pow:["AF3_theta", "AF3_alpha", "AF3_betaL", "AF3_betaH", "AF3_gamma", "T7_theta", "T7_alpha", "T7_betaL", "T7_betaH", "T7_gamma", "Pz_theta", "Pz_alpha", "Pz_betaL", "Pz_betaH", "Pz_gamma", "T8_theta", "T8_alpha", "T8_betaL", "T8_betaH", "T8_gamma", "AF4_theta", "AF4_alpha", "AF4_betaL", "AF4_betaH", "AF4_gamma"],
    met:["interest", "stress", "relaxation", "excitement", "engagement", "long_term_excitement", "focus"],
    fac:["eye_action", "upper_face_action", "upper_face_power", "lower_face_action", "lower_face_power"],
    mot:["imd_counter", "gyroscope_x", "gyroscope_y", "gyroscope_z", "accelerometer_x", "accelerometer_y", "accelerometer_z", "magnetometer_x", "magnetometer_y", "magnetometer_z"],
    com:["command_action", "command_power"],
    dev:["battery", "signal_strength", "AF3_signal", "T7_signal", "Pz_signal", "T8_signal", "AF4_signal"]
  }

//Update datas
  function updateData(type, data) {
    //Initialisation
      const chart = charts[`chart_${type}`], t = Date.now() - updateData.origin
    //Ajout des données
      chart.data.datasets.forEach((dataset, i) => dataset.data.push({x:t, y:data[i]}))

      if (record.recording) record.data.push([record.data.length, t, ...data])
  }
  updateData.origin = Date.now()
  updateData.delta = 5
  updateData.length = 100

//Update charts
  function updateCharts() {
    //Quit if record completed
      if (record.stopped) return null
    //Initialisation
      const t = Date.now() - updateData.origin, min = Math.max(t - updateData.delta * 1000, 0), max = Math.max(t, updateData.delta * 1000)
      if (record.recording) document.querySelector("[name=duration]").value = Math.max(0, record.duration - t)/1000
    //Mise à jour des graphes
      for (let i in charts) {
          const chart = charts[i]
        //Actualisation des axes
          chart.options.scales.xAxes[0].ticks.min = min
          chart.options.scales.xAxes[0].ticks.max = max
        //Filtrage des données superflues
          if (chart.data.datasets[0].data.length > updateData.length) chart.data.datasets.forEach(dataset => dataset.data = dataset.data.filter(v => v.x > chart.options.scales.xAxes[0].ticks.min))
        //Mise à jour
          chart.update()
      }
    //
      if (recorded.pow) {
        drawMatrix()
      }
    //Download current data and go to next record
      if (t > record.duration) {
        download()
        if (--record.iterations <= 0) {
          record.stopped = true
          record(false, true)
        }
        else {
          record(true)
          document.querySelector("[name=iteration]").value = record.iterations
        }
      }
  }
  updateCharts.interval = null
  updateCharts.start = function () {
    clearInterval(updateCharts.interval)
    updateCharts.interval = setInterval(() => updateCharts(), parseInt(document.querySelector("[name=frequency]").value))
  }


//Record function
  function record(next = false, restore = false) {
    if (next) {
      initCharts()
    }
    else if (record.recording) {
      //Stoppe l'enregistrement
        record.recording = false
        record.stopped = true
        record.duration = Infinity
        document.querySelectorAll("[name=duration], [name=iteration], [name=frequency]").forEach(n => n.disabled = false)
        document.querySelector("[name=record]").innerHTML = "Enregistrer"
        if (restore) {
          document.querySelector("[name=duration]").value = Number.isFinite(record.duration) ? record.duration : 5
          document.querySelector("[name=iteration]").value = record.iterations_init
        }
    } else {
      //Démarre un enregistrement
        record.data = []
        record.recording = true
        record.stopped = false
        document.querySelectorAll("[name=duration], [name=iteration], [name=frequency]").forEach(n => n.disabled = true)
        document.querySelector("[name=record]").innerHTML = "Stopper"
      //Réinitialise les graphes et récupère les paramètres
        initCharts()
        record.duration = parseInt(document.querySelector("[name=duration]").value)*1000
        record.iterations_init = parseInt(document.querySelector("[name=iteration]").value)
        record.iterations = parseInt(document.querySelector("[name=iteration]").value)
    }
  }
  record.data = []
  record.recording = false
  record.stopped = false
  record.duration = Infinity
  record.iterations = 0
  record.iterations_init = 0

//Lecture simple
  function listen() {
    record.stopped = false
    initCharts()
  }

//Téléchargement
  function download() {
    //Récupération des headers utiles
      let headers = header.global.slice()
      for (let i in recorded) {
        if (recorded[i]) headers = headers.concat(header[i])
      }
      headers = headers.join(",")

    //Enregistrement du ficheir
      const data = record.data.map(d => d.join(",")).join("\r\n")
      const date = new Date()
      const file = new File([[headers, data].join("\r\n")], `${(date.getDate()).toString().padStart(2, "0")}-${(1+date.getMonth()).toString().padStart(2, "0")}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.csv`, {type: "text/csv"})
      saveAs(file, file.name)
  }

//Fonction de hachage en couleurs
  function hashRGB(str){
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 6) - hash)
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
    return "00000".substring(0, 6 - c.length) + c
  }

//Initialisation des graphes
  function initCharts() {
    for (let i in charts) {
      charts[i].data.datasets = header[i.match(/_(.*)$/)[1]].map(label => { return {label, borderColor:`#${hashRGB(label)}`, fill:false, showLine:true, borderWidth:2, data:[]}})
      charts[i].update()
    }
    charts.chart_pow.options.scales.yAxes[0].ticks.max = 16384
    charts.chart_pow.update()
    updateData.origin = Date.now()
  }

//Actualisation de l'échelle des graphes
  function timeCharts() {
    updateData.delta = parseInt(document.querySelector("[name=duration]").value)||1
    const t = Date.now() - updateData.origin, min = Math.max(t - updateData.delta * 1000, 0), max = Math.max(t, updateData.delta * 1000)
    for (let i in charts) {
      charts[i].options.scales.xAxes[0].ticks.min = min
      charts[i].options.scales.xAxes[0].ticks.max = max
      charts[i].update()
    }
  }

//Au chargement de la page
  window.onload = function () {
    initCharts()
    updateCharts.start()
  }


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

  function drawMatrix() {
    const c = document.getElementById("cmatrix")
    const ctx = c.getContext("2d")

    ctx.putImageData(drawMatrix.data, 0, 0)
  }
  drawMatrix.data = new ImageData(25, 25)
  for (let i = 3; i < drawMatrix.data.data.length; i+=4) {
    drawMatrix.data.data[i] = 255
  }

  for (let i = 0; i < drawMatrix.data.data.length; i+=4) {
    drawMatrix.data.data[i] = 255
  }
