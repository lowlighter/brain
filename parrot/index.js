let sumo = require('node-sumo');
let drone = sumo.createClient();

let keypress = require('keypress');
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
	setTimeout(() => drone.stop(), 200);
};

let right = drone => {
	drone.right(20);
	setTimeout(() => drone.stop(), 200);
};

let tap = drone => {
	drone.animationsTap();
};

let jump = drone => {
	drone.postureJumper();
	drone.animationsHighJump();
}

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