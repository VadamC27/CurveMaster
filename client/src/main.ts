import * as PIXI from "pixi.js";

const app = new PIXI.Application();
document.body.appendChild(app.view);

const bot = new PIXI.Graphics();
bot.beginFill(0xff0000);
bot.drawCircle(0, 0, 10);
bot.endFill();
app.stage.addChild(bot);

const ws = new WebSocket("ws://localhost:8080");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "state") {
    const b = data.state.bots[0];
    bot.x = b.x;
    bot.y = b.y;
  }
};