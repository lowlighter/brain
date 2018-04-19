let falcon;
let boxes = [];
let box_number = 40;

let angle = 0.0;
let speed = 0.0;
let acc = 0.007;
let move = false;
let direction = ""

function setup() {
  createCanvas(800, 800, WEBGL);
  falcon = new Falcon("./images/falcon.png");
  for(let i = 0; i < box_number; ++i) {
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
    angle += speed
    if(abs(angle) > PI/18)
      angle = angle < 0 ? -PI/18 : PI/18
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

function replace(change) {
  move = false
  if(change !== null)
    direction = change
  if(direction === "left") { // Left
    speed = speed > 0 ? -1.5 * acc : -acc;
  } else if(direction === "right") { // Right
    speed = speed < 0 ? +1.5 * acc : +acc;
  }
}

function move_left() {
  move = true
  direction = "left"
  speed = speed < 0 ? +1.5 * acc : +acc;
}

function move_right() {
  move = true
  direction = "right"
  speed = speed > 0 ? -1.5 * acc : -acc;
}

function keyPressed() {
  if(keyCode === 81) { // Left
    if(direction === "right")
      replace("left")
    move_left()
  } else if(keyCode === 68) { // Right
    if(direction === "left")
      replace("right")
    move_right()
  }
}

function keyReleased() {
  if( (keyCode === 81 && direction === "left")
    ||(keyCode === 68 && direction === "right"))
    replace(null)
}