var Boid = function () {

  var _maxSpeed = 0.5,
      _maxAcceleration = 1,
      _worldRadius = 500,
      _glideHeight = 10;
      _visionRadius = 100,
      _maxSteerForce = 0.1,
      _neighborhoodRadius = 100;

  this.position = new THREE.Vector3(0, 10, 0); // initialise position
  this.velocity = new THREE.Vector3(1, 0, 0); // initialise velocity
  this.acceleration = new THREE.Vector3( 0, 0, 0 );

  // boid moves
  this.move = function ( impulse ) {

    if ( impulse ) {
      this.acceleration.add( impulse );
    }

    this.velocity.add( this.acceleration );
    l = this.velocity.length();

    if ( l > _maxSpeed ) {
      this.velocity.divideScalar( l / _maxSpeed );
    }

    this.position.add( this.velocity );
    this.acceleration.set( 0, 0, 0 ); // Need to re-render forces every render loop
    //this.acceleration.divideScalar( 2 ); // Exponential drag

  }

  // Adds impulse vector given target to avoid
  this.avoid = function ( target ) {
    steer = new THREE.Vector3();
    steer.copy( this.position );
    steer.sub( target );
    steer.divideScalar( this.position.distanceToSquared( target ) );
    this.acceleration.add( steer ); // persistent force vector
  }

  // Add impulse force vector to boid
  this.keepBounded = function () {

    radius = _worldRadius; // Manhatten radius
    vector = new THREE.Vector3();

    vector.set( - radius, this.position.y, this.position.z );
    this.avoid( vector );

    vector.set( radius, this.position.y, this.position.z );
    this.avoid( vector );

    //vector.set( this.position.x, 0, this.position.z );
    //this.avoid( vector );

    // Glide above glide height
    if ( this.position.y < _glideHeight ) {
      this.acceleration.y += 0.01 * (_glideHeight - this.position.y);
      if (this.position.y < 0) this.position.y = 0; // no sinking!
    }

    vector.set( this.position.x, radius, this.position.z );
    this.avoid( vector );

    vector.set( this.position.x, this.position.y, - radius );
    this.avoid( vector );

    vector.set( this.position.x, this.position.y, radius );
    this.avoid( vector );
  }

  /*
    Boid Movement
  */
  this.flock = function ( boids ) {
    this.alignment( boids );
    this.cohesion( boids );
    this.separation( boids );
  }

  /* 
    Follows the ALIGNMENT principle of boids
    Steer towards the average heading of local flockmates
  */
  this.alignment = function ( boids ) {

    var boid, velSum = new THREE.Vector3(),
    count = 0;

    for ( var i = 0; i < boids.length; i++ ) {

      if ( Math.random() > 0.6 ) continue;
      boid = boids[ i ];
      distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= _visionRadius ) {
        velSum.add( boid.velocity );
        count++;
      }

    }

    if ( count == 0 ) return;

    velSum.divideScalar( count );

    var l = velSum.length();
    if ( l > _maxSteerForce ) velSum.divideScalar( l / _maxSteerForce );

    this.acceleration.add( velSum );
  }

  /* 
    Follows the COHESION principle of boids
    Steer towards the average position of local flockmates 
  */
  this.cohesion = function ( boids ) {

    var boid, distance,
    posSum = new THREE.Vector3(),
    count = 0;

    for ( var i = 0, il = boids.length; i < il; i ++ ) {
      if ( Math.random() > 0.6 ) continue;
      boid = boids[ i ];
      distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= _neighborhoodRadius ) {
        posSum.add( boid.position );
        count++;
      }
    }

    if ( count == 0 ) return;

    posSum.divideScalar( count );
    posSum.sub( this.position );

    var l = posSum.length();
    if ( l > _maxSteerForce ) posSum.divideScalar( l / _maxSteerForce );

    this.acceleration.add( posSum );
  }

  /*
    Follows the SEPARATION principle of boids
    Steer to avoid crowding local flockmates
  */
  this.separation = function ( boids ) {

    var boid, distance,
    posSum = new THREE.Vector3( 0, 0, 0 ),
    repulse = new THREE.Vector3();

    for ( var i = 0, il = boids.length; i < il; i ++ ) {

      if ( Math.random() > 0.6 ) continue;

      boid = boids[ i ];
      distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= _neighborhoodRadius ) {
        repulse.subVectors( this.position, boid.position );
        repulse.normalize();
        repulse.divideScalar( distance );
        posSum.add( repulse );
      }
    }
    this.acceleration.add( posSum );
  }

}
