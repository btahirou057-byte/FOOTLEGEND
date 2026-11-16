import * as THREE from
  'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

import { createStadium } from './stadium.js';
import { createPlayers } from './players.js';
import { createBall } from './ball.js';
import { setupControls } from './controls.js';
import { setupMatch } from './match.js';

// SCENE PRINCIPALE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x9fc9ee, 80, 220);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 19, 24);
camera.lookAt(0, 0, 0);

// MOTEUR GRAPHIQUE
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

document
  .getElementById('game-container')
  .appendChild(renderer.domElement);

// LUMIERE DU JOUR
const sunlight = new THREE.DirectionalLight(0xfff4e0, 2.5);
sunlight.position.set(25, 40, 20);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(2048, 2048);
sunlight.shadow.camera.left = -45;
sunlight.shadow.camera.right = 45;
sunlight.shadow.camera.top = 35;
sunlight.shadow.camera.bottom = -35;
sunlight.shadow.camera.far = 120;
sunlight.shadow.bias = -0.0005;
scene.add(sunlight);

// LUMIERE AMBIANTE
const ambient = new THREE.HemisphereLight(0xffffff, 0x426b32, 2);
scene.add(ambient);

// CREATION DU STADE
createStadium(scene, THREE);

// CREATION DES JOUEURS
const players = createPlayers(scene, THREE);

// CREATION DU BALLON
const ball = createBall(scene, THREE);

// COMMANDES DU JOUEUR
const controls = setupControls({
  THREE,
  camera,
  renderer,
  players,
  ball
});

// SYSTEME DE MATCH
const match = setupMatch({
  THREE,
  ball,
  players,
  scene
});

// HORLOGE
const clock = new THREE.Clock();

// BOUCLE DU JEU
function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  controls.update(delta);
  match.update(delta);

  renderer.render(scene, camera);
}

// ADAPTATION A L'ECRAN ANDROID
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// DEMARRAGE
document.getElementById('loading').style.display = 'none';

animate();

console.log('FOOT LEGEND 3D démarre !');
