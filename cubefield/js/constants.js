let fov = 75,
	aspect = window.innerWidth / window.innerHeight,
	near = 0.1,
	far = 1000;

let colors = {
	white: new THREE.Color(0xffffff),
	grey: new THREE.Color(0xaaaaaa),
	green: new THREE.Color(0x00ff00)
};

let materials = {
	field: new THREE.MeshStandardMaterial({ color: colors.grey }),
	cube: new THREE.MeshBasicMaterial({ color: colors.green })
}

let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

let renderer = new THREE.WebGLRenderer();

let light = new THREE.DirectionalLight(colors.white);

let cube = new THREE.Mesh(
	new THREE.BoxGeometry(1, 1, 1),
	materials.cube
);