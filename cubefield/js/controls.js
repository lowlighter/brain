let isTraining = false
let trainButton = document.querySelector(".trainButton")
trainButton.onclick = function() {
		isTraining = true
		this.innerHTML = "Casque en préparation..."
		this.disabled = true
	}

const ws = new WebSocket(`ws://${(window.location.href.match(/\d+\.\d+\.\d+\.\d+/)||["localhost"])[0]}:3001`)
ws.onmessage = event => {
	const data = JSON.parse(event.data)
	const type = data.shift()
	const headset = data.shift()
	const status = data.shift()
	const direction = data.shift()
	if(type === "inf") {
		console.log(status, direction)
		switch(status) {
			case "training":
				trainButton.innerHTML = `Pensez ${direction}`; break
			case "modeling":
				trainButton.innerHTML = "Apprentissage..."; break
			case "prediction":
				if(trainButton != null) {
					trainButton.style.display = "none"
					trainButton = null
				}
		}
		switch(direction) {
			case "neutre":
				replace(null); break
			case "gauche":
				move_left(); break
			case "droite":
				move_right(); break
		}
	}
}