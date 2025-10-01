import { Application, Graphics, Text } from "pixi.js";

const app = new Application();
await app.init({ width: 1280, height: 720, background: "#000" });
document.body.appendChild(app.canvas);

const ship = new Graphics();
ship.poly([0, 0, -20, 40, 20, 40]);
ship.fill(0x00ffcc);
ship.x = app.screen.width / 2;
ship.y = app.screen.height - 60;
app.stage.addChild(ship);

let bullets: Graphics[] = [];
let asteroids: Graphics[] = [];

for (let i = 0; i < 6; i++) {
  const a = new Graphics();
  a.circle(0, 0, 30);
  a.fill(0xff6600);
  a.x = Math.random() * (app.screen.width - 100) + 50;
  a.y = Math.random() * 300 + 50;
  app.stage.addChild(a);
  asteroids.push(a);
}

let timeLeft = 60;
const timerText = new Text(`Time: ${timeLeft}`, { fill: "#fff", fontSize: 28 });
timerText.x = 20;
timerText.y = 20;
app.stage.addChild(timerText);

setInterval(() => {
  if (timeLeft > 0) {
    timeLeft--;
    timerText.text = `Time: ${timeLeft}`;
  }
}, 1000);

let left = false;
let right = false;
let canShoot = true;
let shots = 10;
let gameOver = false;


window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") left = true;
  if (e.code === "ArrowRight") right = true;
  if (e.code === "Space" && canShoot && shots > 0) {
    shots--;
    shoot();
    canShoot = false;
    setTimeout(() => (canShoot = true), 250);
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") left = false;
  if (e.code === "ArrowRight") right = false;
});

function shoot() {
  const b = new Graphics();
  b.rect(-2, -10, 4, 10);
  b.fill(0xffffff);
  b.x = ship.x;
  b.y = ship.y - 20;
  app.stage.addChild(b);
  bullets.push(b);
}

function hit(a: Graphics, b: Graphics) {
  const ab = a.getBounds();
  const bb = b.getBounds();
  return (
    ab.x < bb.x + bb.width &&
    ab.x + ab.width > bb.x &&
    ab.y < bb.y + bb.height &&
    ab.y + ab.height > bb.y
  );
}

let msg = new Text("", { fill: "#fff", fontSize: 60 });
msg.anchor.set(0.5);
msg.x = app.screen.width / 2;
msg.y = app.screen.height / 2;
app.stage.addChild(msg);

let boss: Graphics;
let bossHp = 0;
let bossBullets: Graphics[] = [];
let bossHpText: Text;
let bossDirection = 1;
let level2Started = false;
let level2 = false;


function startLevel2() {
  if (level2Started) return; // запобігає повторному старту рівня
  level2Started = true;
  level2 = true;
  shots = 10;
  bossHp = 4;

  boss = new Graphics();
  boss.rect(-50, -30, 100, 60);
  boss.fill(0xff0000);
  boss.x = app.screen.width / 2;
  boss.y = 150;
  app.stage.addChild(boss);

  bossHpText = new Text(`Boss HP: ${bossHp}`, { fill: "#fff", fontSize: 28 });
  bossHpText.anchor.set(0.5);
  bossHpText.x = boss.x;
  bossHpText.y = boss.y - 50;
  app.stage.addChild(bossHpText);

  const shootInterval = setInterval(() => {
    if (!gameOver && level2 && bossHp > 0) {
      const bb = new Graphics();
      bb.rect(-3, -10, 6, 20);
      bb.fill(0xff00ff);
      bb.x = boss.x;
      bb.y = boss.y + 40;
      app.stage.addChild(bb);
      bossBullets.push(bb);
    }
  }, 2000);

  const level2Ticker = () => {
    if (gameOver || bossHp <= 0) {
      clearInterval(shootInterval);
      level2 = false;
      app.stage.removeChild(boss);
      app.stage.removeChild(bossHpText);
      bossBullets.forEach(b => app.stage.removeChild(b));
      bossBullets = [];
      app.ticker.remove(level2Ticker);
      endGame("YOU WIN");
      return;
    }

    boss.x += bossDirection * 3;
    if (boss.x < 60 || boss.x > app.screen.width - 60) bossDirection *= -1;

    bossHpText.x = boss.x;
    bossHpText.y = boss.y - 50;

    bullets.forEach((b, bi) => {
      if (hit(b, boss)) {
        bossHp--;
        bossHpText.text = `Boss HP: ${bossHp}`;
        app.stage.removeChild(b);
        bullets.splice(bi, 1);
      }
    });

    bossBullets.forEach((bb, i) => {
      bb.y += 5;
      if (bb.y > app.screen.height + 20) {
        app.stage.removeChild(bb);
        bossBullets.splice(i, 1);
      }

      if (hit(bb, ship)) {
        app.stage.removeChild(bb);
        bossBullets.splice(i, 1);
        endGame("YOU LOSE");
      }
    });
  };

  app.ticker.add(level2Ticker);
}




function endGame(text: string) {
  msg.text = text;
  gameOver = true;
  if (text === "YOU WIN" && asteroids.length === 0) {
    setTimeout(() => {
      msg.text = "";
      gameOver = false;
      bullets = [];
      startLevel2();
    }, 1500);
  }
}

app.ticker.add(() => {
  if (gameOver) return;

  if (left && ship.x > 40) ship.x -= 5;
  if (right && ship.x < app.screen.width - 40) ship.x += 5;

  bullets.forEach((b, i) => {
    b.y -= 8;
    if (b.y < -20) {
      app.stage.removeChild(b);
      bullets.splice(i, 1);
    }
  });

  if (!level2) {
    bullets.forEach((b, bi) => {
      asteroids.forEach((a, ai) => {
        if (hit(b, a)) {
          app.stage.removeChild(b);
          app.stage.removeChild(a);
          bullets.splice(bi, 1);
          asteroids.splice(ai, 1);
        }
      });
    });

    if (asteroids.length === 0) {
      endGame("YOU WIN");
    } else if ((shots === 0 && bullets.length === 0) || timeLeft === 0) {
      endGame("YOU LOSE");
    }
  }

  if (level2) {
    boss.x += bossDirection * 3;
    if (boss.x < 60 || boss.x > app.screen.width - 60) bossDirection *= -1;

    bullets.forEach((b, bi) => {
      if (hit(b, boss)) {
        bossHp--;
        bossHpText.text = `Boss HP: ${bossHp}`;
        bossHpText.x = boss.x;
        app.stage.removeChild(b);
        bullets.splice(bi, 1);

        if (bossHp === 0) {
          endGame("YOU WIN");
        }
      }
    });

    bossBullets.forEach((b, i) => {
      b.y += 5;
      if (b.y > app.screen.height + 20) {
        app.stage.removeChild(b);
        bossBullets.splice(i, 1);
      }
    });

    bossBullets.forEach((bb, i) => {
      if (hit(bb, ship)) {
        endGame("YOU LOSE");
      }
    });

    if ((shots === 0 && bullets.length === 0) || timeLeft === 0) {
      endGame("YOU LOSE");
    }
  }
});
