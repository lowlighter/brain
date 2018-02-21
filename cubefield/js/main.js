scene.background = new THREE.Color(0xeeeeee);

camera.position.set(0, 1, 5);
camera.rotation.x -= 0.3;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(light);
scene.add(cube);

scene.add(new THREE.Mesh(buildGeometry(
	new THREE.Vector3(-150,-1,-100),
	new THREE.Vector3(-3,-1,4),
	new THREE.Vector3(150,-1,-100)
), materials.field));
scene.add(new THREE.Mesh(buildGeometry(
	new THREE.Vector3(-3,-1,4),
	new THREE.Vector3(3,-1,4),
	new THREE.Vector3(150,-1,-100)
), materials.field));

animate();