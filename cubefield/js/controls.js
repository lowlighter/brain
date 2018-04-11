let isTraining = false
let trainButton = document.querySelector(".trainButton")
trainButton.onclick = function() {
		isTraining = true
		this.innerHTML = "Casque en préparation..."
		this.disabled = true
		ws.send(JSON.stringify({action:"python_start", data:["neutre", "gauche", "droite"]}))
	}

const ws = new WebSocket(`ws://${(window.location.href.match(/\d+\.\d+\.\d+\.\d+/)||["localhost"])[0]}:3001`)
ws.onmessage = event => {
	const data = JSON.parse(event.data)
	const type = data.shift()
	const headset = data.shift()
	const status = data.shift()
	const direction = data.shift()
	if(type === "inf") {
		// console.log(status, direction)
		switch(status) {
			case "training":
				trainButton.innerHTML = `Pensez ${direction}`; break
			case "modeling":
				trainButton.innerHTML = "Apprentissage..."; break
			case "prediction":
				trainButton.style.display = "none"
		}
		switch(direction) {
			case "gauche":
				move_left(); break
			case "droite":
				move_right(); break
			default:
				replace(null);
		}
	}
}

ws.onopen = event => {
	trainButton.innerHTML = "Démarrer l'apprentissage"
	trainButton.disabled = false
}
