var Boid = function () {
  var _maxSpeed = 0.5;
  var _maxAcceleration = 1;

  this.position = new THREE.Vector3(0, 10, 0); // initialise position
  this.velocity = new THREE.Vector3(1, 0, 0); // initialise velocity
  this.acceleration = new THREE.Vector3( 0, 0, 0 );

  this.move = function ( impulse ) {

    if ( impulse ) {
      this.acceleration.add( impulse );
    }

    this.velocity.add( this.acceleration );
    l = this.velocity.length();
    a = this.acceleration.length();

    if ( l > _maxSpeed ) {
      this.velocity.divideScalar( l / _maxSpeed );
    }
    if ( a > _maxAcceleration ) {
      this.acceleration.divideScalar( l / _maxAcceleration );
    }

    this.position.add( this.velocity );
    //this.acceleration.set( 0, 0, 0 );
    this.acceleration.divideScalar( 2 ); // Exponential drag

  }

}
