const express = require('express')
const app = express()
const WebSocket = require('ws')
const wss = new WebSocket.Server({port:3001})

const Cortex = require('../cortex-example/nodejs/lib/cortex.js')

const client = new Cortex({verbose:0})

var sid = null;
client.ready.then(() => {
	let a = client
	.init()
	.queryHeadsets()
	.then(headsets => {
		console.log('headsets', headsets)
		client.createSession({status: 'open'}).subscribe({streams: ['sys']}).then(session => {
			sid=session.sid

			//Static server
			app.use(express.static('client/'))
			app.listen(3000, () => console.log('Server started on port 3000\nWebSocket server started on port 3001'))

			//WebSockets
			wss.on('connection', ws => {
				console.log('\x1b[36m%s\x1b[0m', 'Client logged to wss')
				ws.on('error', () => null);
				ws.on('close', () => console.log('\x1b[36m%s\x1b[0m', 'Client disconnected from wss'));
				ws.on('message', (data) => {
					JSONData = JSON.parse(data);
					client.call("training", {
							"_auth": client._auth,
							"detection": "mentalCommand",
							"session": sid,
							"action": JSONData.action,
							"status": JSONData.status
						}
					).then((result) => {
						ws.send(result);
					}).catch(err => console.log(err));
				});

			})
		})
	});

})

// At some point this will be a general front-end for all the features in /src, but not yet
