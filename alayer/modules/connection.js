//Cortex API
  const Cortex = require('./../js/cortex')

//Cortex API
  let status = {}
  function connect(client) {
    status.connect = !status.connect
    client.queryHeadsets().then(headsets => {
      if (headsets.length) return connected(client, headsets)
      try {
        client.createSession({status: 'open'}).subscribe({streams: ['dev']}).then(() => null).catch(e => null)
        //connected(client, headsets)
      } catch (e) {}
      setTimeout(() => connect(client), 1000)
    }).catch(error => null)
  }

//Connected to Cortex API
  function connected(client, headsets) {
    console.log(`\n${JSON.stringify(headsets)}\n`)
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
          setInterval(() => client.queryHeadsets().then(headsets => {
            console.log(`\n${headsets}\n`)
            status.headsets = headsets.map(h => h.id)
          }), 1000)
      }).catch(error => null)
  }

//Exports
  module.exports = function (state) {
    status = state
    const client = new Cortex({verbose:1, threshold:0})
    client.ready.then(() => {
      client.init()
      connect(client)
    })
  }
