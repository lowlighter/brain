//Cortex API
  const Cortex = require('./../js/cortex')

//Cortex API
  let status = {}, interval = null
  function connect(client) {
    clearInterval(interval)
    status.connect = !status.connect
    client.queryHeadsets().then(headsets => {
      if (headsets.length) return connected(client, headsets)
      //try { client.createSession({status: 'open'}).then(() => null).catch(e => null) } catch (e) {}
      setTimeout(() => connect(client), 1000)
    }).catch(error => null)
  }

//Connected to Cortex API
  function connected(client, headsets) {
    interval = setInterval(() => client.queryHeadsets().then(headsets => status.headsets = headsets.map(h => h.id.toLocaleUpperCase())), 1000)
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
