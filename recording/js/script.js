//Websocket connection
  const ws = new WebSocket(`ws://${(window.location.href.match(/\d+\.\d+\.\d+\.\d+/)||["localhost"])[0]}:3001`)
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
        //Correlation
          if (document.querySelector(`[name="mat"]`).checked) showCor(type, d)
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
    global:["n", "time", "metadata"],
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
      if (type == "pow") chart.data.datasets.forEach((dataset, i) => dataset.data.push({x:t, y:data[i]}))
      if (type == "met") chart.data.datasets.forEach((dataset, i) => dataset.data.push({x:t, y:data[i]}))
      if (type == "fac") document.querySelector("#chart_fac").innerHTML = `${t.toString().padStart(8, " ").replace(/ /g, "&nbsp;")} | ${data.map(v => v.toString().padEnd(18, " ").replace(/ /g, "&nbsp;")).join(" ")}<br>${document.querySelector("#chart_fac").innerHTML}`
      if (type == "mot") {
        chart.data.datasets.forEach((dataset, i) => dataset.data.push({x:t, y:data[i]}))
      }
      if (type == "dev") {
        chart.data.datasets[0].data.push({x:t, y:Math.abs(0, data[0])})
        chart.data.datasets[1].data.push({x:t, y:data[1]})
        data[2].forEach((y, i) => chart.data.datasets[2+i].data.push({x:t, y}))
      }
      if (record.recording) record.data.push([record.data.length, t, document.querySelector("[name=metadata]").value,...data])
  }
  updateData.origin = Date.now()
  updateData.delta = 5
  updateData.deltas = {"chart_met":20}
  updateData.length = 100

//Update charts
  function updateCharts() {
    //Quit if record completed
      if (record.stopped) return null
    //Initialisation
      const t = Date.now() - updateData.origin, max = Math.max(t, updateData.delta * 1000)
      if (record.recording) document.querySelector("[name=duration]").value = Math.max(0, record.duration - t)/1000
    //Mise à jour des graphes
      for (let i in charts) {
          const chart = charts[i]
        //Actualisation des axes
          chart.options.scales.xAxes[0].ticks.min = Math.max(t - (updateData.delta + (updateData.deltas[i]||0)) * 1000, 0)
          chart.options.scales.xAxes[0].ticks.max = max
        //Filtrage des données superflues
          if (chart.data.datasets[0].data.length > updateData.length) chart.data.datasets.forEach(dataset => dataset.data = dataset.data.filter(v => v.x > chart.options.scales.xAxes[0].ticks.min - 1000 * (1 + (updateData.deltas[i]||0))))
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
    let v = parseInt(document.querySelector("[name=frequency]").value)
    updateCharts.interval = setInterval(() => updateCharts(), v)
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
      const file = new File([[headers, data].join("\r\n")], `${document.querySelector("[name=metadata]").value.replace(/;/g, "_")}-${(date.getDate()).toString().padStart(2, "0")}-${(1+date.getMonth()).toString().padStart(2, "0")}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.csv`, {type: "text/csv"})
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
    charts.chart_pow.options.scales.yAxes[0].ticks.max = 2000
    charts.chart_pow.update()
    charts.chart_mot.options.scales.yAxes[0].ticks.max = 2**14
    charts.chart_mot.update()
    charts.chart_dev.options.scales.yAxes[0].ticks.max = 4
    charts.chart_dev.update()
    updateData.origin = Date.now()
    document.querySelector("#chart_fac").style.height = `${document.querySelector("#chart_pow").height/2}px`
    window.onresize = () => document.querySelector("#chart_fac").style.height = `${document.querySelector("#chart_pow").height/2}px`
  }

//Actualisation de l'échelle des graphes
  function timeCharts() {
    updateData.delta = parseInt(document.querySelector("[name=duration]").value)||1
    const t = Date.now() - updateData.origin, max = Math.max(t, updateData.delta * 1000)
    for (let i in charts) {
      charts[i].options.scales.xAxes[0].ticks.min = Math.max(t - (updateData.delta + (updateData.deltas[i]||0)) * 1000, 0)
      charts[i].options.scales.xAxes[0].ticks.max = max
      charts[i].update()
    }
  }

//Au chargement de la page
  window.onload = function () {
    initCharts()
    updateCharts.start()
  }


//Corrélation
  function cor(x, y) {
    //Moyennes
      let ax = x.reduce((a, b) => a + b, 0)/x.length
      let ay = y.reduce((a, b) => a + b, 0)/y.length

    //Covariance
      let sum = 0
      for (let i = 0; i < x.length; i++) sum += (x[i] - ax) * (y[i] - ay)
      let cov = sum/(x.length-1)

    //Ecart type
      let sx = Math.sqrt(x.map(v => (v - ax)**2).reduce((a, b) => a + b, 0)/(x.length-1))
      let sy = Math.sqrt(y.map(v => (v - ay)**2).reduce((a, b) => a + b, 0)/(y.length-1))

      return cov/(sx*sy)
  }

  function showCor(type, d) {
    if (type != "pow") return
    let l = cor.data[0].length, L = cor.data.length
    cor.data.map((a, i) => a.push(d[i]))
    if (l > showCor.frame) cor.data = cor.data.map(a => { return a.slice(-showCor.frame) })
    if (l == showCor.frame) {

      let c = []

      for (let i = 0; i < L; i++) {
        for (let j = 0; j < L; j++) {
          c.push(cor(cor.data[i], cor.data[j]))
        }
      }


      let max = Math.max(...(c.map(v => Math.abs(v))))
      c = c.map(v => Math.abs(v)/max)

      for (let i = 0; i < drawMatrix.data.data.length; i+=4) {
        let v = Math.round(c.shift()*255)
        drawMatrix.data.data[i+0] = v
        drawMatrix.data.data[i+1] = v
        drawMatrix.data.data[i+2] = v
      }
    }
  }

  showCor.frame = 25
  cor.data = new Array(25).fill([])

//Affichage de la matrix de corrélation
  function drawMatrix() {
    const c = document.getElementById("cmatrix")
    const ctx = c.getContext("2d")
    ctx.putImageData(drawMatrix.data, 0, 0)
  }

//Alpha à 1
  drawMatrix.data = new ImageData(25, 25)
  for (let i = 3; i < drawMatrix.data.data.length; i+=4) {
    drawMatrix.data.data[i] = 255
  }

//R à 1
  for (let i = 0; i < drawMatrix.data.data.length; i+=4) {
    drawMatrix.data.data[i+0] = 255
    drawMatrix.data.data[i+1] = 255
    drawMatrix.data.data[i+2] = 255
  }

document.querySelector(`[name="mat"]`).onclick = function () {
  document.querySelector(".cmatrix_wrapper").style.display = "flex"
}

document.querySelector(".cmatrix_wrapper").onclick = function () {
  document.querySelector(".cmatrix_wrapper").style.display = "none"
  document.querySelector(`[name="mat"]`).checked = false
}
