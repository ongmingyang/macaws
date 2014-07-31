var Boid = function (x,y,z) {

  var _maxSpeed = 0.5,
      _maxAcceleration = 0.5;
      _worldRadius = 300,
      _glideHeight = 20;
      _visionRadius = 80,
      _maxAlignmentForce = 0.05,
      _maxCohesionForce = 0.1,
      _neighborhoodRadius = 100,
      _memoryIters = 40;
      _birdWeight = 0.01;

  this.position = new THREE.Vector3(x,y,z); // initialise position
  this.velocity = new THREE.Vector3(1, 0, 0); // initialise velocity
  this.acceleration = new THREE.Vector3( 0, 0, 0 ); // initialise acceleration

  var oldVelocities = [];
  var oldBanks = [];
  // Compute average values for smoother animation
  for ( i = 0; i < _memoryIters; i++ ) {
    oldVelocities.push( this.velocity.clone() );
    oldBanks.push( 0 ); // Bank angle
  }
  this.averageVelocity = this.velocity.clone(); 
  this.averageBank = 0;

  // boid moves
  this.move = function () {

    this.velocity.add( this.acceleration );

    l = this.velocity.length();
    if ( l > _maxSpeed ) {
      this.velocity.divideScalar( l / _maxSpeed );
    }

    this.position.add( this.velocity );

    // Compute average velocities and banks for orientation code
    oldVelocities.push( this.velocity.clone() );
    this.averageVelocity.multiplyScalar( _memoryIters );
    this.averageVelocity.add( this.velocity );
    this.averageVelocity.sub( oldVelocities.shift() );
    this.averageVelocity.divideScalar( _memoryIters );

    l = this.acceleration.length();
    if ( l > _maxAcceleration ) {
      this.acceleration.divideScalar( l / _maxAcceleration );
    }

    centripetal_vector = new THREE.Vector3();
    centripetal_vector.crossVectors( this.averageVelocity, new THREE.Vector3( 0, 1, 0 ) );
    centripetal_vector.normalize();
    centrifugal_scalar = this.acceleration.dot( centripetal_vector );
    oldBanks.push( Math.atan2( centrifugal_scalar, _birdWeight ) );
    oldBanks.shift();

    for ( var i = 0; i < oldBanks.length; i++ ) {
      this.averageBank += oldBanks[i];
    }
    this.averageBank = this.averageBank / oldBanks.length;

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

  // Adds impulse vector given obstacle within half sight 
  // TODO: all obstacles are trees, so calculate 2D distance
  this.repulse = function ( target ) {
    proj_target = target.position.clone().projectOnPlane( new THREE.Vector3( 0, 1, 0 ) );
    proj_this = this.position.clone().projectOnPlane( new THREE.Vector3( 0, 1, 0 ) );
    distance = proj_this.distanceTo( proj_target );

    if ( distance < _visionRadius / 2 ) {
      steer = new THREE.Vector3();
      steer.subVectors( proj_this, proj_target );
      steer.divideScalar( 2 * distance * distance );
      this.acceleration.add( steer );
    }

    if ('avoidRadius' in target) {
      if ( distance < target.avoidRadius + 5 ) {
        steer = new THREE.Vector3();
        steer.subVectors( proj_this, proj_target );
        this.acceleration.add( steer );
      }
    }
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
    if ( l > _maxAlignmentForce ) velSum.divideScalar( l / _maxAlignmentForce );

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

    for ( var i = 0; i < boids.length; i++ ) {
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
    if ( l > _maxCohesionForce ) posSum.divideScalar( l / _maxCohesionForce );

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
