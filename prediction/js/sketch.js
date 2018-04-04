let dataArray = []

function setup() {
	createCanvas(600, 100)
	background(255)
	noStroke()
	
	for(let i = 0; i < width/20; ++i)
		dataArray.push([])
}

function draw() {
	for (let i = 0; i < dataArray.length; ++i) {
		for (let j = 0; j < dataArray[i].length; ++j) {
			if(dataArray[i][j] === [])
				continue

			fill(["red", "orange", "yellow", "green", "blue"][dataArray[i][j]])
			rect(i * height/5, j * height/5, height/5, height/5)
		}
	}
}