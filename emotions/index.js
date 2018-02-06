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
    console.log('\x1b[36m%s\x1b[0m', 'Client logged to wss')

    //TODO : Retrieve data from Cortex API
    //ws.send(data)

    ws.on('error', () => null)
    ws.on('close', () => console.log('\x1b[36m%s\x1b[0m', 'Client disconnected from wss'))
  })

//Cortex API
  const client = new Cortex({verbose:1, threshold:0})
  client.ready
    .then(() => client.init())
    .then(() => client.createSession({status:'open'}).subscribe({streams:['fac']})).catch(error => console.error('\x1b[31mError : %s\x1b[0m', error.name))
    .then(subs => {
        if (!subs[0].fac) return console.error('Failed to subscribe')
        client.on('fac', event => console.log(event.fac))
    }).catch(error => console.error('\x1b[31mError : %s\x1b[0m', error.name))
