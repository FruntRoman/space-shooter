import { Application, Graphics, Text } from "pixi.js";

const app = new Application();
await app.init({ width: 1280, height: 720, background: "#000" });
document.body.appendChild(app.canvas);

// корабель
const ship = new Graphics();

ship.poly([0, 0, -20, 40, 20, 40]);
ship.fill(0x00ffcc);
ship.x = app.screen.width / 2;
ship.y = app.screen.height - 60;
app.stage.addChild(ship);

// масиви
let bullets: Graphics[] = [];
let asteroids: Graphics[] = [];

// створюємо кілька астероїдів
for (let i = 0; i < 6; i++) {
  const a = new Graphics();
  a.circle(0, 0, 30);
  a.fill(0xff6600);
  
  a.x = Math.random() * (app.screen.width - 100) + 50;
  a.y = Math.random() * 300 + 50;
  app.stage.addChild(a);
  asteroids.push(a);
}

let left = false;
let right = false;
let canShoot = true;
let shots = 10;

// таймер
let timeLeft = 60;
const timerText =  new Text(`Time: ${timeLeft}`, { fill: "#fff", fontSize: 28 });
timerText.x = 20;
timerText.y = 20;
app.stage.addChild(timerText);

setInterval(() => {
  if (timeLeft > 0) {
    timeLeft--;
    timerText.text = `Time: ${timeLeft}`;
  }
}, 1000);

// управління
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

// стрільба
function shoot() {
  const b = new Graphics();
  b.rect(-2, -10, 4, 10);
  b.fill(0xffffff);
  b.x = ship.x;
  b.y = ship.y - 20;
  app.stage.addChild(b);
  bullets.push(b);
}

// колізія прямокутниками
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

let gameOver = false;

const msg = new Text("", { fill: "#fff", fontSize: 60 });
msg.anchor.set(0.5);
msg.x = app.screen.width / 2;
msg.y = app.screen.height / 2;
app.stage.addChild(msg);

// апдейт
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
});

function endGame(text: string) {
  msg.text = text;
  gameOver = true;
}


