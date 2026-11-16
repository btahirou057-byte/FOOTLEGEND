
export function createBall(scene, THREE) {

  // GROUPE DU BALLON
  const ball = new THREE.Group();

  // DIMENSIONS
  const radius = 0.38;

  // CORPS BLANC
  const whiteMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.65
    });

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    whiteMaterial
  );

  sphere.castShadow = true;
  sphere.receiveShadow = true;

  ball.add(sphere);

  // MOTIFS NOIRS
  const blackMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.7
    });

  const spots = [
    [0, 1, 0],
    [0, -1, 0],
    [1, 0, 0],
    [-1, 0, 0],
    [0, 0, 1],
    [0, 0, -1],
    [0.7, 0.7, 0],
    [-0.7, 0.7, 0],
    [0.7, -0.7, 0],
    [-0.7, -0.7, 0]
  ];

  spots.forEach(direction => {

    const normal = new THREE.Vector3(
      direction[0],
      direction[1],
      direction[2]
    ).normalize();

    const patch = new THREE.Mesh(
      new THREE.SphereGeometry(0.105, 12, 12),
      blackMaterial
    );

    patch.position.copy(
      normal.clone().multiplyScalar(radius * 0.96)
    );

    patch.scale.set(1, 1, 0.25);

    patch.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal
    );

    ball.add(patch);
  });

  // POSITION INITIALE
  ball.position.set(0, radius, 0);

  // PHYSIQUE
  ball.velocity = new THREE.Vector3(0, 0, 0);

  ball.radius = radius;
  ball.isMoving = false;

  // TIR DU BALLON
  ball.kick = function(power, direction) {

    const dir = direction.clone().normalize();

    ball.velocity.x = dir.x * power;
    ball.velocity.z = dir.z * power;
    ball.velocity.y = Math.min(power * 0.12, 3);

    ball.isMoving = true;
  };

  // MISE A JOUR
  ball.update = function(delta) {

    if (ball.velocity.length() < 0.03) {

      ball.velocity.set(0, 0, 0);
      ball.isMoving = false;

      return;
    }

    // DEPLACEMENT
    ball.position.x += ball.velocity.x * delta;
    ball.position.z += ball.velocity.z * delta;
    ball.position.y += ball.velocity.y * delta;

    // GRAVITE
    ball.velocity.y -= 9.8 * delta;

    // REBOND AU SOL
    if (ball.position.y < radius) {

      ball.position.y = radius;

      if (Math.abs(ball.velocity.y) > 0.8) {
        ball.velocity.y *= -0.35;
      } else {
        ball.velocity.y = 0;
      }
    }

    // FROTTEMENT
    ball.velocity.x *= Math.pow(0.985, delta * 60);
    ball.velocity.z *= Math.pow(0.985, delta * 60);

    // ROTATION
    ball.rotation.x += ball.velocity.z * delta * 2;
    ball.rotation.z -= ball.velocity.x * delta * 2;

    ball.isMoving = true;
  };

  // AJOUT A LA SCENE
  scene.add(ball);

  console.log("Ballon FOOT LEGEND créé !");

  return ball;
    }
                                    
