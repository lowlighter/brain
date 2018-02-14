//Dependancies
  process.stdout.write('\x1Bc')

//Hardware and status
  const hardware = process.env.npm_package_config_hardware
  //const parrot = require('./../parrot/index')
  const status = require('./modules/status')(hardware)

//Sever and app
  const app = require('express')()
  const server = require('./modules/server')(app, status)
  const callbacks = server.callbacks
  const parrot_wifi = require('./modules/parrot-wifi')(status)

//Cortex API
  const Cortex = require('./js/cortex')

//Global Error Handling
  process.on('uncaughtException', error => console.error(error))
