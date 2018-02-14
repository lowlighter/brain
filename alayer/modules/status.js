//
  String.prototype.padEnd = function () { return this }

//Status
  const status = {
    hardware:[],
    server:false,
    socket:0,
    headsets:[],
    parrot:false,
    time:0,
    init(hardware) {
      status.hardware = hardware
      process.stdout.write(`| # | ${'Server'.padEnd(10)} | ${'Sockets'.padEnd(10)} | ${'Headsets'.padEnd(11)} | ${'Parrot'.padEnd(11)} |\n`)
      process.stdout.write(`+---+${'-'.repeat(12)}+${'-'.repeat(12)}+${'-'.repeat(13)}+${'-'.repeat(13)}+\n`)
      status.update()
      setInterval(() => status.update(), 500)
    },
    update() {
      let c = ["–", "\\", "|", "/"][++status.time%4]
      let server = `\x1b[${status.server ? 32 : 31}m${(status.server ? "Active" : "Pending").padEnd(10)}\x1b[0m`
      let socket = `\x1b[${status.socket ? 32 : 31}m${(`${status.socket} client${status.socket > 1 ? 's' : ''}`).padEnd(10)}\x1b[0m`
      let headset = [`\x1b[${status.headsets.indexOf(status.hardware[0]) >= 0 ? 32 : 31}m${status.hardware[0].slice(-4)}\x1b[0m`, `\x1b[${status.headsets.indexOf(status.hardware[1]) >= 0 ? 32 : 31}m${status.hardware[1].slice(-4)}\x1b[0m`]
      let parrot = `\x1b[${status.parrot ? 32 : 31}m${(status.parrot ? "Available" : "Unavailable").padEnd(11)}\x1b[0m`
      process.stdout.write(`\r| ${c} | ${server} | ${socket} | ${headset[0]} | ${headset[1]} | ${parrot} |`)
    }
  }

//Exports
  module.exports = function (hardware = ["INSIGHT-56A88E2E", "INSIGHT-56A88E44"]) {
    status.init(hardware)
    return status
  }
