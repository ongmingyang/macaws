function addTerrain ( scene ) {
  // Fog
  scene.fog = new THREE.Fog( 0xffffff, 100 );
  //gridHelper = new THREE.GridHelper( 100, 10 );    
  //scene.add( gridHelper );

  // Light
  light = new THREE.DirectionalLight( 0xffddcc, 1.5 );
  light.position.set( 0, 150, 10 );
  light.castShadow = true;
  //light.shadowCameraVisible = true;
  d = 200;
  light.shadowCameraLeft = -d;
  light.shadowCameraRight = d;
  light.shadowCameraTop = d;
  light.shadowCameraBottom = -d;
  light.shadowCameraFar = 500;
  scene.add( light );
  scene.add( new THREE.AmbientLight( 0x404040 ) );

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

  // Add obstacles
  dv = function () {
    return Math.random() * 100 - 50;
  }
  positions = [
    { x: 80 + dv(), z: 80 + dv() },
    { x: -80 + dv(), z: 80 + dv() },
    { x: 80 + dv(), z: -80 + dv() },
    { x: -80 + dv(), z: -80 + dv() },
    { x: dv(), z: dv() }
    ];

  for ( var i = 0; i < positions.length; i++ ) {
    p = positions[i];
    _height = 100;
    _radius = 4;
    geometry = new THREE.CylinderGeometry( _radius/2, _radius, _height );
    treeTexture = THREE.ImageUtils.loadTexture( 'textures/tree.jpg' );
    material = new THREE.MeshPhongMaterial({ 
        color: 0xffeecc,
        map: treeTexture
        });
    obstacle = new THREE.Mesh( geometry, material );
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;
    obstacle.position.set( p.x, _height/2, p.z );
    obstacle.avoidRadius = _radius;
    obstacles.push( obstacle );
    scene.add( obstacle );
  }

}
