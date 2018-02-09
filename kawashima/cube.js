// Model
var camera, scene, renderer, lights;
var dice, eye1, eye2, mouth, brow1, brow2;
var t_brow_L, t_brow_R, t_eye_L, t_eye_R, t_eye_L_closed, t_eye_R_closed, t_mouth, t_mouth_open;
var face, head;
var ts;
let counter = 0;

// Connection
const ws = new WebSocket('ws://localhost:3001');
ws.onmessage = event => {
	//console.log(event.data)
	counter = 100
	const data = JSON.parse(event.data)
	const type = data.shift()
	if (type === "getId") {
		console.log(data)
	}
	if (type === 'fac') {
		//0 yeux, 1 sourcil, 2 score sourcils, 3-4 bouche
		//console.log(data)
	}
	if (type === 'mot'){

		//3 premiers gyro Accel Magneto
		let magneto = data.slice(-3);
		//console.log(magneto)
		let tab_y = magneto[2];
		console.log(map(tab_y, 0, 16000, 0, 2 * Math.PI));
	}
}
ws.onopen = () => {
	ws.send(JSON.stringify({
		action:"setId",
		id:Math.floor(Date.now()*10000*Math.random())
	}))
	ws.send(JSON.stringify({
		action:"kawashimaStart"
	}))
}

function map(x, a, b, A, B){
	return ((x-a)/(b-a)) * (B-A) + A;
}

function init(){
	console.log(ws);

	scene = new THREE.Scene();

	// Camera
	let fov = 75;
	let aspect = window.innerWidth / window.innerHeight;
	let near = 0.1;
	let far = 1000;
	camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.z = 8;

	// Renderer
	renderer = new THREE.WebGLRenderer({alpha: true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// Textures
	let texture;
	texture = new THREE.TextureLoader().load( 'res/brow_L.png' );
  t_brow_L =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'res/brow_R.png' );
  t_brow_R =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'res/eye_L.png' );
  t_eye_L =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'res/eye_R.png' );
  t_eye_R =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'res/eye_L_closed.png' );
  t_eye_L_closed =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'res/eye_R_closed.png' );
  t_eye_R_closed =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'res/mouth.png' );
  t_mouth =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'res/mouth_open.png' );
  t_mouth_open =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'res/mouth_L_rictus.png' );
  t_mouth_rictus_L =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'res/mouth_R_rictus.png' );
  t_mouth_rictus_R =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );

	// Floor
	let rectangle = new THREE.PlaneGeometry(10, 10);
	let material = new THREE.MeshLambertMaterial( {color: 0x555555, side: THREE.DoubleSide} );
	let plane = new THREE.Mesh( rectangle, material );
	scene.add( plane );

	// Dice
	let cube = new THREE.BoxGeometry( 1, 1, 1 );
	material = new THREE.MeshLambertMaterial( { color : 0xCC0066 } )
	dice = new THREE.Mesh( cube, material );

  // Eyes
  rectangle  = new THREE.PlaneGeometry(0.3, 0.3);
  eye1 = new THREE.Mesh( rectangle, t_eye_L );
  eye2 = new THREE.Mesh( rectangle, t_eye_R );
  eye1.position.x += 0.2;
  eye2.position.x -= 0.2;

  // Mouth
  rectangle  = new THREE.PlaneGeometry(0.3, 0.1);
  mouth = new THREE.Mesh( rectangle, t_mouth );
  mouth.position.y -= 0.3

  // Brows
  rectangle  = new THREE.PlaneGeometry(0.3, 0.1);
  brow1 = new THREE.Mesh( rectangle, t_brow_L );
  brow2 = new THREE.Mesh( rectangle, t_brow_R );
  brow1.position.x += 0.2;
  brow1.position.y += 0.25;
  brow2.position.x -= 0.2;
  brow2.position.y += 0.25;

  // Face
  face = new THREE.Group();
  face.add(eye1);
  face.add(eye2);
  face.add(mouth);
  face.add(brow1);
  face.add(brow2);
  face.position.z = 1/2 + 0.1;

  // Head
  head = new THREE.Group();
  head.add(face);
  head.add(dice);
  head.position.z = plane.position.z + 3;
  scene.add(head)


	// Light
	var sphere = new THREE.SphereGeometry( 0.1, 16, 8 );
	lights = new THREE.Group();

	let light1 = new THREE.PointLight(0xffffff, 1, 30);
	let light2 = new THREE.PointLight(0xffffff, 0.9, 30);
	let light3 = new THREE.PointLight(0xffffff, 0.9, 30);
	let light4 = new THREE.PointLight(0xffffff, 0.6, 30);
	let light5 = new THREE.PointLight(0xffffff, 0.6, 30);

	/*
	light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x00ff40 } ) ) );
	light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
	light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x4000ff } ) ) );
	light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x40ffff } ) ) );
	light5.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff00ff } ) ) );
	*/

	light1.position.set(camera.position.x, camera.position.y - 1.5, camera.position.z - 2);
	light2.position.set(camera.position.x + 2, camera.position.y + 1, head.position.z);
	light3.position.set(camera.position.x - 2, camera.position.y + 1, head.position.z );
	light4.position.set(camera.position.x - 2, camera.position.y + 2, camera.position.z - 2);
	light5.position.set(camera.position.x + 2, camera.position.y + 2, camera.position.z - 2);

	lights.add(light1);
	lights.add(light2);
	lights.add(light3);
	lights.add(light4);
	lights.add(light5);
	scene.add(lights);

	// Events
	window.addEventListener( 'resize', onWindowResize, false );
}

// Render
function animate() {
  ts = Math.round( (new Date).getTime()/1000 *100 )/100;
	requestAnimationFrame( animate );
	// Sleep mode
	if ( counter < 1 && counter != -10 ){ sleep(); counter = -10; }
	else{if ( counter != -10 ){ counter -= 1; }	}
	if( counter < 1 ){
	  turnHeadZ( Math.sin(ts) * Math.cos(ts)/2 );
	  turnHeadY( Math.sin(ts/3)/2 );
	}
  // ---
  standbyAnimation();
  // ---
	cameraAnimation();
	renderer.render( scene, camera );
}

// Animations
function standbyAnimation(){ head.position.y = Math.sin(ts)/3; }
function closeLeftEye(){ eye2.material = t_eye_R_closed; }
function closeRightEye(){	eye1.material = t_eye_L_closed;	}
function closeEyes(){ closeLeftEye(); closeRightEye(); }
function openLeftEye(){ eye2.material = t_eye_R; }
function openRightEye(){	eye1.material = t_eye_L;	}
function openEyes(){ openLeftEye(); openRightEye(); }
function smile(){ mouth.material = t_mouth; }
function openMouth(){ mouth.material = t_mouth_open; }
function rictusLeft(){  mouth.material = t_mouth_rictus_L; }
function rictusRight(){  mouth.material = t_mouth_rictus_R; }
function upLeftBrow(){ brow1.position.y = 0.35; }
function upRightBrow(){ brow2.position.y = 0.35; }
function upBrows(){ upLeftBrow(); upRightBrow(); }
function downLeftBrow(){ brow1.position.y = 0.25; }
function downRightBrow(){ brow2.position.y = 0.25; }
function downBrows(){ downLeftBrow(); downRightBrow(); }
function angryLeftBrow(){ brow1.rotation.z = 0.5; }
function angryRightBrow(){ brow2.rotation.z = -0.5; }
function angryBrows(){ angryLeftBrow(); angryRightBrow(); }
function calmLeftBrow(){ brow1.rotation.z = 0; }
function calmRightBrow(){ brow2.rotation.z = 0; }
function calmBrows(){ calmLeftBrow(); calmRightBrow(); }
function cameraAnimation(){}

function sleep(){
	closeEyes();
	downBrows();
	openMouth();
	dice.material =  new THREE.MeshLambertMaterial( { color : 0x9999CC } )
}
function awake(){
	openEyes();
	downBrows();
	smile();
	dice.material = new THREE.MeshLambertMaterial( { color : 0xCC0066 } )
}

// Head orientation
function turnHeadZ( value ){ head.rotation.y = value; }
function turnHeadY(value){ head.rotation.x = value; }

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

// main
init();
animate();
