import * as PIXI from 'pixi.js';

const app = new PIXI.Application();
await app.init({
  width: 800,
  height: 600,
  background: '#1a1a1a'
});
document.body.appendChild(app.canvas);

const worldContainer = new PIXI.Container();
const botContainer = new PIXI.Container();
const uiContainer = new PIXI.Container();

app.stage.addChild(worldContainer);
app.stage.addChild(botContainer);
app.stage.addChild(uiContainer);

const botGraphics = new Map<string, PIXI.Graphics>();

const tickText = new PIXI.Text({
  text: 'Tick: 0',
  style: { fontSize: 16, fill: 0xffffff }
});
tickText.x = 10;
tickText.y = 10;
uiContainer.addChild(tickText);

const ws = new WebSocket('ws://localhost:8080');

function drawWorld(world: any) {
    const { width, height, goal, obstacles } = world;

    const worldRect = new PIXI.Graphics();
    worldRect.rect(0, 0, width, height);
    worldRect.stroke({ width: 2, color: 0xffffff });
    worldContainer.addChild(worldRect);

    const goalCircle = new PIXI.Graphics();
    goalCircle.circle(goal.x, goal.y, goal.radius);
    goalCircle.fill({ color: 0x00ff00, alpha: 0.6 });
    worldContainer.addChild(goalCircle);

    for (let obs of obstacles) {
        const obsCircle = new PIXI.Graphics();
        obsCircle.circle(obs.x, obs.y, obs.radius);
        obsCircle.fill({ color: 0xff3300, alpha: 0.8 });
        worldContainer.addChild(obsCircle);
    }
}

const SENSOR_ANGLES = [-0.5, -0.25, 0, 0.25, 0.5];
const SENSOR_MAX_RANGE = 150;

function drawBots(bots: any[]) {
    for (let bot of bots) {
        let botGraphic = botGraphics.get(bot.id);
        if (!botGraphic) {
            botGraphic = new PIXI.Graphics();
            botContainer.addChild(botGraphic);
            botGraphics.set(bot.id, botGraphic);
        }
        botGraphic.clear();

        // LiDAR rays (draw before bot body so body renders on top)
        if (bot.alive && bot.sensorReadings?.length) {
            for (let i = 0; i < SENSOR_ANGLES.length; i++) {
                const rayAngle = bot.angle + SENSOR_ANGLES[i];
                const dist = bot.sensorReadings[i] ?? SENSOR_MAX_RANGE;
                const hitObstacle = dist < SENSOR_MAX_RANGE;

                botGraphic.moveTo(0, 0);
                botGraphic.lineTo(
                    Math.cos(rayAngle) * dist,
                    Math.sin(rayAngle) * dist
                );
                botGraphic.stroke({ width: 1, color: hitObstacle ? 0xff4444 : 0x444444, alpha: 0.6 });
            }
        }

        // Direction indicator
        botGraphic.moveTo(0, 0);
        botGraphic.lineTo(16, 0);
        botGraphic.stroke({ width: 2, color: 0xffffff, alpha: 0.9 });

        // Bot body
        botGraphic.circle(0, 0, 10);
        botGraphic.fill({ color: bot.alive ? 0x0055ff : 0x555555 });

        botGraphic.x = bot.x;
        botGraphic.y = bot.y;
        botGraphic.rotation = bot.angle;
    }
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'viewerState') {
    tickText.text = `Tick: ${data.tick}`;

    // Narysuj świat (tylko raz)
    if (worldContainer.children.length === 0) {
      drawWorld(data.world);
    }

    drawBots(data.bots);
  }
};