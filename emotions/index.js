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
    })).catch(error => process.stdout.write(`\x1b[31mFailed to initialize Cortex API\x1b[0m\r`))
  })()

//Connected to Cortex API
  function connected(headsets) {
    client
      .createSession({status:'open'})
      .subscribe({streams:['fac', 'dev', 'pow']})
      .then(subs => {
          if ((!subs[0].fac)||(!subs[1].dev)||(!subs[2].pow)) return console.error('Failed to subscribe to required channels')
          client.on('fac', event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['fac', ...event.fac])) }))
          client.on('dev', event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['dev', ...event.dev])) }))
          client.on('pow', event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['pow', ...event.pow])) }))
          let time = 0
          setInterval(() => client.queryHeadsets().then(headsets => {
            let active = []
            if (!active.length) { time = 0 ; return process.stdout.write(`\x1b[31mConnection lost\x1b[0m\r`) }
            headsets.forEach(headset => active.push(headset.id))
            process.stdout.write(`\x1b[32mConnected to headset (${active.join()}) [since ${time++} sec]\x1b[0m\r`)
          }), 1000)
      }).catch(error => console.error('\x1b[31mError : %s\x1b[0m', "Failed to connect to headset"))
  }
