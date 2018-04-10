//Spawn
  const { spawn, spawnSync } = require('child_process')
  let callbacks = {inf:[]}, status = {}

//Events
  const EventEmitter = require('events')
  const emitter = new EventEmitter()
  emitter.on("event", event => callbacks.inf.forEach(callback => callback(event, `headset#${status.id}`)))

//Python wrapper
  const wrapper = function (_callbacks, _status) {
    callbacks = _callbacks
    status = _status
  }
  wrapper.python = null
  wrapper.free = true
  wrapper.available = function () {
      let python = spawnSync('python', ['./../../training2/test.py'], {cwd:__dirname})
      return !python.error
  }

//Start training
  wrapper.training = function () {
    if (!status.python) return emitter.emit("event", {inf:["err", "python environment is not available on current server"]})
    if (!wrapper.free) return null
    wrapper.kill()
    wrapper.free = false
    wrapper.python = spawn('python', ['./../../training2/main.py'], {cwd:__dirname})
    wrapper.python.stdout.on('data', data => emitter.emit("event", {inf:["out", data.toString()]}))
    wrapper.python.stderr.on('data', data => emitter.emit("event", {inf:["err", data.toString()]}))
    emitter.emit("event", {inf:["out", `starting new instance of python (pid : ${wrapper.python.pid})`]})
    wrapper.python.on('close', data => { wrapper.free = true ; wrapper.python = null ; emitter.emit("event", {inf:["err", `program terminated : ${data.toString()}`]}) })
    wrapper.python.on('error', data => { wrapper.free = true ; wrapper.python = null ; emitter.emit("event", {inf:["err", `program error : ${data.toString()}`]}) })

    wrapper.python.on('message', data => { console.log(data) })
  }


  wrapper.message = function (data) {
    emitter.emit("event", {inf:data})
  }

//Kill process
  wrapper.kill = function () {
    if (!status.python) return emitter.emit("event", {inf:["err", "python environment is not available on current server"]})
    try {
      let pid = wrapper.python.pid
      process.kill(pid, "SIGKILL")
      emitter.emit("event", {inf:["err", `killed previous instance of python (pid : ${pid})`]})
    } catch (e) { return false }
    return true
  }

//Exports
  module.exports = wrapper
