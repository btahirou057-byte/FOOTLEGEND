export function createStadium(scene, THREE) {
  const L = 50; // longueur du terrain
  const W = 34; // largeur du terrain
  const group = new THREE.Group();

  // ---------- TERRAIN (herbe rayée + lignes) ----------
  const PX = 20; // pixels par mètre
  const c = document.createElement('canvas');
  c.width = L * PX; c.height = W * PX;
  const g = c.getContext('2d');
  const n = 12;
  for (let i = 0; i < n; i++) {
    g.fillStyle = i % 2 ? '#3e9c2f' : '#368f28';
    g.fillRect(i * c.width / n, 0, c.width / n + 1, c.height);
  }
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,40,0'},.05)`;
    g.fillRect(Math.random() * c.width, Math.random() * c.height, 3, 3);
  }
  g.strokeStyle = '#fff'; g.lineWidth = 5; g.fillStyle = '#fff';
  const m = 6, cw = c.width, ch = c.height;
  g.strokeRect(m, m, cw - 2 * m, ch - 2 * m);
  g.beginPath(); g.moveTo(cw / 2, m); g.lineTo(cw / 2, ch - m); g.stroke();
  g.beginPath(); g.arc(cw / 2, ch / 2, 5 * PX, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(cw / 2, ch / 2, 6, 0, Math.PI * 2); g.fill();
  [0, 1].forEach(s => {
    const x0 = s ? cw - m : m, dir = s ? -1 : 1;
    g.strokeRect(s ? x0 - 8 * PX : x0, ch / 2 - 9 * PX, 8 * PX, 18 * PX);
    g.strokeRect(s ? x0 - 3 * PX : x0, ch / 2 - 4 * PX, 3 * PX, 8 * PX);
    g.beginPath(); g.arc(x0 + dir * 6 * PX, ch / 2, 5, 0, Math.PI * 2); g.fill();
  });
  const grass = new THREE.CanvasTexture(c);
  grass.colorSpace = THREE.SRGBColorSpace;
  grass.anisotropy = 8;
  const pitch = new THREE.Mesh(
    new THREE.PlaneGeometry(L, W),
    new THREE.MeshStandardMaterial({ map: grass, roughness: 1 })
  );
  pitch.rotation.x = -Math.PI / 2;
  pitch.receiveShadow = true;
  group.add(pitch);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({ color: 0x2c6b24, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.03;
  ground.receiveShadow = true;
  group.add(ground);

  // ---------- BUTS ----------
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const netMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, wireframe: true, transparent: true, opacity: 0.35
  });
  [-1, 1].forEach(s => {
    const goal = new THREE.Group();
    [-3.5, 3.5].forEach(z => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 2.4, 8), white);
      post.position.set(0, 1.2, z); post.castShadow = true; goal.add(post);
    });
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 7, 8), white);
    bar.rotation.x = Math.PI / 2; bar.position.y = 2.4; goal.add(bar);
    const net = new THREE.Mesh(new THREE.BoxGeometry(2, 2.4, 7, 4, 4, 10), netMat);
    net.position.set(s * 1, 1.2, 0); goal.add(net);
    goal.position.x = s * L / 2;
    group.add(goal);
  });

  // ---------- PANNEAUX PUB ----------
  const bc = document.createElement('canvas');
  bc.width = 1024; bc.height = 64;
  const b = bc.getContext('2d');
  const cols = ['#0b3d91', '#c8102e', '#111', '#f2a900'];
  ['FOOT LEGEND', 'LEGEND CUP', 'FOOT LEGEND', 'MOBILE'].forEach((t, i) => {
    b.fillStyle = cols[i]; b.fillRect(i * 256, 0, 256, 64);
    b.fillStyle = '#fff'; b.font = 'italic bold 34px Arial';
    b.textAlign = 'center'; b.textBaseline = 'middle';
    b.fillText(t, i * 256 + 128, 34);
  });
  const adTex = new THREE.CanvasTexture(bc);
  adTex.colorSpace = THREE.SRGBColorSpace;
  adTex.wrapS = THREE.RepeatWrapping;
  const addBoard = (len, x, z, rot) => {
    const t = adTex.clone(); t.needsUpdate = true; t.repeat.set(len / 16, 1);
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(len, .9, .15),
      new THREE.MeshStandardMaterial({ map: t, roughness: .6 })
    );
    board.position.set(x, .45, z); board.rotation.y = rot;
    group.add(board);
  };
  addBoard(L + 6, 0, -(W / 2 + 2.5), 0);
  addBoard(L + 6, 0, W / 2 + 2.5, Math.PI);
  addBoard(W + 6, L / 2 + 2.5, 0, Math.PI / 2);
  addBoard(W + 6, -(L / 2 + 2.5), 0, -Math.PI / 2);

  // ---------- FOULE ----------
  const fc = document.createElement('canvas');
  fc.width = 512; fc.height = 256;
  const f = fc.getContext('2d');
  f.fillStyle = '#1b2430'; f.fillRect(0, 0, 512, 256);
  const fcols = ['#e8e8e8', '#2fa37a', '#c8102e', '#f2c14e', '#3a5ba0', '#222'];
  for (let i = 0; i < 3500; i++) {
    f.fillStyle = fcols[(Math.random() * fcols.length) | 0];
    f.fillRect(Math.random() * 512, Math.random() * 256, 5, 7);
  }
  const crowd = new THREE.CanvasTexture(fc);
  crowd.colorSpace = THREE.SRGBColorSpace;
  crowd.wrapS = crowd.wrapT = THREE.RepeatWrapping;
  crowd.repeat.set(8, 1);
  crowd.anisotropy = 8;
  crowd.minFilter = THREE.LinearMipmapLinearFilter;
  const crowdMat = new THREE.MeshStandardMaterial({ map: crowd, roughness: 1 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0x8a8f98, roughness: .9 });
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0xdfe6ee, roughness: .4, metalness: .3, side: THREE.DoubleSide
  });

  // ---------- TRIBUNES ----------
  const buildStand = (len, rotY, x, z) => {
    const s = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const h = 1.2 * (i + 1);
      const step = new THREE.Mesh(new THREE.BoxGeometry(len, h, 2), crowdMat);
      step.position.set(0, h / 2, -(i * 2 + 1));
      step.receiveShadow = true;
      s.add(step);
    }
    const back = new THREE.Mesh(new THREE.BoxGeometry(len, 12, .5), concrete);
    back.position.set(0, 6, -12.25); s.add(back);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(len, .3, 9), roofMat);
    roof.position.set(0, 11, -7); roof.rotation.x = -.18; roof.castShadow = true;
    s.add(roof);
    [-len / 2 + 1, len / 2 - 1].forEach(px => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(.4, 11, .4), concrete);
      col.position.set(px, 5.5, -11.5); s.add(col);
    });
    s.position.set(x, 0, z); s.rotation.y = rotY;
    group.add(s);
  };
  buildStand(L + 10, 0, 0, -(W / 2 + 4));
  buildStand(L + 10, Math.PI, 0, W / 2 + 4);
  buildStand(W + 10, -Math.PI / 2, L / 2 + 4, 0);
  buildStand(W + 10, Math.PI / 2, -(L / 2 + 4), 0);

  // ---------- PROJECTEURS ----------
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.25, .35, 22, 8), concrete);
    pole.position.set(sx * (L / 2 + 16), 11, sz * (W / 2 + 16));
    group.add(pole);
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.5, .5),
      new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xffffee, emissiveIntensity: 1.5
      })
    );
    head.position.set(sx * (L / 2 + 16), 22.5, sz * (W / 2 + 16));
    head.lookAt(0, 0, 0);
    group.add(head);
  });

  group.rotation.y = Math.PI / 2;
  scene.add(group);
  return group;
}
