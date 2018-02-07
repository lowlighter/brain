//Dependancies
  const express = require('express')
  const app = express()
  const WebSocket = require('ws')
  const wss = new WebSocket.Server({port:3001})
  const Cortex = require('./js/cortex')

//Static server
  app.use(express.static('.'))
  app.listen(3000, () => console.log('Server started on port 3000\nWebSocket server started on port 3001'))

//WebSockets
  wss.on('connection', ws => {
    //Log
      console.log('\x1b[36m%s\x1b[0m', 'Client logged to wss')
    //EEG headset
      client
    //Websockets events
      ws.on('error', () => null)
      ws.on('close', () => console.log('\x1b[36m%s\x1b[0m', 'Client disconnected from wss'))
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
      .then(() => client.subscribe({streams:['fac', 'dev', 'pow']}).then(subs => {
            if ((!subs[0].fac)||(!subs[1].dev)||(!subs[2].pow)) return console.error('Failed to subscribe')
            client.on('fac', event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['fac', ...event.fac])) }))
            client.on('dev', event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['dev', ...event.dev])) }))
            client.on('pow', event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['pow', ...event.pow])) }))
            console.log('\x1b[32m%s\x1b[0m', "Connected to headset")
          }).catch(error => console.error('\x1b[31mError : %s\x1b[0m', "Failed to connect to headset"))
        )
