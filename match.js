
export function setupMatch({ THREE, ball, players, scene }) {

  // SCORES
  let homeScore = 0;
  let awayScore = 0;

  // CHRONOMETRE : 90 MINUTES EN TEMPS DE JEU
  let matchTime = 0;
  const matchDuration = 90 * 60;
  const gameSpeed = 10;

  let matchFinished = false;
  let goalCooldown = 0;

  // TABLEAU DES SCORES
  const scoreboard = document.getElementById("scoreboard");

  const timer = document.createElement("span");
  timer.id = "timer";
  timer.textContent = "00:00";

  scoreboard.appendChild(timer);

  // ACTUALISER LE SCORE
  function updateScore() {

    document.getElementById("score").textContent =
      `${homeScore} - ${awayScore}`;

  }

  // ACTUALISER LE CHRONOMETRE
  function updateTimer() {

    const minutes = Math.floor(matchTime / 60);
    const seconds = Math.floor(matchTime % 60);

    timer.textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  }

  // REMETTRE LE BALLON AU CENTRE
  function resetBall() {

    ball.position.set(0, ball.radius, 0);

    ball.velocity.set(0, 0, 0);

    ball.rotation.set(0, 0, 0);

    ball.isMoving = false;

  }

  // REPOSITIONNER LES JOUEURS
  function resetPlayers() {

    players.home.forEach(player => {

      player.group.position.set(
        player.group.userData.startX ?? 0,
        0,
        player.group.userData.startZ ?? 0
      );

      player.velocity.set(0, 0, 0);

    });

    players.away.forEach(player => {

      player.group.position.set(
        player.group.userData.startX ?? 0,
        0,
        player.group.userData.startZ ?? 0
      );

      player.velocity.set(0, 0, 0);

    });

  }

  // ENREGISTRER LES POSITIONS INITIALES
  players.all.forEach(player => {

    player.group.userData.startX =
      player.group.position.x;

    player.group.userData.startZ =
      player.group.position.z;

  });

  // DETECTER UN BUT
  function checkGoal() {

    if (goalCooldown > 0 || matchFinished) return;

    const x = ball.position.x;
    const z = ball.position.z;

    // BUT DE L'EQUIPE BLEUE
    if (z < -23 && Math.abs(x) < 3.5) {

      homeScore++;

      goal("BUT DE L'EQUIPE BLEUE !");

    }

    // BUT DE L'EQUIPE ROUGE
    else if (z > 23 && Math.abs(x) < 3.5) {

      awayScore++;

      goal("BUT DE L'EQUIPE ROUGE !");

    }

    // BALLON SORTI DU TERRAIN
    else if (
      Math.abs(x) > 16 ||
      Math.abs(z) > 26
    ) {

      resetBall();

    }

  }

  // CELEBRATION DU BUT
  function goal(message) {

    updateScore();

    resetBall();

    goalCooldown = 3;

    const notification = document.createElement("div");

    notification.textContent = message;

    notification.style.position = "absolute";
    notification.style.top = "30%";
    notification.style.left = "50%";
    notification.style.transform = "translate(-50%, -50%)";
    notification.style.background = "#087d36";
    notification.style.color = "white";
    notification.style.padding = "20px";
    notification.style.borderRadius = "15px";
    notification.style.fontWeight = "bold";
    notification.style.fontSize = "20px";
    notification.style.textAlign = "center";

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2200);

    console.log(message);

  }

  // FIN DU MATCH
  function finishMatch() {

    matchFinished = true;

    const result = document.createElement("div");

    result.style.position = "fixed";
    result.style.inset = "0";
    result.style.background = "rgba(0,0,0,0.9)";
    result.style.color = "white";
    result.style.display = "flex";
    result.style.flexDirection = "column";
    result.style.justifyContent = "center";
    result.style.alignItems = "center";
    result.style.zIndex = "100";

    let winner = "MATCH NUL";

    if (homeScore > awayScore) {
      winner = "EQUIPE BLEUE VICTORIEUSE !";
    }

    if (awayScore > homeScore) {
      winner = "EQUIPE ROUGE VICTORIEUSE !";
    }

    result.innerHTML = `
      <h1>FIN DU MATCH</h1>
      <h2>${homeScore} - ${awayScore}</h2>
      <h3>${winner}</h3>
      <button id="restart-match"
        style="padding:15px 30px;margin-top:20px;
        background:#16a34a;color:white;
        border:0;border-radius:10px;font-size:18px;">
        REJOUER
      </button>
    `;

    document.body.appendChild(result);

    document.getElementById("restart-match")
      .addEventListener("click", () => {

        homeScore = 0;
        awayScore = 0;
        matchTime = 0;
        matchFinished = false;
        goalCooldown = 0;

        updateScore();
        updateTimer();

        resetPlayers();
        resetBall();

        result.remove();

      });

  }

  // BOUCLE DE MISE A JOUR
  function update(delta) {

    if (matchFinished) return;

    // PHYSIQUE DU BALLON
    ball.update(delta);

    // CHRONOMETRE
    matchTime += delta * gameSpeed;

    updateTimer();

    // COOLDOWN
    if (goalCooldown > 0) {
      goalCooldown -= delta;
    }

    // DETECTION DES BUTS
    checkGoal();

    // FIN DU MATCH
    if (matchTime >= matchDuration) {

      matchTime = matchDuration;

      updateTimer();

      finishMatch();

    }

  }

  updateScore();
  updateTimer();

  console.log("Match FOOT LEGEND prêt !");

  return {
    update,
    resetBall,
    finishMatch,
    getHomeScore: () => homeScore,
    getAwayScore: () => awayScore
  };

      }
