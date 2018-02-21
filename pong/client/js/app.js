const actionList = ["neutral", "left", "right"];

let actionIndex = 0;


const learningTime = 10;

const ws = new WebSocket('ws://localhost:3001');
ws.onmessage = (message) => {
	console.log(message.data);
	let receiveStatus;
	if(message.data.includes("start")){
		receiveStatus = 0;
		startTimer();
	}
	if(message.data.includes("accept")){
		receiveStatus = 1;
		actionIndex++;
		document.querySelector("#trainingButton").disabled = false;
		updateTrainingText();
	}
	if(message.data.includes("reject")){
		receiveStatus = 2;
	}

	if(actionIndex == 0){
		console.log("neutral", receiveStatus);
	}
}

function updateTrainingText(){
	document.querySelector("trainingText").innerHTML = actionList[actionIndex];
}

function startTraining(){
	console.log("hello");
	document.querySelector("#trainingButton").disabled = true;
	ws.send(JSON.stringify({ "action" :"training", "trainingAction" : actionList[actionIndex], "status" : "start"}));
}

function startTimer(){
	let timeLeft = learningTime;
	let timerText = document.querySelector("#timer");
	timerText.innerHTML = timeLeft + "";

	let timerInterval = setInterval(() => {
		if(timeLeft >0){
			timeLeft--;
			timerText.innerHTML = timeLeft + "";
		}else{
			clearInterval(timerInterval);

			if (confirm('Do you accept the training?')) {
				ws.send(JSON.stringify({ "action" :"training", "trainingAction" : actionList[actionIndex], "status" : "accept"}));
			} else {
				ws.send(JSON.stringify({ "action" :"training", "trainingAction" : actionList[actionIndex], "status" : "reject"}));
			}
		}
	}, 1000);

}