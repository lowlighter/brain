//Dependancies
  process.stdout.write('\x1Bc')
  const express = require('express')
  const app = express()
  const WebSocket = require('ws')
  const wss = new WebSocket.Server({port:3001})
  const Cortex = require('./js/cortex')

//Static server
  app.use(express.static('.'))
  app.listen(3000, () => process.stdout.write('Server started on port 3000\nWebSocket server started on port 3001\n'))

//WebSockets
  wss.on('connection', ws => {
    //Log
      process.stdout.write('\x1b[36mClient logged to wss                                          \x1b[0m\n')
    //Websockets events
      ws.on('error', () => null)
  })

//Cortex API
  let client = null, attempt = 0
  ;(function connect() {
    client = new Cortex({verbose:1, threshold:0})
    client.ready.then(() => client.init().queryHeadsets().then(headsets => {
      if (headsets.length) { connected(headsets) } else { process.stdout.write(`\x1b[31mNo headsets found [attempt n°${attempt++}]\x1b[0m\r`) ; connect() }
    })).catch(error => console.error('\x1b[31mError : %s\x1b[0m', "Failed to initialize Cortex API"))
  })()

//Connected to Cortex API
  function connected(headsets) {
    client
      .createSession({status:'open'})
      .subscribe({streams:['met', 'pow']})
      .then(subs => {
          if (!subs[0].met) return console.error('Failed to subscribe to required channels')
          client.on('met', event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['met', ...event.met])) }))
          client.on('pow', event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['pow', ...event.pow])) }))
          let time = 0
          setInterval(() => client.queryHeadsets().then(headsets => {
            let active = []
            headsets.forEach(headset => active.push(headset.id))
            process.stdout.write(`\x1b[32mConnected to headset (${active.join()}) [since ${time++} sec]\x1b[0m\r`)
          }), 1000)
      }).catch(error => console.error('\x1b[31mError : %s\x1b[0m', "Failed to connect to headset"))
  }
