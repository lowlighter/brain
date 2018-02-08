
var camera, scene, renderer;
var dice, eye1, eye2, mouth, brow1, brow2;
var t_brow_L, t_brow_R, t_eye_L, t_eye_R, t_eye_L_closed, t_eye_R_closed, t_mouth, t_mouth_open
var face, head;
var ts;

function init(){
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
	texture = new THREE.TextureLoader().load( 'brow_L.png' );
  t_brow_L =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'brow_R.png' );
  t_brow_R =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'eye_L.png' );
  t_eye_L =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'eye_R.png' );
  t_eye_R =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'eye_L_closed.png' );
  t_eye_L_closed =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'eye_R_closed.png' );
  t_eye_R_closed =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'mouth.png' );
  t_mouth =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
	texture = new THREE.TextureLoader().load( 'mouth_open.png' );
  t_mouth_open =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );

	// Floor
	let rectangle = new THREE.PlaneGeometry(10, 10);
	let material = new THREE.MeshBasicMaterial( {color: 0x555555, side: THREE.DoubleSide} );
	let plane = new THREE.Mesh( rectangle, material );
	scene.add( plane );

	// Dice
	let cube = new THREE.BoxGeometry( 1, 1, 1 );
	materials = [
    new THREE.MeshBasicMaterial( { color : 0xCC0066 } ),
    new THREE.MeshBasicMaterial( { color : 0xCC0066 } ),
		new THREE.MeshBasicMaterial( { color : 0xFF3399 } ),
		new THREE.MeshBasicMaterial( { color : 0xFF007F } ),
		new THREE.MeshBasicMaterial( { color : 0xFF007F } ),
		new THREE.MeshBasicMaterial( { color : 0xFF3399 } ),
	]
	dice = new THREE.Mesh( cube, materials );

  // Eyes
  rectangle  = new THREE.PlaneGeometry(0.3, 0.3);
  //material = new THREE.MeshBasicMaterial( {color: 0x55AEFF} );
  eye1 = new THREE.Mesh( rectangle, t_eye_L );
  //material = new THREE.MeshBasicMaterial( {color: 0xFFAE55} );
  eye2 = new THREE.Mesh( rectangle, t_eye_R );
  eye1.position.x += 0.2;
  eye2.position.x -= 0.2;

  // Mouth
  rectangle  = new THREE.PlaneGeometry(0.3, 0.1);
  //material = new THREE.MeshBasicMaterial( {color: 0xAE55FF} );
  mouth = new THREE.Mesh( rectangle, t_mouth );
  mouth.position.y -= 0.3

  // Brows
  rectangle  = new THREE.PlaneGeometry(0.3, 0.1);
  //material = new THREE.MeshBasicMaterial( {color: 0x5555CC} );
  brow1 = new THREE.Mesh( rectangle, t_brow_L );
  //material = new THREE.MeshBasicMaterial( {color: 0xCC5555} );
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

	// Events
	window.addEventListener( 'resize', onWindowResize, false );
}

// Render
function animate() {
  ts = Math.round( (new Date).getTime()/1000 *100 )/100;
	requestAnimationFrame( animate );
  // ---
  standbyAnimation();
  turnHeadZ( Math.sin(ts) * Math.cos(ts)/2 );
  turnHeadY( Math.sin(ts/3)/2 );
  // ---
	cameraAnimation();
	renderer.render( scene, camera );
}

// Animations
function standbyAnimation(){ head.position.y = Math.sin(ts)/3; }
function closeLeftEye(){ eye2.material = t_eye_L_closed; }
function closeRightEye(){	eye1.material = t_eye_R_closed;	}
function closeEyes(){ closeLeftEye(); closeRightEye(); }
function smile(){ mouth.material = t_mouth; }
function openMouth(){ mouth.material = t_mouth_open; }
function upLeftBrow(){ brow1.position.y = 0.35; }
function upRightBrow(){ brow2.position.y = 0.35; }
function upBrows(){ upLeftBrow(); upRightBrow(); }
function downLeftBrow(){ brow1.position.y = 0.25; }
function downRightBrow(){ brow2.position.y = 0.25; }
function downBrows(){ downLeftBrow(); downRightBrows(); }
function angryLeftBrow(){ brow1.rotation.z = 0.5; }
function angryRightBrow(){ brow2.rotation.z = -0.5; }
function angryBrows(){ angryLeftBrow(); angryRightBrow(); }
function calmLeftBrow(){ brow1.rotation.z = 0; }
function calmRightBrow(){ brow2.rotation.z = 0; }
function calmBrows(){ calmLeftBrow(); calmRightBrow(); }
function cameraAnimation(){	}

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
