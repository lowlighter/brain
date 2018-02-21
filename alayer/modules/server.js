//Dependancies
  const express = require('express')
  const path = require('path')
  const WebSocket = require('ws')
  const wss = new WebSocket.Server({port:3001})
  const parrot = require('../../parrot/index')
  let client = null, sid = null

//Callbacks list
  const callbacks = {
    fac:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['fac', ...event.fac])) })],
    dev:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['dev', ...event.dev])) })],
    pow:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['pow', ...event.pow])) })],
    mot:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['mot', ...event.mot])) })],
    sys:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['sys', ...event.sys])) })],
    met:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['met', ...event.met])) })],
    hdw:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['hdw', ...event.hdw])) })],
    com:[event => wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(['com', ...event.com])) })],

  }

//Exports
  module.exports = function (app, status) {
    //Static server
      app.use('/battle1', express.static(path.join(__dirname, '../../battle1')))
      app.use('/emotions', express.static(path.join(__dirname, '../../emotions')))
      app.use('/kawashima', express.static(path.join(__dirname, '../../kawashima')))
      app.use('/pong', express.static(path.join(__dirname, '../../pong/client')))
      app.use('/miscelleanous', express.static(path.join(__dirname, '../../miscelleanous/imgs')))
      app.use('/parrot', express.static(path.join(__dirname, '../../parrot')))
      app.use('/recording', express.static(path.join(__dirname, '../../recording')))
      app.use('/', express.static(path.join(__dirname, './../client')))

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
    //Callbacks
      return {app, callbacks, wss, client(c, s) { client = c ; sid = s }}
  }
