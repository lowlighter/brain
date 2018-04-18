//Arguments parsing
  process.stdout.write('\x1Bc')
  process.stdout.write('Loading...\n')
  let remote = null, debug = false
  process.argv.forEach((v, i) => {
    if (/server=[0-9/.:a-zA-Z]+/.test(v)) { remote = v.match(/server=([0-9/.:a-zA-Z]+)/)[1] }
    if (/debug=((?:true)|(?:false)|1|0)/.test(v)) { debug = {"1":1, "0":0, "true":1, "false":0}[v.match(/debug=((?:true)|(?:false)|1|0)/)[1]] }
  })

//Server instance id
  const id = require('./modules/id')()

//Status
  const fs = require("fs")
  const path = require("path")
  const fs_read= fs.readFileSync(path.join(__dirname, "./../hardware.txt")).toString()

//Check hardware
  const hardware = fs_read.trim().match(/[-a-z0-9]+/gi)
  if (!(hardware||[]).length) return process.stdout.write(`\n\x1b[36mNo headsets were referenced in hardware.txt\x1b[0m`)
  process.stdout.write(`\n${hardware.length} headsets referenced\n${hardware.map(h => `  - ${h}`).join("\n")}\n`)

//Logger
  const logger = require('./modules/status')(hardware, id)
  const status = logger.status
  status.debug = debug

//Sever and app
  const app = require('express')()
  const server = require('./modules/server')(app, status, remote, id)
  const callbacks = server.callbacks
  const parrot_wifi = require('./modules/parrot-wifi')(status)


//Cortex API
  const connection = require('./modules/connection')(status, callbacks, hardware, id).then(d => {
    server.client(d.client, d.sid)
  })

//Global Error Handling
  process.on('uncaughtException', error => {
    if (/alayer.node_modules.node-wifi.src.windows-scan.js/.test(error.stack)) return null
    if (debug) console.error(error)
  })
  logger.callbacks(callbacks)
