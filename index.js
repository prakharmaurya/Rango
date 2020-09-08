const config = {
  playerColor: "#555",
  playerColorStyle: 2, // color style 0: onlyStroke, 1: onlyFill, 2: stroke&Fill
  playerSize: 12,
  playerHealth: 10,
  playerBulletColor: "#a00",
  playerBulletColorStyle: 1,
  playerBulletDamage: 1,
  playerBulletSpeed: 7,
  playerBulletSize: 8,
  playerSpeed: 8,

  enemyColor: "#fa0",
  enemyColorStyle: 0,
  enemySize: 10,
  enemyHealth: 1,
  enemyBulletColor: "#e00",
  enemyBulletColorStyle: 1,
  enemyBulletDamage: 1,
  enemyBulletSpeed: 7,
  enemyBulletSize: 7,
  enemySpeed: 5,

  bossColor: "#aa0",
  bossColorStyle: 0,
  bossSize: 15,
  bossHealth: 7,
  bossBulletColor: "#f00",
  bossBulletColorStyle: 1,
  bossBulletDamage: 2,
  bossBulletSpeed: 8,
  bossBulletSize: 9,
  bossSpeed: 7,

  botMovingFrequency: 4, // 0:low to 10:high
  botFiringFrequency: 3,
  botEnemySpwanFrequency: 5,
  botBossSpwanFrequency: 3,
  botNumberAtaTime: 6,
  edgeMargin: 5,
  strokeWidth: "2",
  strokeColor: "#00f",
  gameStartDelay: 2,
  FPS: 60,
};

const canvas = document.getElementById("myCanvas");
const div = document.getElementById("mainDiv");
const fpsHTML = document.getElementById("fps");
const scoreHTML = document.getElementById("score");
const ctx = canvas.getContext("2d");
const dpi = window.devicePixelRatio;

const gameState = {};

const charactersState = [];

const bulletStates = [];

window.onload = function () {
  setTimeout(() => {
    init();
  }, config.gameStartDelay * 1000);
};

const fix_dpi = () => {
  //create a style object that returns width and height
  let style = {
    height() {
      return +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    },
    width() {
      return +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
    },
  };
  //set the correct attributes for a crystal clear image!
  canvas.setAttribute("width", style.width() * dpi);
  canvas.setAttribute("height", style.height() * dpi);
};

const draw = {
  drawRect: (x, y, size, colorStyle, fillColor) => {
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    if (colorStyle === 1) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    } else if (colorStyle === 2) {
      ctx.lineWidth = config.strokeWidth;
      ctx.strokeStyle = config.strokeColor;
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.lineWidth = config.strokeWidth;
      ctx.strokeStyle = fillColor;
      ctx.stroke();
    }
  },

  drawChracter: (x, y, angle, size, colorStyle, fillColor) => {
    if (angle === 90) {
      //UP
      draw.drawRect(x, y, size, colorStyle, fillColor);
      draw.drawRect(x - size, y, size, colorStyle, fillColor);
      draw.drawRect(x + size, y, size, colorStyle, fillColor);
      draw.drawRect(x, y - size, size, colorStyle, fillColor);
      draw.drawRect(x - size, y + size, size, colorStyle, fillColor);
      draw.drawRect(x + size, y + size, size, colorStyle, fillColor);
    } else if (angle === 270) {
      // down
      draw.drawRect(x, y, size, colorStyle, fillColor);
      draw.drawRect(x - size, y, size, colorStyle, fillColor);
      draw.drawRect(x + size, y, size, colorStyle, fillColor);
      draw.drawRect(x, y + size, size, colorStyle, fillColor);
      draw.drawRect(x - size, y - size, size, colorStyle, fillColor);
      draw.drawRect(x + size, y - size, size, colorStyle, fillColor);
    } else if (angle === 180) {
      //left
      draw.drawRect(x, y, size, colorStyle, fillColor);
      draw.drawRect(x, y - size, size, colorStyle, fillColor);
      draw.drawRect(x - size, y, size, colorStyle, fillColor);
      draw.drawRect(x, y + size, size, colorStyle, fillColor);
      draw.drawRect(x + size, y - size, size, colorStyle, fillColor);
      draw.drawRect(x + size, y + size, size, colorStyle, fillColor);
    } else if (angle === 0) {
      //right
      draw.drawRect(x, y, size, colorStyle, fillColor);
      draw.drawRect(x, y - size, size, colorStyle, fillColor);
      draw.drawRect(x, y + size, size, colorStyle, fillColor);
      draw.drawRect(x + size, y, size, colorStyle, fillColor);
      draw.drawRect(x - size, y - size, size, colorStyle, fillColor);
      draw.drawRect(x - size, y + size, size, colorStyle, fillColor);
    }
  },
  drawGameOver: () => {
    // drawing game over msg
    ctx.font = "30px Arial";
    ctx.fillText(
      `Game Over`,
      ctx.canvas.width / 2 - 40,
      ctx.canvas.height / 2 - 40
    );
    ctx.fillText(
      `Your score ${gameState.score}`,
      ctx.canvas.width / 2 - 40,
      ctx.canvas.height / 2
    );
  },
};

const inputHandeler = {
  ArrowRight: () => {
    characterPositioner(0, 0);
  },
  ArrowLeft: () => {
    characterPositioner(0, 180);
  },
  ArrowUp: () => {
    characterPositioner(0, 90);
  },
  ArrowDown: () => {
    characterPositioner(0, 270);
  },
  Escape: () => {
    console.log("Escape");
    pause();
  },
  " ": () => {
    console.log(" Space bar");
    createBullet(charactersState[0]);
  },
};

const characterPositioner = (index, angle) => {
  if (charactersState[index].position.angle !== angle) {
    charactersState[index].position.angle = angle;
  }
  charactersState[index].position.x +=
    charactersState[index].speed *
    Math.cos(((angle * Math.PI) / 180).toFixed(2)).toFixed(2);
  charactersState[index].position.y -=
    charactersState[index].speed *
    Math.sin(((angle * Math.PI) / 180).toFixed(2)).toFixed(2);

  if (charactersState[index].position.x <= config.edgeMargin) {
    charactersState[index].position.x = config.edgeMargin;
  } else if (
    charactersState[index].position.x >=
    ctx.canvas.width - config.edgeMargin
  ) {
    charactersState[index].position.x = ctx.canvas.width - config.edgeMargin;
  }

  if (charactersState[index].position.y <= config.edgeMargin) {
    charactersState[index].position.y = config.edgeMargin;
  } else if (
    charactersState[index].position.y >=
    ctx.canvas.height - config.edgeMargin
  ) {
    charactersState[index].position.y = ctx.canvas.height - config.edgeMargin;
  }
};

const createBullet = (c) => {
  bulletStates.push({
    position: {
      x: c.position.x,
      y: c.position.y,
      angle: c.position.angle,
    },
    owner: c.character,
    size: c.bulletSize,
    colorStyle: c.bulletColorStyle,
    color: c.bulletColor,
    speed: c.bulletSpeed,
    damage: c.bulletDamage,
    hitted: false,
  });
};

const gameManager = () => {
  if (gameState.gameOver) {
    // Delete All variables other than game state
    draw.drawGameOver();
    pause();
    // Game over ask for play again
    // then init game
    setTimeout(() => {
      if (confirm(`Game Over Score : ${gameState.score}`)) {
        init();
      }
    }, 3000);
  }
};

const characterManager = () => {
  // checking for health
  charactersState.forEach((e) => {
    if (e.character === "enemy" && e.health <= 0) {
      charactersState.splice(charactersState.indexOf(e), 1); // Delete died enemy
      gameState.score += 3;
    } else if (e.character === "player" && e.health <= 0) {
      gameState.gameOver = true;
    }
  });
};

const robotManager = () => {
  // spwan management
  for (; charactersState.length < config.botNumberAtaTime + 1; ) {
    if (Math.floor(Math.random() * 10 + 1) < config.botEnemySpwanFrequency) {
      spwanEnemy();
    }
    if (Math.floor(Math.random() * 10 + 1) < config.botBossSpwanFrequency) {
      spwanBoss();
    }
  }

  const angles = [0, 90, 180, 270];
  // movement management
  if (robotManager)
    if (Math.floor(Math.random() * 10 + 1) < config.botMovingFrequency) {
      for (let i = 1; i < charactersState.length; i++) {
        if (Math.floor(Math.random() * 10 + 1) < config.botMovingFrequency) {
          characterPositioner(
            i,
            angles[Math.floor(Math.random() * angles.length)]
          );
        }
      }
    }
  // Firing management
  if (Math.floor(Math.random() * 10 + 1) < config.botFiringFrequency) {
    for (let i = 1; i < charactersState.length; i++) {
      if (Math.floor(Math.random() * 10 + 1) < config.botFiringFrequency) {
        createBullet(charactersState[i]);
      }
    }
  }
};

const bulletManager = () => {
  bulletStates.forEach((e) => {
    // make kill
    if (e.owner === "enemy") {
      if (
        Math.abs(charactersState[0].position.x - e.position.x) <=
          charactersState[0].size * 1.5 &&
        Math.abs(charactersState[0].position.y - e.position.y) <=
          charactersState[0].size * 1.5
      ) {
        charactersState[0].health--;
        bulletStates.splice(bulletStates.indexOf(e), 1);
      }
    } else if (e.owner === "player") {
      for (let i = 1; i < charactersState.length; i++) {
        if (
          Math.abs(charactersState[i].position.x - e.position.x) <=
            charactersState[i].size * 1.5 &&
          Math.abs(charactersState[i].position.y - e.position.y) <=
            charactersState[i].size * 1.5
        ) {
          charactersState[i].health--;
          gameState.score++;
          bulletStates.splice(bulletStates.indexOf(e), 1);
        }
      }
    }

    if (
      e.position.x <= 0 ||
      e.position.x >= ctx.canvas.width ||
      e.position.y <= 0 ||
      e.position.y >= ctx.canvas.height
    ) {
      bulletStates.splice(bulletStates.indexOf(e), 1);
    } else {
      e.position.x +=
        e.speed *
        Math.cos(((e.position.angle * Math.PI) / 180).toFixed(2)).toFixed(2);
      e.position.y -=
        e.speed *
        Math.sin(((e.position.angle * Math.PI) / 180).toFixed(2)).toFixed(2);
    }
  });
};

const drawCharacter = () => {
  charactersState.forEach((e) => {
    draw.drawChracter(
      e.position.x,
      e.position.y,
      e.position.angle,
      e.size,
      e.colorStyle,
      e.color
    );
  });
};

const drawBullets = () => {
  bulletStates.forEach((e) => {
    draw.drawRect(e.position.x, e.position.y, e.size, e.colorStyle, e.color);
  });
};

const init = () => {
  document.addEventListener("keydown", (event) => {
    if (event.code == "KeyZ" && (event.ctrlKey || event.metaKey)) {
      alert("Undo! is not valid here!🤣");
    }
    try {
      inputHandeler[event.key]();
    } catch (err) {
      console.log(`Someting happened ${err}`);
    }
  });

  if (gameState.timer) {
    clearInterval(gameState.timer);
  }

  // init game state
  gameState.timer = 0;
  gameState.paused = false;
  gameState.gameOver = false;
  gameState.score = 0;

  // other global variables
  bulletStates.length = 0;
  charactersState.length = 0;

  // init player
  spwanPlayer();

  clock(config.FPS);
};

const spwanPlayer = () => {
  charactersState.push({
    position: {
      x: ctx.canvas.width / 2,
      y: ctx.canvas.height / 2,
      angle: 90,
    },
    character: "player",
    health: config.playerHealth,
    color: config.playerColor,
    colorStyle: config.playerColorStyle,
    size: config.playerSize,
    speed: config.playerSpeed,
    bulletSize: config.playerBulletSize,
    bulletColorStyle: config.playerBulletColorStyle,
    bulletColor: config.playerBulletColor,
    bulletSpeed: config.playerBulletSpeed,
    bulletDamage: config.playerBulletDamage,
  });
};
const spwanEnemy = () => {
  const angles = [0, 90, 180, 270];
  charactersState.push({
    position: {
      x: Math.floor(Math.random() * ctx.canvas.width),
      y: Math.floor(Math.random() * ctx.canvas.height),
      angle: angles[Math.floor(Math.random() * angles.length)],
    },
    character: "enemy",
    health: config.enemyHealth,
    color: config.enemyColor,
    colorStyle: config.enemyColorStyle,
    size: config.enemySize,
    bulletColor: config.enemyBulletColor,
    bulletColorStyle: config.enemyBulletColorStyle,
    bulletDamage: config.enemyBulletDamage,
    bulletSpeed: config.enemyBulletSpeed,
    bulletSize: config.enemyBulletSize,
    speed: config.enemySpeed,
  });
};
const spwanBoss = () => {
  const angles = [0, 90, 180, 270];
  charactersState.push({
    position: {
      x: Math.floor(Math.random() * ctx.canvas.width),
      y: Math.floor(Math.random() * ctx.canvas.height),
      angle: angles[Math.floor(Math.random() * angles.length)],
    },
    character: "enemy",
    health: config.bossHealth,
    color: config.bossColor,
    colorStyle: config.bossColorStyle,
    size: config.bossSize,
    bulletColor: config.bossBulletColor,
    bulletColorStyle: config.bossBulletColorStyle,
    bulletDamage: config.bossBulletDamage,
    bulletSpeed: config.bossBulletSpeed,
    bulletSize: config.bossBulletSize,
    speed: config.bossSpeed,
  });
};

const mainGame = () => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.width);
  fix_dpi();
  robotManager(); //Handels AI
  bulletManager(); // Handel bullets interactions
  characterManager(); // Handels interation b/w characters
  gameManager(); // Handel gamesStates
  drawCharacter();
  drawBullets();
};

const pause = () => {
  if (!gameState.paused) {
    clearInterval(gameState.timer);
    gameState.paused = true;
  } else {
    clock(config.FPS);
    gameState.paused = false;
  }
};

const clock = (fps) => {
  gameState.timer = setInterval(() => {
    const t = Date.now();
    mainGame();
    scoreHTML.innerHTML = `Score : ${gameState.score}           Helth: ${
      charactersState[0] ? charactersState[0].health : ""
    }`;
    fpsHTML.innerHTML = `FPS: ${(1000 / (Date.now() - t + 1000 / fps)).toFixed(
      2
    )}`;
  }, 1000 / fps);
};
