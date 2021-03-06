/*
  Taming Macaws
  Adapted from http://threejs.org/examples/#canvas_geometry_birds
  Available on https://github.com/ongmingyang/macaws

  Ong Ming Yang <me@ongmingyang.com>
  2014
*/

var SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,
TOTAL_BIRDS = 15;

var camera, scene, renderer, light, plane,
    bird, birds, boid, boids, obstacles;

var controls, gridHelper;

// Initialize vectors used in render loop
var centripetal = new THREE.Vector3(),
    home = new THREE.Vector3(),
    origin = new THREE.Vector3( 0, 30, 0 ),
    up = new THREE.Vector3( 0, 1, 0 );

init();
render();

function init() {
  birds = [];
  boids = [];
  obstacles = [];

  // Camera
  camera = new THREE.PerspectiveCamera( 45, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
  camera.position.set( 150, 200, 300 );
  camera.lookAt( 0, 0, 0 );

  // Scene
  scene = new THREE.Scene();

  for ( var i = 0; i < TOTAL_BIRDS; i++ ) {
    // Boids
    boid = boids[i] = new Boid(Math.random()*200-100, Math.random()*50, Math.random()*200-100);

    // Birds
    geometry = new Bird();
    material = new THREE.MeshPhongMaterial({
        color: randomColour(),
        side: THREE.DoubleSide
        //wireframe: true
        });
    bird = birds[i] = new THREE.Mesh( geometry, material );
    bird.castShadow = true;
    bird.receiveShadow = true;
    bird.phase = Math.random() * 62.83;
    scene.add( bird );
  }

  // Add terrain features
  addTerrain( scene );

  // Renderer
  renderer = new THREE.WebGLRenderer({
      antialias: true
      });
  renderer.setClearColor( 0xffffff );
  renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
  renderer.shadowMapEnabled = true;
  document.body.appendChild( renderer.domElement );

  // Browser controls
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.minDistance = 100;
  controls.maxDistance = 800;
  controls.maxPolarAngle = Math.PI / 2 - 0.1;
  controls.noKeys = true;
  controls.noPan = true;
  window.addEventListener( 'resize', onWindowResize, false );

}

function randomColour() {
  switch (Math.ceil(Math.random()*4)) {
    case 1:
      return 0x3366ff;
      break;
    case 2:
      return 0x66ff33;
      break;
    case 3:
      return 0xff6633;
      break;
    default:
      return 0x6633ff;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);

  // Render birds
  for ( var i = 0; i < birds.length; i++ ) {
    boid = boids[i];

    // Creates clockwise motion instinct
    centripetal.crossVectors( boid.velocity, up );
    centripetal.divideScalar(100);

    // Creates homing instinct
    home.subVectors( origin, boid.position );
    home.divideScalar( 50000 );

    // Add boid forces
    boid.keepBounded();
    boid.flock( boids );
    for ( var j = 0; j < obstacles.length; j++ ) {
      boid.repulse( obstacles[j] );
    }
    boid.acceleration.add( centripetal );
    boid.acceleration.add( home );

    bird = birds[i];
    bird.geometry.verticesNeedUpdate = true;
    bird.phase = (bird.phase + 0.1) % 62.83; // 20 pi

    // Compute movements
    orientate( bird, boid );
    boid.move();
    flap(bird);
  }
}
