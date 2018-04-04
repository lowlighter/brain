class Falcon {
  constructor(filename) {
    this.img = loadImage(filename);
  }

  draw() {
    push()
    fill(0, 0, 0, 0)
    texture(this.img)

    translate(0, 375, 80)
    rotateX(-PI/12)
    
    plane(90, 60)
    pop()
  }
}