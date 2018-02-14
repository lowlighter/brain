const sumo = require('node-sumo');
const keypress = require('keypress');

const MAG_X = 7;
const MAG_Y = 8;
const MAG_Z = 9;

let drone = sumo.createClient();

keypress(process.stdin);

let forward = drone => {
	drone.forward(50);
	setTimeout(() => drone.stop(), 1000);
};

let backward = drone => {
	drone.backward(50);
	setTimeout(() => drone.stop(), 1500);
};

let left = drone => {
	drone.left(20);
	setTimeout(() => drone.stop(), 1000);
};

let right = drone => {
	drone.right(20);
	setTimeout(() => drone.stop(), 1000);
};

let tap = drone => {
	drone.animationsTap();
};

let jump = drone => {
	drone.postureJumper();
	drone.animationsHighJump();
}

/* Drone alone */
drone.connect(() => {
	process.stdin.on('keypress', (ch, key) => {
		switch(key.name) {
			case 'z':		forward(drone);	break;
			case 'q':		left(drone);	break;
			case 's':		backward(drone);break;
			case 'd':		right(drone);	break;
			case 't':		tap(drone);		break;
			case 'space':	jump(drone);	break;
		}
	});
});

let start = NaN;
let delta = 50;
let samples = [];
let calibrationSamples = 30;

module.exports = function (callbacks, wss) {
	// console.log("\nparrot started")

	/* Cortex part */
	// drone.connect(() => drone.postureJumper());
// 	drone.on('ready', () =>
		callbacks.mot.push(data => {
			wss.send(JSON.stringify({action:'right'}))
			
			if(samples.length < calibrationSamples) {
				samples.push(data.mot[MAG_Z])
			} else {
				if(start === NaN) {
					start = samples.reduce((a,b) => a + b) / calibrationSamples;
				}
				if(Math.abs(data.mot[MAG_Z] - start) > delta) {
					if(data.mot[MAG_Z] - start > 0) {
						wss.send(JSON.stringify({action:'right'}))
					} else {
						wss.send(JSON.stringify({action:'left'}))
					}
				} else {
					wss.send(JSON.stringify({action:'close'}))
				}
			}
		})
// 	);

	return drone;
};