//Dependancies
  const express = require('express')
  const path = require('path')
  const WebSocket = require('ws')
  const wss = new WebSocket.Server({port:3001})
  const parrot = require('../../parrot/index')
  let client = null, sid = null, rws = null

//Callbacks list
  const callbacks = {
    fac:[(event, headset) => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['fac', headset, ...event.fac])) })],
    dev:[(event, headset) => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['dev', headset, ...event.dev])) })],
    pow:[(event, headset) => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['pow', headset, ...event.pow])) })],
    mot:[(event, headset) => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['mot', headset, ...event.mot])) })],
    sys:[(event, headset) => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['sys', headset, ...event.sys])) })],
    met:[(event, headset) => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['met', headset, ...event.met])) })],
    hdw:[(event, headset) => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['hdw', headset, ...event.hdw])) })],
    com:[(event, headset) => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['com', headset, ...event.com])) })],
  }

//Exports
  module.exports = function (app, status, remote) {
    //Static server
      app.use('/battle1', express.static(path.join(__dirname, '../../battle1')))
      app.use('/emotions', express.static(path.join(__dirname, '../../emotions')))
      app.use('/kawashima', express.static(path.join(__dirname, '../../kawashima')))
      app.use('/pong', express.static(path.join(__dirname, '../../pong/client')))
      app.use('/miscelleanous', express.static(path.join(__dirname, '../../miscelleanous/imgs')))
      app.use('/parrot', express.static(path.join(__dirname, '../../parrot')))
      app.use('/recording', express.static(path.join(__dirname, '../../recording')))
      app.use('/training', express.static(path.join(__dirname, '../../training')))
      app.use('/static', express.static(path.join(__dirname, '../../miscelleanous/static')))
      app.use('/', express.static(path.join(__dirname, './../client')))

      app.listen(3000, () => { status.server = true ; status.socket = 0 })

    //Send received data from another server which is connected to headsets to the clients
      if (remote) {
          console.log(`ws://${remote}`)
          rws = new WebSocket(`ws://${remote}`)
          rws.on("open", () => status.remote = true)
          rws.on("error", (e) =>{ console.log(e) ; status.remote = false})
          rws.on("close", () => status.remote = false)
          rws.on("message", data => wss.clients.forEach(ws => {
            console.log("DATA:"+data)
            if (ws.readyState === WebSocket.OPEN) ws.send(data)
          }))
      }

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
              case "training":
                client.call("training", {
                  "_auth": client._auth,
                  "detection": "mentalCommand",
                  "session": sid(),
                  "action": parsed.trainingAction,
                  "status": parsed.status
                }).then((a)=> console.log(a));
                break;
              case "parrotStart":
                parrot(callbacks, wss)
                break;
              case "kawashimaStart":
                //console.log("KAWASHIMA");
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
    //Callbacks
      return {app, callbacks, wss, rws, client(c, s) { client = c ; sid = s }}
  }
