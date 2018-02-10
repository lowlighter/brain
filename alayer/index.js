//Dependancies
  process.stdout.write('\x1Bc')
  const express = require('express')
  const app = express()
  const WebSocket = require('ws')
  const wss = new WebSocket.Server({port:3001})
  const Cortex = require('./js/cortex')
  const path = require('path')
  const parrot = require('./../parrot/index')

//Callbacks list
  const callbacks = {
    fac:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['fac', ...event.fac])) })],
    dev:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['dev', ...event.dev])) })],
    pow:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['pow', ...event.pow])) })],
    mot:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['mot', ...event.mot])) })],
    sys:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['sys', ...event.sys])) })],
    met:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['met', ...event.met])) })]
  }

  const hardware = ["INSIGHT-56A88E2E", "INSIGHT-56A88E44"]

//Status
  const status = {
    server:false,
    socket:0,
    headsets:[],
    parrot:false,
    time:0,
    init() {
      process.stdout.write(`| # | ${'Server'.padEnd(10)} | ${'Sockets'.padEnd(10)} | ${'Headsets'.padEnd(11)} | ${'Parrot'.padEnd(11)} |\n`)
      process.stdout.write(`+---+${'-'.repeat(12)}+${'-'.repeat(12)}+${'-'.repeat(13)}+${'-'.repeat(13)}+\n`)
      status.update()
      setInterval(() => status.update(), 500)
    },
    update() {
      let c = ["–", "\\", "|", "/"][++status.time%4]
      let server = `\x1b[${status.server ? 32 : 31}m${(status.server ? "Active" : "Pending").padEnd(10)}\x1b[0m`
      let socket = `\x1b[${status.socket ? 32 : 31}m${(`${status.socket} client${status.socket > 1 ? 's' : ''}`).padEnd(10)}\x1b[0m`
      let headset = [`\x1b[${status.headsets.indexOf(hardware[0]) >= 0 ? 32 : 31}m${hardware[0].slice(-4)}\x1b[0m`, `\x1b[${status.headsets.indexOf(hardware[1]) >= 0 ? 32 : 31}m${hardware[1].slice(-4)}\x1b[0m`]
      let parrot = `\x1b[${status.parrot ? 32 : 31}m${(status.parrot ? "Available" : "Unavailable").padEnd(11)}\x1b[0m`
      process.stdout.write(`\r| ${c} | ${server} | ${socket} | ${headset[0]} | ${headset[1]} | ${parrot} |`)
    }
  }

//Global Error Handling
  {
    let reconnect = null
    process.on('uncaughtException', error => {
      clearTimeout(reconnect)
      reconnect = setTimeout(connect, 5000)
    })
  }

  status.init()



//Static server
  app.use('/battle1', express.static(path.join(__dirname, '../battle1')))
  app.use('/emotions', express.static(path.join(__dirname, '../emotions')))
  app.use('/kawashima', express.static(path.join(__dirname, '../kawashima')))
  app.use('/pong', express.static(path.join(__dirname, '../pong/client')))
  app.use('/miscelleanous', express.static(path.join(__dirname, '../miscelleanous/imgs')))
  app.use('/parrot', express.static(path.join(__dirname, '../parrot')))
  app.use('/', express.static(path.join(__dirname, './client')))

  app.listen(3000, () => { status.server = true ; status.socket = 0 })

//WebSockets
  wss.on('connection', ws => {
    //Log
      ++status.socket
    //Websockets events
      ws.on('close', () => --status.socket)
      ws.on('error', () => null)
    //Websocket commands
      ws.on('message', data => {
        const parsed = JSON.parse(data)
        switch (parsed.action) {
          case "parrotStart":
            parrot(callbacks, wss)
            break;
          case "kawashimaStart":
            console.log("KAWASHIMA");
            break;
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
      if (headsets.length || isConnected) { connected(headsets) } else { status.headset = []; setTimeout(() => { connect(); checkConnection() }, 1000) }
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
      .createSession({status:'open'/*, headset:hardware[0]*/})
      .subscribe({streams:['fac', 'dev', 'pow', 'mot', 'sys', 'met']})
      .then(subs => {
          if ((!subs[0].fac)||(!subs[1].dev)||(!subs[2].pow)||(!subs[3].mot)||(!subs[4].sys)||(!subs[5].met)) throw new Error("Couldn't subscribe to required channels")
          client.on('fac', event => callbacks.fac.forEach(callback => callback(event)))
          client.on('dev', event => callbacks.dev.forEach(callback => callback(event)))
          client.on('pow', event => callbacks.pow.forEach(callback => callback(event)))
          client.on('mot', event => callbacks.mot.forEach(callback => callback(event)))
          client.on('sys', event => callbacks.sys.forEach(callback => callback(event)))
          client.on('met', event => callbacks.met.forEach(callback => callback(event)))
          let time = 1
          setInterval(() => client.queryHeadsets().then(headsets => status.connected = headsets), 1000)
      }).catch(error => null)
  }

//Start
  connect()
