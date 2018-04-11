let left = document.getElementById('left');
let right = document.getElementById('right');
let x = 0;

//Websocket connection
const ws = new WebSocket(`ws://${(window.location.href.match(/\d+\.\d+\.\d+\.\d+/)||["localhost"])[0]}:3001`)
ws.onmessage = event => {
	const data = JSON.parse(event.data)
	const type = data.shift()
	const headset = data.shift()
	if(type === 'inf') {
		const status = data.shift()
		const direction = data.shift()
		if(status === "prediction") {
			switch(direction) {
				case "gauche":
					left.classList.add('left-active');
					right.classList.remove('right-active')
					break;
				case "droite":
					right.classList.add('right-active');
					left.classList.remove('left-active')
					break;
				case "neutre":
					left.classList.remove('left-active')
					right.classList.remove('right-active')
			}
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
