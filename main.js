var SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,
SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;

var camera, scene, renderer, light, plane,
    bird, birds, boid, boids;

var controls, gridHelper;

var mouseX = mouseY = 0;

init();
render();

function init() {
  // Camera
  camera = new THREE.PerspectiveCamera( 45, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
  camera.position.set( 250, 200, 250 );
  camera.lookAt( 0, 0, 0 );

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0xffffff, 100 );
  //gridHelper = new THREE.GridHelper( 100, 10 );    
  //scene.add( gridHelper );

  birds = [];
  boids = [];

  for ( var i = 0; i < 15; i++ ) {
    // Boids
    boid = boids[i] = new Boid(Math.random()*200-100, Math.random()*50, Math.random()*200-100);

    // Birds
    geometry = new Bird();
    material = new THREE.MeshLambertMaterial({
        color: randomColour(),
        side: THREE.DoubleSide
        //wireframe: true
        });
    bird = birds[i] = new THREE.Mesh( geometry, material );
    bird.castShadow = true;
    bird.phase = Math.random() * 62.83;
    scene.add( bird );
  }

  // Ground texture
  plane = new THREE.PlaneGeometry( 20000, 20000 );
  groundTexture = THREE.ImageUtils.loadTexture( 'textures/grass.jpg' );
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set( 25, 25 );
  groundTexture.anisotropy = 16;
  groundMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x335533, 
      specular: 0x111111,
      map: groundTexture 
      });
  planeMesh = new THREE.Mesh( plane, groundMaterial );
  planeMesh.rotation.x = - Math.PI / 2;
  planeMesh.scale.set( 0.1, 0.1, 0.1 );
  planeMesh.receiveShadow = true;
  scene.add( planeMesh );

  // Light
  light = new THREE.DirectionalLight( 0xffddcc, 1.5 );
  light.position.set( 0, 150, 10 );
  light.castShadow = true;
  light.shadowCameraVisible = true;
  d = 200;
  light.shadowCameraLeft = -d;
  light.shadowCameraRight = d;
  light.shadowCameraTop = d;
  light.shadowCameraBottom = -d;
  light.shadowCameraFar = 500;
  scene.add( light );
  scene.add( new THREE.AmbientLight( 0x404040 ) );

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
  window.addEventListener( 'resize', onWindowResize, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

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

function onDocumentMouseMove(event) {
  mouseX = ( event.clientX - SCREEN_WIDTH_HALF );
  mouseY = ( event.clientY - SCREEN_HEIGHT_HALF );
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);

  // Render birds
  for ( var i = 0; i < birds.length; i++ ) {
    boid = boids[i];
    centripetal = new THREE.Vector3();
    centripetal.crossVectors( boid.velocity, new THREE.Vector3( 0, 1, 0 ) );
    centripetal.divideScalar(100);

    // Add boid forces
    boid.keepBounded();
    boid.flock( boids );
    boid.acceleration.add( centripetal );

    bird = birds[i];
    bird.geometry.verticesNeedUpdate = true;
    bird.phase = (bird.phase + 0.1) % 62.83; // 20 pi

    // Compute movements
    orientate( bird, boid );
    boid.move();
    flap(bird);
  }

  // Render camera
  /*
  camera.position.x += ( mouseX - camera.position.x ) * .03;
  camera.position.y += ( - mouseY - camera.position.y ) * .03;
  camera.lookAt( bird.position );
  */
}
