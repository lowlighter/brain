//Dependancies
  process.stdout.write('\x1Bc')

//Hardware and status
  const hardware = process.env.npm_package_config_hardware
  const logger = require('./modules/status')(hardware)
  const status = logger.status

//Sever and app
  const app = require('express')()
  const server = require('./modules/server')(app, status)
  const callbacks = server.callbacks
  const parrot_wifi = require('./modules/parrot-wifi')(status)


//Cortex API
  const client = require('./modules/connection')(status, callbacks).then(d => {
    server.client(d.client, d.sid)  
  })
  

//Global Error Handling
  process.on('uncaughtException', error => {
    if(!/TypeError: Cannot read property 'match' of undefined/.test(error))
      console.error(error)
  })
  logger.callbacks(callbacks)
