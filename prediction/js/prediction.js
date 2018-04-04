const ws = new WebSocket(`ws://${(window.location.href.match(/\d+\.\d+\.\d+\.\d+/)||["localhost"])[0]}:3001`)

const model = new KerasJS.Model({
	filepath: './res/models/model_correct.bin',
	filesystem: false,
	gpu: true
})

let network = {
	input: null,
	output: null
}

ws.onmessage = event => {
	const data = JSON.parse(event.data)
	const type = data.shift()
	const headset = data.shift()

	if (type === "pow") {
		network.input = Array.from(data)
		
		model.ready().then(() => {
			return model.predict({
				input: Float32Array.from(network.input)
			})
		}).then(outputData => {
			network.output = Array.from(outputData.output)
		}).catch(err => {
			console.log(err)
		})

		if(network.output !== null) {
			let map = new Map()
			Array
				.from(network.output)
				.sort((a, b) => a - b)
				.forEach(data => {
					map.set(network.output.indexOf(data), data)
				})
			dataArray.shift()
			dataArray.push(Array.from(map.keys()).reverse())

			network.output = null
		}
	}
}