//Dependancies
  process.stdout.write('\x1Bc')
  const WebSocket = require('ws')
  const wss = new WebSocket.Server({port:3001})
  const Cortex = require('./lib/cortex')

//WebSockets
  wss.on('connection', ws => {
    //Log
      process.stdout.write('\x1b[36mClient logged to wss                                          \x1b[0m\n')
    //Websockets events
      ws.on('error', () => null)
  })

//Cortex API
  let client = null, attempt = 0
  ;(function connect() {
    client = new Cortex({verbose:1, threshold:0})
    client.ready.then(() => client.init().queryHeadsets().then(headsets => {
      if (headsets.length) { connected(headsets) } else { process.stdout.write(`\x1b[31mNo headsets found [attempt n°${attempt++}]\x1b[0m\r`) ; connect() }
    })).catch(error => process.stdout.write(`\x1b[31mFailed to initialize Cortex API\x1b[0m\r`))
  })()

//Connected to Cortex API
  function connected(headsets) {
    client
      .createSession({status:'open'})
      .subscribe({streams:['fac', 'dev', 'pow']})
      .then(subs => {
          let time = 0
          setInterval(() => client.queryHeadsets().then(headsets => {
            let active = []
            if (!active.length) { time = 0 ; return process.stdout.write(`\x1b[31mConnection lost\x1b[0m\r`) }
            headsets.forEach(headset => active.push(headset.id))
            process.stdout.write(`\x1b[32mConnected to headset (${active.join()}) [since ${time++} sec]\x1b[0m\r`)
          }), 1000)
      }).catch(error => console.error('\x1b[31mError : %s\x1b[0m', "Failed to connect to headset"))
  }
