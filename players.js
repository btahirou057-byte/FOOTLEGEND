
export function createPlayers(scene, THREE) {

  const home = [];
  const away = [];

  // COULEURS DES EQUIPES
  const blue = 0x1266ff;
  const red = 0xe52b2b;
  const white = 0xffffff;
  const skin = 0xc98b62;

  // FORMATION 4-3-3
  const formation = [
    [0, 20],       // Gardien
    [-11, 13],     // Defenseur
    [-4, 14],
    [4, 14],
    [11, 13],
    [-8, 6],       // Milieu
    [0, 8],
    [8, 6],
    [-10, -5],     // Attaquant
    [0, -8],
    [10, -5]
  ];

  function material(color) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.7
    });
  }

  function addPart(group, geometry, mat, x, y, z) {

    const mesh = new THREE.Mesh(geometry, mat);

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    group.add(mesh);

    return mesh;
  }

  function createPlayer(teamColor, x, z, index, team) {

    const group = new THREE.Group();

    group.position.set(x, 0, z);

    const jerseyColor =
      index === 0 ? 0xf5e642 : teamColor;

    const jersey = material(jerseyColor);
    const shorts = material(0x172033);
    const skinMat = material(skin);
    const socks = material(0xffffff);
    const shoes = material(0x171717);

    // CORPS
    addPart(
      group,
      new THREE.CylinderGeometry(0.27, 0.35, 0.85, 10),
      jersey,
      0, 1.35, 0
    );

    // SHORT
    addPart(
      group,
      new THREE.BoxGeometry(0.65, 0.28, 0.4),
      shorts,
      0, 0.82, 0
    );

    // TETE
    addPart(
      group,
      new THREE.SphereGeometry(0.22, 12, 12),
      skinMat,
      0, 2.05, 0
    );

    // CHEVEUX
    addPart(
      group,
      new THREE.SphereGeometry(0.225, 10, 8),
      material(0x24201c),
      0, 2.17, -0.025
    );

    // BRAS GAUCHE
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.35, 1.65, 0);

    addPart(
      leftArm,
      new THREE.CylinderGeometry(0.09, 0.12, 0.7, 8),
      jersey,
      0, -0.3, 0
    );

    addPart(
      leftArm,
      new THREE.SphereGeometry(0.09, 8, 8),
      skinMat,
      0, -0.68, 0
    );

    group.add(leftArm);

    // BRAS DROIT
    const rightArm = new THREE.Group();
    rightArm.position.set(0.35, 1.65, 0);

    addPart(
      rightArm,
      new THREE.CylinderGeometry(0.09, 0.12, 0.7, 8),
      jersey,
      0, -0.3, 0
    );

    addPart(
      rightArm,
      new THREE.SphereGeometry(0.09, 8, 8),
      skinMat,
      0, -0.68, 0
    );

    group.add(rightArm);

    // JAMBES
    const legs = [];

    for (let side = -1; side <= 1; side += 2) {

      const leg = new THREE.Group();

      leg.position.set(side * 0.18, 0.75, 0);

      addPart(
        leg,
        new THREE.CylinderGeometry(0.11, 0.13, 0.55, 8),
        skinMat,
        0, -0.28, 0
      );

      addPart(
        leg,
        new THREE.CylinderGeometry(0.09, 0.1, 0.18, 8),
        socks,
        0, -0.62, 0
      );

      addPart(
        leg,
        new THREE.BoxGeometry(0.19, 0.1, 0.32),
        shoes,
        0, -0.76, 0.09
      );

      group.add(leg);
      legs.push(leg);
    }

    // NUMERO SUR LE MAILLOT
    const number = addPart(
      group,
      new THREE.BoxGeometry(0.12, 0.2, 0.025),
      material(white),
      0, 1.43, 0.36
    );

    // OMBRE
    scene.add(group);

    return {
      group,
      team,
      number: index + 1,
      role: index === 0 ? "Gardien" : "Joueur",
      speed: index === 0 ? 3 : 5,
      velocity: new THREE.Vector3(0, 0, 0),
      legs,
      leftArm,
      rightArm,
      isGoalkeeper: index === 0,
      hasBall: false
    };
  }

  // CREER LES DEUX EQUIPES
  formation.forEach((position, index) => {

    const x = position[0];
    const z = position[1];

    // EQUIPE BLEUE
    const bluePlayer = createPlayer(
      blue,
      x,
      z,
      index,
      "home"
    );

    home.push(bluePlayer);

    // EQUIPE ROUGE
    const redPlayer = createPlayer(
      red,
      -x,
      -z,
      index,
      "away"
    );

    away.push(redPlayer);

  });

  // JOUEUR CONTROLE
  const controlled = home[9];

  controlled.isControlled = true;

  // ANIMATION SIMPLE DES JOUEURS
  function animatePlayers(delta) {

    const time = performance.now() * 0.008;

    [...home, ...away].forEach(player => {

      const moving =
        player.velocity.length() > 0.1;

      if (moving) {

        player.legs[0].rotation.x =
          Math.sin(time) * 0.65;

        player.legs[1].rotation.x =
          -Math.sin(time) * 0.65;

        player.leftArm.rotation.x =
          -Math.sin(time) * 0.4;

        player.rightArm.rotation.x =
          Math.sin(time) * 0.4;

      } else {

        player.legs[0].rotation.x = 0;
        player.legs[1].rotation.x = 0;

        player.leftArm.rotation.x = 0;
        player.rightArm.rotation.x = 0;

      }

    });
  }

  console.log("22 joueurs FOOT LEGEND créés !");

  return {
    home,
    away,
    all: [...home, ...away],
    controlled,
    animatePlayers
  };

    }
      
