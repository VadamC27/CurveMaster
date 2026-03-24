"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
// ==== CONFIG ====
const BOT_ID = "bot-" + Math.floor(Math.random() * 10000);
const NAME = "RandomWalker";
const SERVER_URL = "ws://localhost:8080";
// ==== BOT LOGIC ====
function randomAction() {
    return {
        turn: [-1, 0, 1][Math.floor(Math.random() * 3)],
        throttle: [-1, 0, 1][Math.floor(Math.random() * 3)],
    };
}
// opcjonalnie: lekka "stabilizacja", żeby nie drgał jak szalony
let lastAction = randomAction();
let changeCooldown = 0;
function getAction() {
    if (changeCooldown <= 0) {
        lastAction = randomAction();
        changeCooldown = 5 + Math.floor(Math.random() * 10); // kilka ticków stabilności
    }
    changeCooldown--;
    return lastAction;
}
// ==== CONNECTION ====
const ws = new WebSocket(SERVER_URL);
ws.on("open", () => {
    console.log("Connected to server");
    const register = {
        type: "register",
        botId: BOT_ID,
        name: NAME,
    };
    ws.send(JSON.stringify(register));
});
ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());
    switch (msg.type) {
        case "state": {
            const action = getAction();
            const command = {
                type: "command",
                botId: BOT_ID,
                action,
            };
            ws.send(JSON.stringify(command));
            break;
        }
        case "gameOver": {
            console.log("Game Over:", msg.reason, "ticks:", msg.ticks);
            // restart? reconnect?
            ws.close();
            break;
        }
    }
});
ws.on("close", () => {
    console.log("Disconnected");
});
ws.on("error", (err) => {
    console.error("WebSocket error:", err);
});
//# sourceMappingURL=index.js.map