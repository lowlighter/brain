let w = 50.0;
let h = 50.0;
let d = 5.0;

let s = 15.0;

class Box {
	constructor() {
		this.init();
	}

	init() {
		this.x = 2 * random(-width, width);
		this.y = 1.5 * -height;
		this.z = h/2;
		this.c = random(5, 40);
	}

	space(id) {
		this.y -= (id / 3) * 100
	}

	draw() {
		if(this.y < -1.5 * height) return;

		push();
		translate(this.x, this.y, this.z);
		rotateX(-PI/3);

		colorMode(HSB, 255);
		fill(this.c, 255, 255);
		stroke(0);

		box(w, h, d);
		pop();
	}

	update(angle) {
		this.x += angle * 5 * s;
		this.y += s;

		if (this.y > height)
		this.init();

		return this;
	}
}
