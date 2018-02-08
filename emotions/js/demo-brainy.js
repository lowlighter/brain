// globals
var camera, scene, renderer;
var dice, eye1, eye2, mouth, brow1, brow2;
var face, head;

function init(){
  scene = new THREE.Scene();

  // Camera
  let canvas_size = {width:500, height:300};
  let fov = 75;
  let aspect = canvas_size.width / canvas_size.height
  let near = 0.1;
  let far = 1000;
  camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.z = 5;

  // Renderer
  renderer = new THREE.WebGLRenderer({alpha: true});
  renderer.setSize(canvas_size.width , canvas_size.height );
  document.getElementById("brainy").appendChild( renderer.domElement );

  // Floor
  let rectangle = new THREE.PlaneGeometry(10, 10);
  let material = new THREE.MeshBasicMaterial( {color: 0x555555, side: THREE.DoubleSide} );
  let plane = new THREE.Mesh( rectangle, material );
  //scene.add( plane );

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
  let texture = new THREE.TextureLoader().load( '../res/eye_L.png' );
  material =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
  eye1 = new THREE.Mesh( rectangle, material );
  //material = new THREE.MeshBasicMaterial( {color: 0xFFAE55} );
  texture = new THREE.TextureLoader().load( '../res/eye_R.png' );
  material =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
  eye2 = new THREE.Mesh( rectangle, material );
  eye1.position.x += 0.2;
  eye2.position.x -= 0.2;

  // Mouth
  rectangle  = new THREE.PlaneGeometry(0.3, 0.1);
  //material = new THREE.MeshBasicMaterial( {color: 0xAE55FF} );
  texture = new THREE.TextureLoader().load( '../res/mouth.png' );
  material =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
  mouth = new THREE.Mesh( rectangle, material );
  mouth.position.y -= 0.3

  // Brows
  rectangle  = new THREE.PlaneGeometry(0.3, 0.1);
  //material = new THREE.MeshBasicMaterial( {color: 0x5555CC} );
  texture = new THREE.TextureLoader().load( '../res/brow_L.png' );
  material =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
  brow1 = new THREE.Mesh( rectangle, material );
  //material = new THREE.MeshBasicMaterial( {color: 0xCC5555} );
  texture = new THREE.TextureLoader().load( '../res/brow_R.png' );
  material =  new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
  brow2 = new THREE.Mesh( rectangle, material );
  brow1.position.x += 0.2
  brow1.position.y += 0.25
  brow2.position.x -= 0.2
  brow2.position.y += 0.25

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
  //window.addEventListener( 'resize', onWindowResize, false );
}

// Render
var ts;
function animate() {
  ts = Math.round((new Date).getTime()/1000 *100)/100;
  requestAnimationFrame( animate );
  // ---
  standbyAnimation();
  turnHeadZ(Math.sin(ts) * Math.cos(ts)/2);
  turnHeadY(Math.sin(ts/3)/2);
  // ---
  cameraAnimation();
  renderer.render( scene, camera );
}

// Animations
function standbyAnimation(){
  head.position.y = Math.sin(ts)/3;
}

function cameraAnimation(){
}

// Head orientation
function turnHeadZ(value){
  head.rotation.y = value;
}

function turnHeadY(value){
  head.rotation.x = value;
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

// main
init();
animate();
