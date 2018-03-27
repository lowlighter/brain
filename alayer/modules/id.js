//Dependancies
  const crypto = require("crypto")

//Exports
  module.exports = function () {
    return crypto.randomBytes(6).toString("hex").toLocaleUpperCase()
  }
