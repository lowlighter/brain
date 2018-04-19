let left = document.getElementById('left').classList;
let right = document.getElementById('right').classList;

let launch = document.getElementById('launch');
launch.onclick = function() {
	ws.send(JSON.stringify({action:"python_start", data:["neutre", "gauche", "droite"]}))
	this.innerHTML = "Casque en préparation..."
}

//Websocket connection
const ws = new WebSocket(`ws://${(window.location.href.match(/\d+\.\d+\.\d+\.\d+/)||["localhost"])[0]}:3001`)

ws.onmessage = event => {
	const data = JSON.parse(event.data)
	const type = data.shift()
	const headset = data.shift()
	if(type === 'inf') {
		const status = data.shift()
		const direction = data.shift()
		switch(status) {
			case "training":
				launch.innerHTML = `Pensez à ${direction}`; break
			case "modeling":
				launch.innerHTML = "Apprentissage..."; break
			case "prediction":
				launch.style.display = "none"
		}
		switch(direction) {
			case "gauche":
				left.add('left-active');
				right.remove('right-active')
				break;
			case "droite":
				right.add('right-active');
				left.remove('left-active')
				break;
			case "neutre":
				left.remove('left-active')
				right.remove('right-active')
		}
	}
}

ws.onopen = () => {
	ws.send(JSON.stringify({
		action:"setId",
		id:Math.floor(Date.now()*10000*Math.random())
	}))
	ws.send(JSON.stringify({
		action:"parrotStart"
	}))
}
