import WebSocket = require("ws");

// ==== CONFIG ====
const BOT_ID = "bot-" + Math.floor(Math.random() * 10000);
const NAME = "RandomWalker";
const SERVER_URL = "ws://localhost:8080";

// ==== TYPES (zgodne z Twoimi) ====
type BotRegisterMessage = {
  type: "register";
  botId: string;
  name: string;
};

type BotCommandMessage = {
  type: "command";
  botId: string;
  action: {
    turn: -1 | 0 | 1;
    throttle: -1 | 0 | 1;
  };
};

type ServerStateMessage = {
  type: "state";
  tick: number;
  sensors: {
    angleToGoal: number;
    distanceToGoal: number;
    obstacles: number[];
  };
};

type ServerGameOverMessage = {
  type: "gameOver";
  reason: "goal" | "collision" | "timeout" | "out_of_bounds";
  ticks: number;
};

type ServerMessage = ServerStateMessage | ServerGameOverMessage;

// ==== BOT LOGIC ====

function randomAction(): BotCommandMessage["action"] {
  return {
    turn: ([-1, 0, 1] as const)[Math.floor(Math.random() * 3)]  as 1 | 0 | -1 ,
    throttle: ([-1, 0, 1] as const)[Math.floor(Math.random() * 3)] as 1 | 0 | -1,
  };
}

// opcjonalnie: lekka "stabilizacja", żeby nie drgał jak szalony
let lastAction = randomAction();
let changeCooldown = 0;

function getAction(): BotCommandMessage["action"] {
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

  const register: BotRegisterMessage = {
    type: "register",
    botId: BOT_ID,
    name: NAME,
  };

  ws.send(JSON.stringify(register));
});

ws.on("message", (data) => {
  const msg: ServerMessage = JSON.parse(data.toString());

  switch (msg.type) {
    case "state": {
      const action = getAction();

      const command: BotCommandMessage = {
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