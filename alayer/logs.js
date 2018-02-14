const WebSocket = require('ws')

const ws = new WebSocket('ws://localhost:3001')

ws.on('open', function open() {
	console.log("bonjour");
});

ws.on('message', function incoming(data) {
	let parsed = JSON.parse(data);
	if(parsed.isLog){
		console.log(parsed.log);
	}
});

ws.logger = true