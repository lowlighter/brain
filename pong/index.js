//Dependancies
  process.stdout.write('\x1Bc')
  const express = require('express')
  const app = express()
  const WebSocket = require('ws')
  const wss = new WebSocket.Server({port:3001})
  const Cortex = require('lib/cortex.js')

//Static server
  app.use(express.static('client/'))
  app.listen(3000, () => process.stdout.write('Server started on port 3000\nWebSocket server started on port 3001\n'))

//WebSockets
  let sid = null
  wss.on('connection', ws => {
    //Log
      process.stdout.write('\x1b[36mClient logged to wss                                          \x1b[0m\n')
    //Websockets events
      ws.on('error', () => null)
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
		}).then(result => ws.send(result)).catch(err => console.log(err))
	  })
  })

//Cortex API
  let client = null, attempt = 0
  ;(function connect() {
    client = new Cortex({verbose:1, threshold:0})
    client.ready.then(() => client.init().queryHeadsets().then(headsets => {
      if (headsets.length) { connected(headsets) } else { process.stdout.write(`\x1b[31mNo headsets found [attempt n°${attempt++}]\x1b[0m\r`) ; connect() }
    })).catch(error => process.stdout.write(`\x1b[31mFailed to initialize Cortex API\x1b[0m\r`))
  })()

//Connected to Cortex API
  function connected(headsets) {
    client
      .createSession({status:'open'})
      .subscribe({streams:['mot', 'sys']})
      .then(subs => {
          if ((!subs[0].mot)||(!subs[1].sys)) return console.error('Failed to subscribe to required channels')
          sid = subs.sid
          client.on('mot', event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['mot', ...event.mot.slice(-3)])) }))
          let time = 0
          setInterval(() => client.queryHeadsets().then(headsets => {
            let active = []
            if (!active.length) { time = 0 ; return process.stdout.write(`\x1b[31mConnection lost\x1b[0m\r`) }
            headsets.forEach(headset => active.push(headset.id))
            process.stdout.write(`\x1b[32mConnected to headset (${active.join()}) [since ${time++} sec]\x1b[0m\r`)
          }), 1000)
      }).catch(error => console.error('\x1b[31mError : %s\x1b[0m', "Failed to connect to headset"))
  }
