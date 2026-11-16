
export function createStadium(scene, THREE) {

  // DIMENSIONS DU TERRAIN
  const WIDTH = 30;
  const LENGTH = 46;
  const GRASS = 0x16852b;
  const WHITE = 0xffffff;

  // SOL AUTOUR DU TERRAIN
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({
      color: 0x253d32
    })
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.12;
  ground.receiveShadow = true;
  scene.add(ground);

  // GAZON
  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(WIDTH, LENGTH),
    new THREE.MeshStandardMaterial({
      color: GRASS,
      roughness: 0.9
    })
  );

  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  grass.position.y = 0;
  scene.add(grass);

  // BANDES DE GAZON
  for (let i = 0; i < 10; i++) {

    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(WIDTH, LENGTH / 10),
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x188d30 : 0x147b27
      })
    );

    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(
      0,
      0.015,
      -LENGTH / 2 + LENGTH / 20 + i * LENGTH / 10
    );

    scene.add(stripe);
  }

  // OUTIL POUR LES LIGNES BLANCHES
  function line(x1, z1, x2, z2) {

    const points = [
      new THREE.Vector3(x1, 0.035, z1),
      new THREE.Vector3(x2, 0.035, z2)
    ];

    const geometry =
      new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color: WHITE
    });

    scene.add(new THREE.Line(geometry, material));
  }

  // CONTOUR DU TERRAIN
  line(-15, -23, 15, -23);
  line(-15, 23, 15, 23);
  line(-15, -23, -15, 23);
  line(15, -23, 15, 23);

  // LIGNE DU MILIEU
  line(-15, 0, 15, 0);

  // CERCLE CENTRAL
  const centerCircle = new THREE.Mesh(
    new THREE.RingGeometry(4.8, 5, 64),
    new THREE.MeshBasicMaterial({
      color: WHITE,
      side: THREE.DoubleSide
    })
  );

  centerCircle.rotation.x = -Math.PI / 2;
  centerCircle.position.y = 0.04;
  scene.add(centerCircle);

  // POINT CENTRAL
  const centerPoint = new THREE.Mesh(
    new THREE.CircleGeometry(0.15, 24),
    new THREE.MeshBasicMaterial({
      color: WHITE
    })
  );

  centerPoint.rotation.x = -Math.PI / 2;
  centerPoint.position.y = 0.04;
  scene.add(centerPoint);

  // SURFACES DE REPARATION
  function penaltyArea(z) {

    const direction = z > 0 ? -1 : 1;

    line(-8, z, 8, z);
    line(-8, z, -8, z + direction * 5.5);
    line(8, z, 8, z + direction * 5.5);
    line(-8, z + direction * 5.5,
      8, z + direction * 5.5);

    // PETITE SURFACE
    const goalZ = z + direction * 2.2;

    line(-3.5, z, -3.5, goalZ);
    line(3.5, z, 3.5, goalZ);
    line(-3.5, goalZ, 3.5, goalZ);
  }

  penaltyArea(-23);
  penaltyArea(23);

  // BUTS
  function createGoal(z) {

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.25,
      roughness: 0.3
    });

    const postGeometry =
      new THREE.BoxGeometry(0.18, 2.5, 0.18);

    const barGeometry =
      new THREE.BoxGeometry(7.3, 0.18, 0.18);

    function post(x, y, zz, geometry) {

      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(x, y, zz);
      mesh.castShadow = true;

      scene.add(mesh);
    }

    post(-3.5, 1.25, z, postGeometry);
    post(3.5, 1.25, z, postGeometry);
    post(0, 2.5, z, barGeometry);

    // FILET DU BUT
    const netMaterial =
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.55
      });

    const backZ = z + (z > 0 ? 1.4 : -1.4);

    for (let i = 0; i <= 8; i++) {

      const x = -3.5 + i * 0.875;

      const geometry =
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, 0, z),
          new THREE.Vector3(x, 2.5, backZ)
        ]);

      scene.add(new THREE.Line(geometry, netMaterial));
    }

    for (let i = 0; i <= 4; i++) {

      const y = i * 0.625;

      const geometry =
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-3.5, y, backZ),
          new THREE.Vector3(3.5, y, backZ)
        ]);

      scene.add(new THREE.Line(geometry, netMaterial));
    }
  }

  createGoal(-23);
  createGoal(23);

  // TRIBUNES
  const seatColors = [
    0x1646a0,
    0xc62828,
    0xffffff,
    0xf5c400
  ];

  function createStand(x, z, width, depth) {

    for (let row = 0; row < 7; row++) {

      const seats = new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          0.65,
          depth / 7
        ),
        new THREE.MeshStandardMaterial({
          color: seatColors[row % seatColors.length]
        })
      );

      seats.position.set(
        x,
        0.5 + row * 0.75,
        z + row * (depth / 7)
      );

      seats.castShadow = true;
      scene.add(seats);
    }
  }

  // TRIBUNES DES DEUX COTES
  createStand(-20, -25, 7, 50);
  createStand(20, -25, 7, 50);

  // TRIBUNES DERRIERE LES BUTS
  createStand(0, -32, 34, 6);
  createStand(0, 26, 34, 6);

  // LUMIERES DU STADE
  for (const x of [-27, 27]) {
    for (const z of [-25, 25]) {

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.12, 0.2, 12, 8
        ),
        new THREE.MeshStandardMaterial({
          color: 0x777777
        })
      );

      pole.position.set(x, 6, z);
      scene.add(pole);

      const lamp = new THREE.PointLight(
        0xffffff,
        45,
        35
      );

      lamp.position.set(x, 12, z);
      scene.add(lamp);
    }
  }

  console.log("Stade FOOT LEGEND créé !");
      }
    
