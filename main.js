var SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,
SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;

var camera, scene, renderer, light, bird;

var mouseX = mouseY = 0;

init();
render();

function init() {
  camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 1000 );
  camera.position.y = 5;
  camera.position.z = 15;

  scene = new THREE.Scene();

  geometry = new Bird();
  material = new THREE.MeshLambertMaterial({
      color: 0x3366ff,
      side: THREE.DoubleSide
      //wireframe: true
      });
  bird = new THREE.Mesh( geometry, material );
  bird.phase = 0;
  scene.add( bird );

  light = new THREE.DirectionalLight( 0xffddcc, 0.5 );
  light.position.set( 0, 55, 10 );
  scene.add( light );
  scene.add( new THREE.AmbientLight( 0x404040 ) );

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xffffff );
  renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
  document.body.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove(event) {
  mouseX = ( event.clientX - SCREEN_WIDTH_HALF );
  mouseY = ( event.clientY - SCREEN_HEIGHT_HALF );
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  bird.geometry.verticesNeedUpdate = true;

  bird.phase = (bird.phase + 0.05) % 62.83; // 20 pi
  flap(bird);
  camera.position.x += ( mouseX - camera.position.x ) * .03;
  camera.position.y += ( - mouseY - camera.position.y ) * .03;
  camera.lookAt( bird.position );
}
