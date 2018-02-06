//Dependancies
  const express = require('express')
  const app = express()
  const WebSocket = require('ws')
  const wss = new WebSocket.Server({port:3001})
  const cortex = require('./js/cortex.events')

//Static server
  app.use(express.static('.'))
  app.listen(3000, () => console.log('Server started on port 3000\nWebSocket server started on port 3001'))

//WebSockets
  wss.on('connection', ws => {
    console.log('Client logged to wss')

    //TODO : Retrieve data from Cortex API
    //ws.send(data)

    ws.on('error', () => null)
    ws.on('close', () => console.log('Client disconnected from wss'))
  })
