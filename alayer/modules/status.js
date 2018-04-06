//Callbacks
  let callbacks = {hdw:[]}

//Events
  const EventEmitter = require('events')
  const emitter = new EventEmitter()
  emitter.on("event", event => callbacks.hdw.forEach(callback => callback(event, `headset#${status.id}`)))

//IP scan
  const os = require('os')
  const networks = os.networkInterfaces()
  const ips = []
  Object.keys(networks).forEach(name => {
    networks[name].forEach(network => {
      if ('IPv4' !== network.family || network.internal !== false) return
      ips.push(`  ${name.substr(0, 35).padEnd(35, " ")} │ ${network.address}`)
    })
  })

//Cortex and commits
  const running = require("./running")
  let commits = require('child_process').execSync('git rev-list --count master').toString().replace(/\n/g, "")
  if (Number.isNaN(Number(commits))) commits = "(unavailable)"

//Python
  const python = require("./python")

//Status
  const status = {
    id:"unknown",
    hardware:[],
    server:false,
    socket:0,
    headsets:[],
    remote_hdw:[],
    parrot:false,
    parrot_connected:false,
    time:0,
    connect:false,
    remote:null,
    cortex:false,
    python:false,
    debug:false,
    remote_ip:"(none)",
    init(hardware, id, update = true) {
      if (hardware) status.hardware = hardware
      if (id) status.id = id
      process.stdout.write('\x1Bc')
      process.stdout.write(`\n   █████╗ ██╗      █████╗ ██╗   ██╗███████╗██████╗ \n`)
      process.stdout.write(`  ██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝██╔════╝██╔══██╗\n`)
      process.stdout.write(`  ███████║██║     ███████║ ╚████╔╝ █████╗  ██████╔╝\n`)
      process.stdout.write(`  ██╔══██║██║     ██╔══██║  ╚██╔╝  ██╔══╝  ██╔══██╗\n`)
      process.stdout.write(`  ██║  ██║███████╗██║  ██║   ██║   ███████╗██║  ██║\n`)
      process.stdout.write(`  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝\n\n`)

      process.stdout.write(`  ${"Latest commit update".padEnd(35, " ")} │ ${commits}\n`)
      process.stdout.write(`  ${"Debug mode".padEnd(35, " ")} │ ${status.debug ? "Enabled" : "Disabled"}\n`)
      process.stdout.write(`  ${" ".padEnd(35, " ")} │ \n`)
      process.stdout.write(`  ${"CortexService status".padEnd(35, " ")} │ \x1b[${status.cortex ? 37 : 31}m${(status.cortex ? "Running" : "Not running")}\x1b[0m\n`)
      process.stdout.write(`  ${"Python environment".padEnd(35, " ")} │ \x1b[${status.python ? 37 : 31}m${(status.python ? "Available" : "Unavailable")}\x1b[0m\n`)
      process.stdout.write(`  ${"Server websockets id".padEnd(35, " ")} │ ${status.id}\n`)
      process.stdout.write(`  ${"Remote server ip address".padEnd(35, " ")} │ ${status.remote_ip}\n`)
      process.stdout.write(`  ${" ".padEnd(35, " ")} │ \n`)
      process.stdout.write(`${ips.join("\n")}\n\n`)

      process.stdout.write(`  # - Server status\n`)
      process.stdout.write(`  ¤ - Headsets research status\n`)
      process.stdout.write(`  @ - Remote server connection status\n`)
      process.stdout.write(`  $ - Python process status\n\n`)
      process.stdout.write(`┍━━━┯━━━┯━━━┯━━━┯${'━'.repeat(12)}┯${'━'.repeat(12)}┯${'━'.repeat(20)}┯${'━'.repeat(13)}┑\n`)
      process.stdout.write(`│ # │ ¤ │ @ │ $ │ ${'Server'.padEnd(10)} │ ${'Sockets'.padEnd(10)} │ ${'Headsets'.padEnd(18)} │ ${'Parrot'.padEnd(11)} │\n`)
      process.stdout.write(`┝━━━┿━━━┿━━━┿━━━┿${'━'.repeat(12)}┿${'━'.repeat(12)}┿${'━'.repeat(6)+'┯'+'━'.repeat(6)+'┯'+'━'.repeat(6)}┿${'━'.repeat(13)}┥\n`)
      if (update) setInterval(() => status.update(), 500)
      status.update()
    },
    update() {
      let c = ["—", "\\", "|", "/"][++status.time%4]
      let rs = typeof status.remote === "boolean" ? `\x1b[${status.remote ? 32 : 31}m•\x1b[0m` : "-"
      let d = status.cortex ? [" ", "•"][status.connect ? 1 : 0] : "-"
      let p = status.python ? [" ", "•"][python.python ? 1 : 0] : "-"
      let server = `\x1b[${status.server ? 32 : 31}m${(status.server ? "Active" : "Pending").padEnd(10)}\x1b[0m`
      let socket = `\x1b[${status.socket ? 32 : 31}m${(`${status.socket} client${status.socket > 1 ? 's' : ''}`).padEnd(10)}\x1b[0m`
      //Headsets
      let h0 = status.headsets.includes(status.hardware[0]), r0 = status.remote_hdw.includes(status.hardware[0])
      let h1 = status.headsets.includes(status.hardware[1]), r1 = status.remote_hdw.includes(status.hardware[1])
      let h2 = status.headsets.includes(status.hardware[2]), r2 = status.remote_hdw.includes(status.hardware[2])
      let prefered = status.headsets.length ? status.headsets[0] : status.remote_hdw.length ? status.remote_hdw.filter(v => v)[0] : status.hardware[0]
      let headset = [`\x1b[${h0 ? 32 : r0 ? 33 : 31}m${(status.hardware[0]||[]).slice(-4)}\x1b[0m`, `\x1b[${h1 ? 32 : r1 ? 33 : 31}m${(status.hardware[1]||[]).slice(-4)}\x1b[0m`, `\x1b[${h2 ? 32 : r2 ? 33 : 31}m${(status.hardware[2]||[]).slice(-4)}\x1b[0m`]
      let parrot = `\x1b[${status.parrot ? 32 : 31}m${(status.parrot_connected ? "Connected" : status.parrot ? "Available" : "Unavailable").padEnd(11)}\x1b[0m`
      process.stdout.write(`\r│ ${c} │ ${d} │ ${rs} │ ${p} │ ${server} │ ${socket} │ ${headset[0]} │ ${headset[1]} │ ${headset[2]} │ ${parrot} │`)
      //hdw event :
      //  hardware[0] string id | false
      //  hardware[1] string id | false
      //  parrot is connected | false
      //  prefered hardware
      //  hardware[0] is remote connected
      //  hardware[1] is remote connected
      //  remote server is active
      //  hardware[2] string id | false
      //  hardware[2] is remote connected
      emitter.emit("event", {hdw:[h0 ? status.hardware[0] : false, h1 ? status.hardware[1] : false, status.parrot, prefered, r0, r1, status.remote, h2 ? status.hardware[2] : false, r2]})
    }
  }

//Exports
  module.exports = function (hardware, id) {
    status.python = python.available()
    running('CortexService.exe', 'CortexService', 'CortexService').then(v => {
      status.cortex = v
      status.init(hardware, id)
    }).catch(e => status.init(hardware, id))

    return {status, callbacks(c) { callbacks = c }}
  }
