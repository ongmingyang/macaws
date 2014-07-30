var Bird = function () {

  var scope = this;

  THREE.Geometry.call( this );

  // Body (0-4)
  v(   5,   0,   0 );
  v( - 3, - 1,   0.5 );
  v( - 5,   0,   0 );
  v( - 3, - 1, - 0.5 );
  v(   3,   0.5,   0 );

  // Wings (5-10)
  v(   0,   2, - 6 );
  v(   0,   2,   6 );
  v(   2,   0,   0 );
  v( - 3,   0,   0 );
  v(   1,   1, - 3 );
  v(   1,   1,   3 );

  // Tail (11-13)
  v( - 8,   0.5,   1 );
  v( - 9,   1,   0 );
  v( - 8,   0.5,   -1 );

  // Body
  f3( 0, 2, 1 );
  f3( 0, 3, 2 );
  f3( 0, 4, 2 );
  f3( 0, 8, 2 );

  // Wings
  f3( 8, 9, 7 );
  f3( 5, 8, 9 );
  f3( 6, 10, 8 );
  f3( 10, 7, 8 );

  // Tail
  f3( 11, 8, 12);
  f3( 12, 8, 13);
  f3( 2, 8, 12 );

  this.computeFaceNormals();

  function v( x, y, z ) {

    scope.vertices.push( new THREE.Vector3( x, y, z ) );

  }

  function f3( a, b, c ) {

    scope.faces.push( new THREE.Face3( a, b, c ) );

  }

}

Bird.prototype = Object.create( THREE.Geometry.prototype );

function flap( bird ) {

  phase = bird.phase

  function sign(x) {
    return x && x / Math.abs( x );
  }

  h = Math.sin( phase );
  w = Math.cos( phase );
  lag = Math.sin( phase - 1 );
  lagw = Math.cos( phase - 0.3 );

  if (sign(lagw) < 0) {
    bird.geometry.vertices[ 5 ].z = lagw * 3 - 6;
    bird.geometry.vertices[ 6 ].z = - lagw * 3 + 6;
  } else {
    bird.geometry.vertices[ 5 ].z = lagw * 1 - 6;
    bird.geometry.vertices[ 6 ].z = - lagw * 1 + 6;
  }

  bird.geometry.vertices[ 9 ].z = w * 1 - 3;
  bird.geometry.vertices[ 10 ].z = - w * 1 + 3;

  bird.geometry.vertices[ 9 ].x = bird.geometry.vertices[ 10 ].x = w * 1 + 2;
  bird.geometry.vertices[ 9 ].x = bird.geometry.vertices[ 10 ].x = lagw * 1 + 2;

  if (sign(h) > 0) {
    bird.geometry.vertices[ 9 ].y = bird.geometry.vertices[ 10 ].y = h * 4;
  } else {
    bird.geometry.vertices[ 9 ].y = bird.geometry.vertices[ 10 ].y =  h * 3;
  }

  if (sign(lag) > 0) {
    bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 6 ].y = lag * 5 + 1;
  } else {
    bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 6 ].y = lag * 6 + 1;
  }

  // Bird butt movement
  bird.geometry.vertices[ 8 ].y = - h * 0.3;
  bird.geometry.vertices[ 2 ].y = - h * 0.2;
  bird.geometry.vertices[ 12 ].y = h * 0.25;
  bird.geometry.vertices[ 11 ].y = bird.geometry.vertices[ 13 ].y = - lagw * 0.15;
  bird.geometry.vertices[ 1 ].y = bird.geometry.vertices[ 3 ].y = - h * 0.2 - 1;

}
