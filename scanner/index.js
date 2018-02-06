//Dependancies
  const Cortex = require('./lib/cortex')

//Initialization
  let found = false
  let i = 0

//Scan
  ;(function scan() {
    let status = "timeout"
    const client = new Cortex({})
    client.ready.then(() => client.init().queryHeadsets().then(headsets => {
      found = headsets.length > 0
      if (found) { status = "success" ; done(headsets) } else { scan() }
    })).catch(() => status = "connection error")
    process.stdout.write(`Searching for headset (Attempt n°${i++}, ${status})\r`)
  })()

//Callback when found
  function done(headsets) {
    console.log('\n\x1b[36m%s headset(s) found\x1b[0m', headsets.length)
    headsets.map(headset => {
      console.log('\x1b[32m%s\x1b[0m : %s', headset.id, headset.status)
    })
    process.exit(0)
  }
