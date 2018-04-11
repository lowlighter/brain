const sumo = require('node-sumo');

const MAG_X = 7;
const MAG_Y = 8;
const MAG_Z = 9;

const speed = 40;

let drone = sumo.createClient();

let tap = drone => {
	drone.animationsTap();
};

let jump = drone => {
	drone.postureJumper();
	drone.animationsHighJump();
}

let start = null;
let delta = 500;
let samples = [];
let calibrationSamples = 30;

module.exports = function (callbacks, wss) {
	/* Cortex part */
	// drone.connect(() => drone.postureJumper());
	// drone.on('ready', () =>
		callbacks.inf.push(event => {
			// type = // TOTEST
			// direction = //TOTEST
			// if(type === "prediction") {
				wss.clients.forEach(client => client.send(JSON.stringify(["action", event.inf])))
			// 	switch(direction) {
			// 		case "gauche":
			// 			drone.left(speed); break
			// 		case "droite":
			// 			drone.right(speed); break
			// 		case "neutre":
			// 			drone.stop()
			// 	}
			// }
		})

		// callbacks.mot.push(data => {
		// 	let send = action => {
		// 		wss.clients.forEach(client => client.send(JSON.stringify(["action", action])))
		// 	}

		// 	if(samples.length < calibrationSamples) {
		// 		samples.push(data.mot[MAG_Z])
		// 	} else {
		// 		if(start === null) {
		// 			start = samples.reduce((a,b) => a + b) / samples.length;
		// 		}
		// 		if(Math.abs(data.mot[MAG_Z] - start) > delta) {
		// 			if(data.mot[MAG_Z] - start > 0) {
		// 				send('right');
		// 				drone.right(speed);
		// 			} else {
		// 				send('left');
		// 				drone.left(speed);
		// 			}
		// 		} else {
		// 			send('center');
		// 			drone.stop();
		// 		}
		// 	}
		// })
	// );

	return drone;
};