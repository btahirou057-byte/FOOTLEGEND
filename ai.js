export function setupAI({ THREE, players, ball }) {

  const LIMIT_X = 15;
  const LIMIT_Z = 23;
  const GOAL_Z = 25;
  const clamp = THREE.MathUtils.clamp;

  const makeTeam = (list, goalZ) =>
    list.map(p => ({ p, goalZ, base: p.group.position.clone(), cooldown: 0 }));

  // l'équipe bleue attaque vers -Z, la rouge vers +Z
  const teams = [
    makeTeam(players.home, -GOAL_Z),
    makeTeam(players.away, GOAL_Z)
  ];

  const dirToGoal = new THREE.Vector3();

  function dist2D(a, b) {
    return Math.hypot(a.x - b.x, a.z - b.z);
  }

  function updateTeam(team, delta) {

    // le joueur de champ le plus proche du ballon va le chercher
    let chaser = null;
    let best = Infinity;
    team.forEach(a => {
      if (a.p.isGoalkeeper) return;
      const d = dist2D(a.p.group.position, ball.position);
      if (d < best) { best = d; chaser = a; }
    });
    if (chaser && chaser.p.isControlled) chaser = null;

    team.forEach(a => {
      const p = a.p;
      if (p.isControlled) return;

      const pos = p.group.position;
      let tx, tz, speed;

      if (p.isGoalkeeper) {
        tx = clamp(ball.position.x, -3.5, 3.5);
        tz = a.base.z;
        speed = 3;
      } else if (a === chaser) {
        tx = ball.position.x;
        tz = ball.position.z;
        speed = 5.2;
      } else {
        tx = a.base.x + (ball.position.x - a.base.x) * 0.25;
        tz = a.base.z + ball.position.z * 0.35;
        speed = 4;
      }

      tx = clamp(tx, -LIMIT_X, LIMIT_X);
      tz = clamp(tz, -LIMIT_Z, LIMIT_Z);

      // déplacement
      const dx = tx - pos.x;
      const dz = tz - pos.z;
      const d = Math.hypot(dx, dz);

      if (d > 0.4) {
        const step = Math.min(speed * delta, d);
        pos.x += dx / d * step;
        pos.z += dz / d * step;
        p.velocity.set(dx / d * speed, 0, dz / d * speed);
      } else {
        p.velocity.set(0, 0, 0);
      }

      // tir ou passe vers le but adverse
      a.cooldown -= delta;
      const dBall = dist2D(pos, ball.position);

      if (dBall < 1.3 && a.cooldown <= 0) {
        dirToGoal.set(
          (Math.random() - 0.5) * 6 - pos.x,
          0,
          a.goalZ - pos.z
        );
        const dGoal = dirToGoal.length();
        dirToGoal.normalize();
        ball.kick(dGoal < 15 ? 14 : 6, dirToGoal);
        a.cooldown = 0.7;
      }
    });
  }

  function update(delta) {
    teams.forEach(t => updateTeam(t, delta));
  }

  return { update };
}
