//Cortex API
  const Cortex = require('./js/cortex')

//Cortex API
  function connect(client) {
    client.queryHeadsets().then(headsets => {
      console.log(headsets.join(",")+"\n\n")

      try {
        client.createSession({status: 'open'}).subscribe({streams: ['dev']}).then(() => null).catch(e => null)
      } catch (e) {}

      if (headsets.length || isConnected) { connected(headsets) } else { status.headset = []; setTimeout(() => connect(), 1000) }
    }).catch(error => null)
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
          setInterval(() => client.queryHeadsets().then(headsets => { status.connected = headsets }), 1000)
      }).catch(error => null)
  }

//Start


  module.exports = function () {
    const client = new Cortex({verbose:1, threshold:0})

    client.ready.then(() => {
      client.init()
      connect(client)
    })
  }
