
export function setupControls({
  THREE,
  camera,
  renderer,
  players,
  ball
}) {

  const joystick = document.getElementById("joystick");
  const stick = document.getElementById("stick");

  const passButton = document.getElementById("pass");
  const shootButton = document.getElementById("shoot");
  const sprintButton = document.getElementById("sprint");

  const player = players.controlled;

  let moveX = 0;
  let moveZ = 0;
  let sprinting = false;

  let joystickActive = false;
  let pointerId = null;

  const maxDistance = 35;

  // POSITION DU JOYSTICK
  function moveJoystick(event) {

    const rect = joystick.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxDistance) {
      dx = dx / distance * maxDistance;
      dy = dy / distance * maxDistance;
    }

    stick.style.left =
      `calc(50% + ${dx}px)`;

    stick.style.top =
      `calc(50% + ${dy}px)`;

    moveX = dx / maxDistance;
    moveZ = dy / maxDistance;
  }

  function resetJoystick() {

    joystickActive = false;
    pointerId = null;

    moveX = 0;
    moveZ = 0;

    stick.style.left = "50%";
    stick.style.top = "50%";
  }

  // DEBUT DU TOUCHER
  joystick.addEventListener("pointerdown", event => {

    event.preventDefault();

    joystickActive = true;
    pointerId = event.pointerId;

    joystick.setPointerCapture(pointerId);

    moveJoystick(event);
  });

  // DEPLACEMENT DU JOYSTICK
  joystick.addEventListener("pointermove", event => {

    if (!joystickActive ||
        event.pointerId !== pointerId) return;

    event.preventDefault();

    moveJoystick(event);
  });

  joystick.addEventListener("pointerup", resetJoystick);
  joystick.addEventListener("pointercancel", resetJoystick);

  // COURIR
  sprintButton.addEventListener("pointerdown", event => {
    event.preventDefault();
    sprinting = true;
  });

  sprintButton.addEventListener("pointerup", () => {
    sprinting = false;
  });

  sprintButton.addEventListener("pointercancel", () => {
    sprinting = false;
  });

  sprintButton.addEventListener("lostpointercapture", () => {
    sprinting = false;
  });

  // DIRECTION DU TIR
  function getDirection() {

    const direction = new THREE.Vector3(
      moveX,
      0,
      -1
    );

    if (Math.abs(moveZ) > 0.1) {
      direction.z = -moveZ;
    }

    if (direction.length() < 0.1) {
      direction.set(0, 0, -1);
    }

    return direction.normalize();
  }

  // VERIFIER SI LE JOUEUR EST PRES DU BALLON
  function nearBall() {

    const dx = player.group.position.x - ball.position.x;
    const dz = player.group.position.z - ball.position.z;

    return Math.sqrt(dx * dx + dz * dz) < 1.5;
  }

  // TIRER
  function shoot() {

    if (!nearBall()) return;

    ball.kick(15, getDirection());
  }

  shootButton.addEventListener("pointerdown", event => {
    event.preventDefault();
    shoot();
  });

  // PASSE
  function pass() {

    if (!nearBall()) return;

    ball.kick(7, getDirection());
  }

  passButton.addEventListener("pointerdown", event => {
    event.preventDefault();
    pass();
  });

  // MISE A JOUR
  function update(delta) {

    const moving =
      Math.abs(moveX) > 0.05 ||
      Math.abs(moveZ) > 0.05;

    if (moving) {

      const speed = sprinting ? 9 : 5;

      player.group.position.x +=
        moveX * speed * delta;

      player.group.position.z +=
        moveZ * speed * delta;

      player.velocity.set(
        moveX * speed,
        0,
        moveZ * speed
      );

      player.group.rotation.y =
        Math.atan2(moveX, -moveZ);

    } else {

      player.velocity.set(0, 0, 0);
    }

    // LIMITES DU TERRAIN
    player.group.position.x = THREE.MathUtils.clamp(
      player.group.position.x,
      -14,
      14
    );

    player.group.position.z = THREE.MathUtils.clamp(
      player.group.position.z,
      -22,
      22
    );

    // ANIMATION DES JOUEURS
    players.animatePlayers(delta);

    // CAMERA QUI SUIT LE JOUEUR
    const target = new THREE.Vector3(
      player.group.position.x,
      0,
      player.group.position.z
    );

    const cameraPosition = new THREE.Vector3(
      target.x,
      17,
      target.z + 20
    );

    camera.position.lerp(cameraPosition, 3 * delta);
    camera.lookAt(target);
  }

  console.log("Commandes tactiles activées !");

  return {
    update
  };
    }
