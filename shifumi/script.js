
let log = document.querySelector(".log")

log.onclick = () => {
  log.innerHTML = "Casque en préparation..."
  log.disabled = true
  ws.send(JSON.stringify({action:"python_start", data:["neutre", "pierre", "papier", "ciseaux"]}))
}

function show(name) {
  document.querySelectorAll(`[data-name]`).forEach(v => v.style.display = "none")
  if (name) document.querySelector(`[data-name="${name}"]`).style.display = "block"
}

const ws = new WebSocket(`ws://${(window.location.href.match(/\d+\.\d+\.\d+\.\d+/)||["localhost"])[0]}:3001`)
ws.onmessage = event => {
	const data = JSON.parse(event.data)
	const type = data.shift()
	const headset = data.shift()
	const status = data.shift()
	let action = data.shift()
	if(type === "inf") {
		console.log(status, action)
		switch(status) {
			case "training":
        show(action)
				log.innerHTML = `Pensez ${action}`
        break
			case "modeling":
				log.innerHTML = "Apprentissage..."
        show(null)
        break
			case "prediction":
				log.style.display = "none"
        switch(action) {
    			case "pierre":
          case "papier":
          case "ciseaux":
    				show(action)
            break
    			default:
            break
    		}
		}
	}
}

ws.onopen = event => {
  log.innerHTML = "Démarrer l'apprentissage"
  log.disabled = false
}
