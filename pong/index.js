//Dependancies
  const express = require('express')
  const app = express()
  const WebSocket = require('ws')
  const wss = new WebSocket.Server({port:3001})
  const Cortex = require('../cortex-example/nodejs/lib/cortex.js')

//Static server
  app.use(express.static('client/'))
  app.listen(3000, () => console.log('Server started on port 3000\nWebSocket server started on port 3001'))

//WebSockets
	let sid = null
  wss.on('connection', ws => {
    //Log
      console.log('\x1b[36m%s\x1b[0m', 'Client logged to wss')
    //EEG headset
      client
    //Websockets events
      ws.on('error', () => null)
      ws.on('close', () => console.log('\x1b[36m%s\x1b[0m', 'Client disconnected from wss'))
		//Training message
			ws.on('message', data => {
				if (!sid) return null
				const JSONData = JSON.parse(data);
				client.call("training", {
						"_auth": client._auth,
						"detection": "mentalCommand",
						"session": sid,
						"action": JSONData.action,
						"status": JSONData.status
					}
				).then(result => ws.send(result)).catch(err => console.log(err))
			})
  })

//Cortex API
  const client = new Cortex({verbose:1, threshold:0})
  client.ready
    //Initialization
      .then(() => client.init())
      .catch(error => console.error('\x1b[31mError : %s\x1b[0m', "Failed to connect to headset"))
      .then(() => client.createSession({status:'open'}))
      .catch(error => console.error('\x1b[31mError : %s\x1b[0m', "Failed to connect to headset"))
    //Subscription to streams
      .then(() => client.subscribe({streams:['mot', 'sys']}).then(subs => {
            if ((!subs[0].mot)||(!subs[1].sys)) return console.error('Failed to subscribe')
						sid = subs.sid
						client.on('mot', event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['mot', ...event.mot.slice(-3)])) }))
            console.log('\x1b[32m%s\x1b[0m', "Connected to headset")
          }).catch(error => console.error('\x1b[31mError : %s\x1b[0m', "Failed to connect to headset"))
        )
