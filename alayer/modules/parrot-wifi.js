const wifi = require('node-wifi')

let getStatus = networks => {
	let status = false
	networks.forEach(network => {
		if(network.ssid === "Max_1000")
			status = true
	})
	return status
}

wifi.init({iface:null})
let scanner = (status) => {
	setTimeout(scanner, 5000, status)

	wifi.scan()
		.then(networks => status.parrot = getStatus(networks))
		.catch(err => {
			status.parrot = false
			status.parrot_connected = false
		})

	wifi.getCurrentConnections()
		.then(connections => status.parrot_connected = getStatus(connections))
		.catch(err => {
			status.parrot = false
			status.parrot_connected = false
		})
}

module.exports = scanner;