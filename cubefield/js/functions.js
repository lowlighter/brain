let buildGeometry = (v1, v2, v3) => {
	let geometry = new THREE.Geometry();
	geometry.vertices.push(v1, v2, v3);
	geometry.faces.push(
		new THREE.Face3(0,1,2,
			new THREE.Vector3(0,1,0),
			new THREE.Color(0xffaa00),
			0
		)
	);
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	return geometry;
};

let animate = () => {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
};