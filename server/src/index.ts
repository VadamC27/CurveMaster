import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const clients = new Set<any>();

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("message", (msg) => {
    console.log("Received:", msg.toString());
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

const TICK_RATE = 20;

setInterval(() => {
  const state = {
    bots: [{ id: 1, x: Math.random() * 100, y: Math.random() * 100 }],
  };

  const payload = JSON.stringify({ type: "state", state });

  clients.forEach((c) => c.send(payload));
}, 1000 / TICK_RATE);

console.log("Server running on ws://localhost:8080");