const actionList = ["neutral", "push", "pull", "left", "right"];

let actionIndex = 0;
let timerInterval;

const learningTime = 8;
let timerText;

let isTraining = false


const ws = new WebSocket(`ws://${(window.location.href.match(/\d+\.\d+\.\d+\.\d+/)||["localhost"])[0]}:3001`)

function annimate(action, percent){
	let ball = document.querySelector(".ball");
	if(percent != undefined){
		if(action == "pull"){
			let startScale = 2
			let startTranslate = -27
			let stopScale = 1
			let stopTranslate = 0
			let currentScale = (startScale-stopScale)*percent + stopScale
			let currentTranslate = startTranslate * percent
			ball.style.transform = "scale(" + currentScale + ") translateY(" + currentTranslate + "%)"

		}
		if(action == "push"){
			let startScale = 1
			let startTranslate = 0
			let stopScale = 2
			let stopTranslate = -27
			let currentScale = (stopScale-startScale)*percent + startScale
			let currentTranslate = stopTranslate * percent
			ball.style.transform = "scale(" + currentScale + ") translateY(" + currentTranslate + "%)"
		}

		if(action == "left"){
			let startX = 50;
			let currentX = percent * startX + startX;
			ball.style.right = currentX + "vw"
		}

		if(action == "right"){
			let startX = 50;
			let currentX = (1-percent) * startX;
			ball.style.right = currentX + "vw"
		}
	}else{
		ball.className = "ball " + action;
	}
}


function createTable(){
	let trainingTable = document.querySelector(".training-table")
	let table = "<table class='table table-stripped'><thead><tr><th>Action</th><th>Start</th><th>Reset</th></tr></thead>"

	for (let i = 0; i < actionList.length; i++){
		table += "<tr><th>";
		table += actionList[i];
		table += "</th><th>";
		table += "<button onClick=startTraining(" + i + ")>Start</button>"+"<th><button onClick=resetTraining(" + i + ")>Reset</button>"
		table += "</th></tr>"
	}

	table+="</table>"
	trainingTable.innerHTML = table
}

$(document).ready(function (){
	createTable();
});

ws.onmessage = (message) => {
	const data = JSON.parse(message.data)
	const type = data.shift()
	const headset = data.shift()
	if(type == "com"){
		document.querySelector("#trainResult").innerHTML = data[0]
		document.querySelector("#trainPourcentage").innerHTML = data[1]
		if(!isTraining){
			annimate(data[0], data[1])
		}
	}
	if(type == "sys"){
		console.log(data)
		let receiveStatus;
		if(data[1].includes("MC_Started")){
			receiveStatus = 0;
			annimate(actionList[actionIndex])
			startTimer();
		}
		if(data[1].includes("MC_Succeeded")){
			clearInterval(timerInterval);
			annimate("neutral")
			isTraining = false;
			if (confirm('Do you accept the training?')) {
				ws.send(JSON.stringify({ "action" :"training", "trainingAction" : actionList[actionIndex], "status" : "accept"}));
			} else {
				ws.send(JSON.stringify({ "action" :"training", "trainingAction" : actionList[actionIndex], "status" : "reject"}));
			}
		}
		if(data[1].includes("MC_Completed")){
			receiveStatus = 1;
			updateTrainingText();
		}
		if(data[1].includes("MC_Failed")){
			alert("training failed");
			receiveStatus = 2;
		}

		if(actionIndex == 0){
			console.log("neutral", receiveStatus);
		}
	}
}

function updateTrainingText(){
	document.querySelector("#trainedAction").innerHTML = actionList[actionIndex];
}

function startTraining(index){
	actionIndex = index;
	updateTrainingText();
	ws.send(JSON.stringify({ "action" :"training", "trainingAction" : actionList[index], "status" : "start"}));

}

function resetTraining(index){
	actionIndex = index;
	ws.send(JSON.stringify({ "action" :"training", "trainingAction" : actionList[index], "status" : "reset"}));

}


function startTimer(){
	let timeLeft = learningTime;
	isTraining = true;
	timerText = document.querySelector("#timer");
	timerText.innerHTML = timeLeft + "";

	timerInterval = setInterval(() => {
		if(timeLeft >0){
			timeLeft--;
			timerText.innerHTML = timeLeft + "";
		}else{
			clearInterval(timerInterval);
		}
	}, 1000);

}
