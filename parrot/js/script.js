let left = document.getElementById('left');
let right = document.getElementById('right');
let x = 0;

//Websocket connection
const ws = new WebSocket(`ws://${(window.location.href.match(/\d+\.\d+\.\d+\.\d+/)||["localhost"])[0]}:3001`)
// console.log(ws);
ws.onmessage = event => {
	const data = JSON.parse(event.data)
	const type = data.shift()
	const headset = data.shift()
	// const status = data.shift()
	// const direction = data.shift()
	if(type === 'inf') {
		console.log(type, data)
		// direction = // TOTEST
		// if(status === "prediction") {
		// 	switch(direction) {
		// 		case "gauche":
		// 			left.classList.add('left-active');
		// 			if(right.classList.contains('right-active'))
		// 				right.classList.remove('right-active')
		// 		case "droite":
		// 			right.classList.add('right-active');
		// 			if(left.classList.contains('left-active'))
		// 				left.classList.remove('left-active')
		// 		case "neutre":
		// 			if(left.classList.contains('left-active'))
		// 				left.classList.remove('left-active')
		// 			if(right.classList.contains('right-active'))
		// 				right.classList.remove('right-active')
		// 	}
		// }
	}
	// const action = data[0]
	// if (x++ %100 == 0) console.log(action)
	// if (action === 'left') {
	// console.log('left');
	// if(!left.classList.contains('left-active')) {
	// console.log("left");
	// left.classList.add('left-active');
	// }
	// } else if (action === 'right') {
	// console.log('right');
	// if(!right.classList.contains('right-active')) {
	// right.classList.add('right-active');
	// }
	// } else if (action === 'center') {
	// if(left.classList.contains('left-active')) {
	// left.classList.remove('left-active');
	// }
	// if(right.classList.contains('right-active')) {
	// right.classList.remove('right-active');
	// }
	// }
	// }
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
