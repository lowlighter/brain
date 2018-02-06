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
      client.subscribe({streams:['fac']})
        .then(subs => {
            if (!subs[0].fac) return console.error('Failed to subscribe')
            client.on('fac', event => { if (ws.readyState !== ws.CLOSED) ws.send(JSON.stringify(['fac', ...event.fac]))})
            client.on('dev', event => { if (ws.readyState !== ws.CLOSED) ws.send(JSON.stringify(['dev', ...event.fac]))})
            console.log('\x1b[32m%s\x1b[0m', "Connected to headset")
        }).catch(error => console.error('\x1b[31mError : %s\x1b[0m', "Failed to connect to headset"))
    //Websockets events
      ws.on('error', () => null)
      ws.on('close', () => console.log('\x1b[36m%s\x1b[0m', 'Client disconnected from wss'))
  })

//Cortex API
  const client = new Cortex({verbose:1, threshold:0})
  client.ready
    .then(() => client.init())
    .then(() => client.createSession({status:'open'}))
    .catch(error => console.error('\x1b[31mError : %s\x1b[0m', "Failed to connect to headset"))
