let boxes = [];
let length = 80;
let falcon;

let angle = 0.0;
let speed = 0.0;
let acc = 0.007;
let move = false;

function setup() {
  createCanvas(800, 800, WEBGL);
  falcon = new Falcon("./images/falcon.png");
  for(let i = 0; i < length; ++i) {
    boxes[i] = new Box();
    boxes[i].space(i);
  }
}

function draw() {
  background(200);
  rotateX(PI/3);

  push();
  updateAngle();
  fill(255);
  noStroke();
  plane(3 * width, 3 * height)
  boxes.forEach(b => b.update(angle).draw())
  pop();

  falcon.draw();
}

function updateAngle() {
  if(speed == 0) return;

  if(move) {
    angle += abs(angle) < PI/18 ? speed : 0;
  } else {
    if((speed < 0 && angle < 0) || (speed > 0 && angle > 0)) {
      speed = 0;
      angle = 0;
    } else {
      angle += speed;
    }
  }
  
  rotateY(angle);
}

function keyPressed() {
  move = true;
  if(keyCode === 81)
    speed = +acc;
  else if(keyCode === 68)
    speed = -acc;
}

function keyReleased() {
  move = false;
  if(keyCode === 81)
    speed = -acc;
  else if(keyCode === 68)
    speed = +acc;
}