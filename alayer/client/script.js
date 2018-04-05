//Timeouts
  const timeouts = [null, null, null]
  let ls_timeout = null, h0 = null, h1 = null, h2 = null
//Websocket connection
  const ws = new WebSocket(`ws://${(window.location.href.match(/\d+\.\d+\.\d+\.\d+/)||["localhost"])[0]}:3001`)
  ws.onmessage = event => {
    const data = JSON.parse(event.data)
    const type = data.shift()
    if (type === "dev") {
      if ((data[3].reduce)&&(data[0].includes(h0))) {
        document.getElementById("signal-strength-1").innerHTML = (data[3].reduce((w, v) => w + v)/5/4).toFixed(2)
        document.getElementById("p1-bat").src = `miscelleanous/battery_${Math.max(1, data[1])}.png`
      }
      if ((data[3].reduce)&&(data[0].includes(h1))) {
        document.getElementById("signal-strength-2").innerHTML = (data[3].reduce((w, v) => w + v)/5/4).toFixed(2)
        document.getElementById("p2-bat").src = `miscelleanous/battery_${Math.max(1, data[1])}.png`
      }
      if ((data[3].reduce)&&(data[0].includes(h2))) {
        document.getElementById("signal-strength-3").innerHTML = (data[3].reduce((w, v) => w + v)/5/4).toFixed(2)
        document.getElementById("p3-bat").src = `miscelleanous/battery_${Math.max(1, data[1])}.png`
      }
    }
    if (type === "hdw") {
      if ((!h0)&&(data[1])) h0 = data[1]
      if ((!h1)&&(data[2])) h1 = data[2]
      if ((!h2)&&(data[8])) h2 = data[8]
      document.getElementById("ls").style.opacity = 1
      document.getElementById("p1").style.opacity = document.getElementById("p1-line").style.opacity = data[1]||data[5] ? 1 : 0.1
      document.getElementById("p2").style.opacity = document.getElementById("p2-line").style.opacity = data[2]||data[6] ? 1 : 0.1
      document.getElementById("p3").style.opacity = document.getElementById("p3-line").style.opacity = data[8]||data[9] ? 1 : 0.1
      document.getElementById("parrot").style.opacity = data[3] ? 1 : 0.1
      let p1 = `miscelleanous/${data[5] ? "wario" : "mario"}.gif`
      let p2 = `miscelleanous/${data[6] ? "waluigi" : "luigi"}.gif`
      let p3 = `miscelleanous/${data[9] ? "daisy" : "peach"}.gif`
      let p1_i = `miscelleanous/${data[5] ? "p1-2" : "p1"}.png`
      let p2_i = `miscelleanous/${data[6] ? "p2-2" : "p2"}.png`
      let p3_i = `miscelleanous/${data[9] ? "p3-2" : "p3"}.png`
      let ps = `miscelleanous/${data[7] ? "mush2" : "mush"}.png`
      if (document.getElementById("p1").src != p1) document.getElementById("p1").src = p1
      if (document.getElementById("p2").src != p2) document.getElementById("p2").src = p2
      if (document.getElementById("p3").src != p3) document.getElementById("p3").src = p3
      if (document.getElementById("ls").src != ls) document.getElementById("ls").src = ps
      if (document.getElementById("p1-icon").src != p1_i) document.getElementById("p1-icon").src = p1_i
      if (document.getElementById("p2-icon").src != p2_i) document.getElementById("p2-icon").src = p2_i
      if (document.getElementById("p3-icon").src != p3_i) document.getElementById("p3-icon").src = p3_i

      document.getElementById("p1-star").style.opacity = data[4].includes(h0) ? 1 : 0
      document.getElementById("p2-star").style.opacity = data[4].includes(h1) ? 1 : 0
      document.getElementById("p3-star").style.opacity = data[4].includes(h2) ? 1 : 0

      clearTimeout(ls_timeout)
      ls_timeout = setTimeout(() => {
        document.getElementById("parrot").style.opacity = 0.1
        document.getElementById("p1").style.opacity = document.getElementById("p1-line").style.opacity = 0.1
        document.getElementById("p2").style.opacity = document.getElementById("p2-line").style.opacity = 0.1
        document.getElementById("p3").style.opacity = document.getElementById("p3-line").style.opacity = 0.1
        document.getElementById("ls").style.opacity = 0.1
        document.getElementById("p1-star").style.opacity = 0
        document.getElementById("p2-star").style.opacity = 0
        document.getElementById("p3-star").style.opacity = 0
        document.getElementById("p1-bat").src = document.getElementById("p2-bat").src = document.getElementById("p3-bat").src = `miscelleanous/battery_0.png`
      }, 1700)
    }
  }
