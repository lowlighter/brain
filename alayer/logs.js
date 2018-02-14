const WebSocket = require('ws')

const ws = new WebSocket('ws://localhost:3001')
ws.logger = true

ws.on('open', function open() {
});

ws.on('message', function incoming(data) {
	let parsed = JSON.parse(data);
	parsed.splice(0,1);
	console.log(parsed);

});

