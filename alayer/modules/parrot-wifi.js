const wifi = require('node-wifi')

wifi.init({iface:null})
let scanner = (status) => {
	wifi.scan((err, networks) => {
		setTimeout(scanner, 1000, status)
		if(err) console.log(err)
		else {
			let local_status = false
			networks.forEach(net => {
				if(net.ssid === "Max_1000") {
					local_status = true
				}
			})
			status.parrot = local_status
		}
	})
}

module.exports = scanner;