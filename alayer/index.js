//Dependancies
  process.stdout.write('\x1Bc')
  const express = require('express')
  const app = express()
  const WebSocket = require('ws')
  const wss = new WebSocket.Server({port:3001})
  const Cortex = require('./js/cortex')
  const path = require('path')

//Callbacks list
  const callbacks = {
    fac:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['fac', ...event.fac])) })],
    dev:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['dev', ...event.dev])) })],
    pow:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['pow', ...event.pow])) })],
    mot:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['mot', ...event.mot])) })],
    sys:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['sys', ...event.sys])) })],
    met:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['met', ...event.met])) })]
  }

  const parrot = require('./../parrot/index')(callbacks, wss)

//Error Handling
  let crashed = false, reconnect = null
  process.on('uncaughtException', error => {
    if (!crashed) process.stdout.write(`\x1b[31m\nError : An error occured (${error}), however server should still be active\x1b[0m`)
    crashed = true
    clearTimeout(reconnect)
    reconnect = setTimeout(connect, 5000)
  })

//Static server
  app.use('/battle1', express.static(path.join(__dirname, '../battle1')))
  app.use('/emotions', express.static(path.join(__dirname, '../emotions')))
  app.use('/kawashima', express.static(path.join(__dirname, '../kawashima')))
  app.use('/pong', express.static(path.join(__dirname, '../pong/client')))
  app.use('/miscelleanous', express.static(path.join(__dirname, '../miscelleanous/imgs')))
  app.use('/parrot', express.static(path.join(__dirname, '../parrot')))
  app.use('/', express.static(path.join(__dirname, './client')))

  app.listen(3000, () => process.stdout.write('Server started on port 3000\nWebSocket server started on port 3001\n'))

//WebSockets
  wss.on('connection', ws => {
    //Log
      process.stdout.write('\x1b[36m\nClient logged to wss\x1b[0m')
    //Websockets events
      ws.on('error', () => null)
      ws.on('message', data => {
        const parsed = JSON.parse(data)
        switch (parsed.action) {
          case "setId":
            ws.alayer_id = parsed.id
          case "getId":
            ws.send(JSON.stringify(["getId", ws.alayer_id]))
            break
          default:
        }
      });
  })

//Cortex API
  let client = null, attempt = 1, isConnected = false;
  function connect() {
    client = new Cortex({verbose:1, threshold:0})
    client.ready.then(() => client.init().queryHeadsets().then(headsets => {
      if (headsets.length || isConnected) { connected(headsets) } else { process.stdout.write(`\r\x1b[35mSearching for an headset [since ${attempt++} sec]${" ".repeat(30)}\x1b[0m`) ; setTimeout(() => { connect(); checkConnection() }, 1000) }
    })).catch(error => null)
  }

//Check connection
  function checkConnection(){
    try {
      client
        .createSession({status: 'open'})
        .subscribe({streams: ['dev']})
        .then(_subs => {
          if(subs != undefined){
            isConnected = true;
          }
        });
    } catch (e) { isConnected = false }
  }

//Connected to Cortex API
  function connected(headsets) {
    client
      .createSession({status:'open'})
      .subscribe({streams:['fac', 'dev', 'pow', 'mot', 'sys', 'met']})
      .then(subs => {
          if ((!subs[0].fac)||(!subs[1].dev)||(!subs[2].pow)||(!subs[3].mot)||(!subs[4].sys)||(!subs[5].met)) return process.stdout.write(`\n\x1b[31mError : Failed to subscribe to required channels\x1b[0m`)
          client.on('fac', event => callbacks.fac.forEach(callback => callback(event)))
          client.on('dev', event => callbacks.dev.forEach(callback => callback(event)))
          client.on('pow', event => callbacks.pow.forEach(callback => callback(event)))
          client.on('mot', event => callbacks.mot.forEach(callback => callback(event)))
          client.on('sys', event => callbacks.sys.forEach(callback => callback(event)))
          client.on('met', event => callbacks.met.forEach(callback => callback(event)))
          let time = 1
          setInterval(() => client.queryHeadsets().then(headsets => {
            let active = []
            headsets.forEach(headset => active.push(headset.id))
            process.stdout.write(`\r\x1b[32mConnected to headset (${active.join()}) [since ${time++} sec]${" ".repeat(30)}\x1b[0m`)
          }), 1000)
      }).catch(error => process.stdout.write(`\n\x1b[31mError : Connection to headset failed\x1b[0m`))
  }

//Start
  connect()
