import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/utils/SkeletonUtils.js';

const MODEL_URL =
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/models/gltf/Soldier.glb';

export function createPlayers(scene, THREE) {

  const home = [];
  const away = [];

  const blue = 0x1266ff;
  const red = 0xe52b2b;
  const skins = [0xc98b62, 0x8d5a3b, 0xf0c8a0, 0x6b4128, 0xd9a577];
  const hairs = [0x24201c, 0x111111, 0x4a3320, 0x24201c];

  // FORMATION 4-3-3
  const formation = [
    [0, 20],
    [-11, 13], [-4, 14], [4, 14], [11, 13],
    [-8, 6], [0, 8], [8, 6],
    [-10, -5], [0, -8], [10, -5]
  ];

  const mat = (color, rough = 0.7) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough });

  function addPart(group, geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  function numberTexture(num) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = '#fff';
    g.font = 'bold 96px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(num), 64, 70);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function createPlayer(teamColor, x, z, index, team) {

    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const isGK = index === 0;
    const jerseyColor = isGK ? 0xf5e642 : teamColor;

    const jersey = mat(jerseyColor, 0.6);
    const shorts = mat(team === 'home' ? 0xffffff : 0x151515);
    const skinMat = mat(skins[index % skins.length], 0.8);
    const hairMat = mat(hairs[index % hairs.length], 0.9);
    const socks = mat(isGK ? 0x222222 : teamColor);
    const shoes = mat(index % 2 ? 0xf5f5f5 : 0x111111, 0.5);
    const gloves = mat(0xff7a00);

    // TORSE
    const torso = addPart(group,
      new THREE.CylinderGeometry(0.27, 0.35, 0.85, 12),
      jersey, 0, 1.35, 0);
    torso.scale.z = 0.7;

    // COL
    addPart(group,
      new THREE.CylinderGeometry(0.1, 0.12, 0.1, 8),
      skinMat, 0, 1.82, 0);

    // NUMERO DANS LE DOS
    const numMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.32, 0.32),
      new THREE.MeshBasicMaterial({
        map: numberTexture(index + 1),
        transparent: true,
        polygonOffset: true,
        polygonOffsetFactor: -2
      })
    );
    numMesh.rotation.y = Math.PI;
    numMesh.position.set(0, 1.42, -0.235);
    group.add(numMesh);

    // SHORT
    addPart(group,
      new THREE.BoxGeometry(0.68, 0.3, 0.4),
      shorts, 0, 0.82, 0);

    // TETE + CHEVEUX
    addPart(group,
      new THREE.SphereGeometry(0.22, 14, 14),
      skinMat, 0, 2.05, 0);
    const hair = addPart(group,
      new THREE.SphereGeometry(0.228, 12, 10, 0, Math.PI * 2, 0, Math.PI / 1.9),
      hairMat, 0, 2.08, -0.02);
    hair.rotation.x = -0.15;

    // BRAS
    function makeArm(side) {
      const arm = new THREE.Group();
      arm.position.set(side * 0.38, 1.7, 0);
      addPart(arm, new THREE.CylinderGeometry(0.1, 0.12, 0.3, 8),
        jersey, 0, -0.12, 0);
      addPart(arm, new THREE.CylinderGeometry(0.075, 0.09, 0.4, 8),
        skinMat, 0, -0.42, 0);
      addPart(arm, new THREE.SphereGeometry(isGK ? 0.12 : 0.08, 8, 8),
        isGK ? gloves : skinMat, 0, -0.66, 0);
      group.add(arm);
      return arm;
    }
    const leftArm = makeArm(-1);
    const rightArm = makeArm(1);

    // JAMBES
    const legs = [];
    for (let side = -1; side <= 1; side += 2) {
      const leg = new THREE.Group();
      leg.position.set(side * 0.18, 0.75, 0);
      addPart(leg, new THREE.CylinderGeometry(0.13, 0.14, 0.2, 8),
        shorts, 0, -0.08, 0);
      addPart(leg, new THREE.CylinderGeometry(0.1, 0.12, 0.25, 8),
        skinMat, 0, -0.28, 0);
      addPart(leg, new THREE.CylinderGeometry(0.09, 0.1, 0.32, 8),
        socks, 0, -0.52, 0);
      addPart(leg, new THREE.BoxGeometry(0.19, 0.1, 0.34),
        shoes, 0, -0.74, 0.08);
      group.add(leg);
      legs.push(leg);
    }

    // ANNEAU DU JOUEUR CONTROLE
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.7, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffe600, side: THREE.DoubleSide,
        transparent: true, opacity: 0.9
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    ring.visible = false;
    group.add(ring);

    scene.add(group);

    return {
      group,
      team,
      teamColor: jerseyColor,
      number: index + 1,
      role: isGK ? 'Gardien' : 'Joueur',
      speed: isGK ? 3 : 5,
      velocity: new THREE.Vector3(0, 0, 0),
      legs,
      leftArm,
      rightArm,
      ring,
      phase: Math.random() * 6,
      isGoalkeeper: isGK,
      hasBall: false,
      // vers quel côté le joueur regarde (home attaque vers -Z)
      facing: team === 'home' ? Math.PI : 0,
      model: null
    };
  }

  // CREER LES DEUX EQUIPES
  formation.forEach(([x, z], index) => {
    home.push(createPlayer(blue, x, z, index, 'home'));
    away.push(createPlayer(red, -x, -z, index, 'away'));
  });

  const controlled = home[9];
  controlled.isControlled = true;

  const all = [...home, ...away];

  // ---------- VRAI MODELE 3D ANIME ----------
  function attachModel(p, gltf) {
    const model = SkeletonUtils.clone(gltf.scene);
    model.scale.setScalar(1.1);

    const tint = new THREE.Color(p.teamColor)
      .lerp(new THREE.Color(0xffffff), 0.35);

    model.traverse(o => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      o.frustumCulled = false;
      const tintOne = m => {
        const c = m.clone();
        if (c.color) c.color.copy(tint);
        return c;
      };
      o.material = Array.isArray(o.material)
        ? o.material.map(tintOne)
        : tintOne(o.material);
    });

    // cacher les anciennes pièces (sauf l'anneau)
    p.group.children.forEach(ch => {
      if (ch !== p.ring) ch.visible = false;
    });
    p.group.add(model);

    const mixer = new THREE.AnimationMixer(model);
    const find = n => gltf.animations.find(a => a.name === n);
    const idle = mixer.clipAction(find('Idle'));
    const run = mixer.clipAction(find('Run'));
    idle.time = Math.random() * 2;
    idle.play();
    run.play();
    run.setEffectiveWeight(0);

    p.model = model;
    p.mixer = mixer;
    p.idle = idle;
    p.run = run;
    p.runWeight = 0;
  }

  new GLTFLoader().load(
    MODEL_URL,
    gltf => all.forEach(p => attachModel(p, gltf)),
    undefined,
    err => console.warn('Modèle 3D non chargé, joueurs simples gardés', err)
  );

  // ANIMATION
  function animatePlayers(delta) {
    const t = performance.now() * 0.001;

    all.forEach(p => {
      const speed = p.velocity.length();

      if (p.model) {
        // orientation vers la direction du mouvement
        if (speed > 0.1) p.facing = Math.atan2(p.velocity.x, p.velocity.z);
        p.model.rotation.y = p.facing - p.group.rotation.y;

        // fondu entre repos et course
        const target = speed > 0.1 ? 1 : 0;
        p.runWeight += (target - p.runWeight) * Math.min(1, delta * 8);
        p.idle.setEffectiveWeight(1 - p.runWeight);
        p.run.setEffectiveWeight(p.runWeight);
        p.run.timeScale = THREE.MathUtils.clamp(speed / 5, 0.6, 1.6);
        p.mixer.update(delta);

      } else {
        const amp = Math.min(speed / 5, 1) * 0.95;
        const swing = Math.sin(t * (7 + speed * 1.3) + p.phase) * amp;

        if (speed > 0.1) {
          p.legs[0].rotation.x = swing;
          p.legs[1].rotation.x = -swing;
          p.leftArm.rotation.x = -swing * 0.8;
          p.rightArm.rotation.x = swing * 0.8;
        } else {
          p.legs[0].rotation.x *= 0.8;
          p.legs[1].rotation.x *= 0.8;
          p.leftArm.rotation.x *= 0.8;
          p.rightArm.rotation.x *= 0.8;
        }
      }

      p.ring.visible = !!p.isControlled || p === api.controlled;
    });
  }

  const api = { home, away, all, controlled, animatePlayers };

  console.log('22 joueurs FOOT LEGEND créés !');

  return api;
}
