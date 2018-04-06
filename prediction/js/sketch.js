let dataArray = []

function setup() {
	createCanvas(600, 120)
	background(255)

	for(let i = 0; i < width/20; ++i) {
		dataArray.push([])
		stroke(0)
		line(width/20 * (i+1), 3, width/20 * (i+1), 17)
	}

	noStroke()
}

function draw() {
	for (let i = 0; i < dataArray.length; ++i) {
		for (let j = 0; j < dataArray[i].length; ++j) {
			if(dataArray[i][j] === [])
				continue

			fill(["red", "orange", "yellow", "green", "blue"][dataArray[i][j]])
			rect(i * height/6, j * height/6 + 20, height/6, height/6)
		}
	}
}