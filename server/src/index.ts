import { WebSocketServer } from 'ws';
import { GameEngine } from "./engine/GameEngine.js";
import { WebSocketManager } from "./network/WebSocketManager.js";
import type { WorldData } from '../../types/GameTypes.ts';
import { GAME_CONFIG } from './engine/GameConfig.js';

const wss = new WebSocketServer({ port: 8080 });

const world: WorldData = {
    width: GAME_CONFIG.WORLD_WIDTH,
    height: GAME_CONFIG.WORLD_HEIGHT,
    goal: {
        x: 700,
        y: 300,
        radius: GAME_CONFIG.GOAL_RADIUS,
    },
    obstacles: [
        { x: 200, y: 200, radius: 40 },
        { x: 400, y: 300, radius: 50 },
        { x: 600, y: 400, radius: 35 },
    ],
    spawnX: 30,
    spawnY: 30
};

const gameEngine = new GameEngine(world, GAME_CONFIG.DEFAULT_TIME_LIMIT);
const wsManager = new WebSocketManager();


gameEngine.setSensorUpdateCallback((botId: any, sensors: any) => {
  wsManager.sendToBot(botId, sensors);
});

gameEngine.setGameEndCallback((event: { botId: any; reason: any; tick: any; }) => {
  wsManager.sendToBot(event.botId, {
    type: 'gameOver',
    reason: event.reason,
    ticks: event.tick,
  });
});

wsManager.onBotRegisterCallback((botId: any, name: any) => {
  console.log(`Bot registered: ${botId} (${name})`);
  gameEngine.addNewBot(botId, name);
});

wsManager.onBotCommandCallback((botId: any, action: any) => {
  gameEngine.setBotAction(botId, action);
});

wss.on('connection', (ws) => {
  console.log('New connection');
  wsManager.addConnection(ws);
});

setInterval(() => {
  gameEngine.tick();
  wsManager.broadcastToViewers(gameEngine.getState());
}, 1000 / GAME_CONFIG.TICK_RATE);

console.log('CurveMaster server running on ws://localhost:8080');
console.log(`Tick rate: ${GAME_CONFIG.TICK_RATE} Hz`);
console.log(`World: ${world.width}x${world.height}`);