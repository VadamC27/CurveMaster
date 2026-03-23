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
    worldRect.lineStyle(2, 0xffffff);
    worldRect.drawRect(0, 0, width, height);
    worldContainer.addChild(worldRect);

    const goalCircle = new PIXI.Graphics();
    goalCircle.beginFill(0x00ff00);
    goalCircle.drawCircle(goal.x, goal.y, goal.radius);
    goalCircle.endFill();
    worldContainer.addChild(goalCircle);

    for (let obs of obstacles) {
        const obsCircle = new PIXI.Graphics();
        obsCircle.beginFill(0xff0000);
        obsCircle.drawCircle(obs.x, obs.y, obs.radius);
        obsCircle.endFill();
        worldContainer.addChild(obsCircle);
    }   
}

function drawBots(bots: any[]) {
    for (let bot of bots) {
        let botGraphic = botGraphics.get(bot.id);
        if (!botGraphic) {
            botGraphic = new PIXI.Graphics();
            botContainer.addChild(botGraphic);
            botGraphics.set(bot.id, botGraphic);
        }
        botGraphic.clear();
        botGraphic.beginFill(bot.alive ? 0x0000ff : 0x555555);
        botGraphic.drawCircle(0, 0, 10);
        botGraphic.endFill();
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