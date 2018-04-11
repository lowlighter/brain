const sumo = require('node-sumo');

const speed = 40;

let drone = sumo.createClient();

module.exports = function (callbacks, wss) {
	/* Cortex part */
	drone.connect(() => drone.postureJumper());
	drone.on('ready', () =>
		callbacks.inf.push(event => {
			status = event.inf.shift()
			direction = event.inf.shift()
			if(status === "prediction") {
				switch(direction) {
					case "gauche":
						drone.left(speed); break
					case "droite":
						drone.right(speed); break
					case "neutre":
						drone.stop()
				}
			}
		})
	);

	return drone;
};