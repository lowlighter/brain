//Cortex API
  const Cortex = require('./../js/cortex')

//Cortex API
  let callbacks = null
  let status = {}, interval = null, sid = null, hardware = [], id = ""
  let sessions = new Map()
  function connect(client) {
    clearInterval(interval)
    status.connect = !status.connect
    client.queryHeadsets().then(headsets => {
      status.headsets = headsets.map(h => h.id.toLocaleUpperCase())
      //console.log(status.headsets)
      if (headsets.length) connected(client, headsets)
      //try { client.createSession({status: 'open'}).then(() => null).catch(e => null) } catch (e) {}
      setTimeout(() => connect(client), 1000)
    }).catch(error => null)
  }

//Connected to Cortex API
  function connected(client, headsets) {
    headsets.forEach(headset => {
      const hid = headset.id
      if ((connected.headsets.has(hid))||(false)) return null
      //console.log("CREATE SESSION "+hid)
      connected.headsets.add(hid)
      client
        .createSession({status:'open', headset:hid, project:hid})
        .then(session => {
          //console.log("CREATED SESSION "session.id)
          sessions.set(session.id, hid)
          client.subscribe({streams:['fac', 'dev', 'pow', 'mot', 'sys', 'met', 'com'], session:session.id}).then(subs => {
            if ((!subs[0].fac)||(!subs[1].dev)||(!subs[2].pow)||(!subs[3].mot)||(!subs[4].sys)||(!subs[5].met)) throw new Error("Couldn't subscribe to required channels")
          }).catch(e => null)
        }).catch(e => null)
    })
  }
  connected.headsets = new Set()

//Exports
  module.exports = function (state, _callbacks, _hardware, _id) {
    callbacks = _callbacks
    hardware = _hardware
    id = _id
    status = state
    const client = new Cortex({verbose:1, threshold:0})
    return new Promise((solve, reject) => {
        client.ready.then(() => {
        client.init(undefined, token => {
          //client.on('dev', event => console.log(`${sessions.get(event.sid).toLocaleUpperCase()}`)) // DEBUG
          client.on('fac', event => callbacks.fac.forEach(callback => callback(event, `${sessions.get(event.sid).toLocaleUpperCase()}#${id}`)))
          client.on('dev', event => callbacks.dev.forEach(callback => callback(event, `${sessions.get(event.sid).toLocaleUpperCase()}#${id}`)))
          client.on('pow', event => callbacks.pow.forEach(callback => callback(event, `${sessions.get(event.sid).toLocaleUpperCase()}#${id}`)))
          client.on('mot', event => callbacks.mot.forEach(callback => callback(event, `${sessions.get(event.sid).toLocaleUpperCase()}#${id}`)))
          client.on('sys', event => callbacks.sys.forEach(callback => callback(event, `${sessions.get(event.sid).toLocaleUpperCase()}#${id}`)))
          client.on('met', event => callbacks.met.forEach(callback => callback(event, `${sessions.get(event.sid).toLocaleUpperCase()}#${id}`)))
          client.on('com', event => callbacks.com.forEach(callback => callback(event, `${sessions.get(event.sid).toLocaleUpperCase()}#${id}`)))
          connect(client)
          solve({client, sid() { return sid }})
        })
      })
    })
  }
