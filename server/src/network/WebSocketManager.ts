import type { WebSocket } from "ws";
import type { BotMessage, ServerMessage, ViewerStateMessage } from "./Protocol.js";
import type { GameState } from "../../../types/GameTypes.js";
import { performance } from "node:perf_hooks";

type ClientType = 'bot' | 'viewer';

type Client = {
    ws: WebSocket;
    type: ClientType;
    botId?: string;
    timestamp?: number; 
}

export class WebSocketManager {
    private clients: Map<WebSocket, Client> = new Map();

    private onBotRegister?: (botId: string, name: string, timestamp: number) => void;
    private onBotCommand?: (botId: string, action: any) => void;

    addConnection(ws: WebSocket): void {
        this.clients.set(ws, { ws, type: 'viewer' });

        ws.on('message', (message) => {
            this.handleMessage(ws, message.toString())
        });

        ws.on('close', () => {
           this.clients.delete(ws);
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
            this.clients.delete(ws);
        });
    }

    private handleMessage(ws: WebSocket, raw: string): void {
        try {
            const msg: BotMessage = JSON.parse(raw);

            if (msg.type === 'register') {
                this.clients.set(ws, { ws, type: 'bot', botId: msg.botId });
            
                if (this.onBotRegister) {
                    this.onBotRegister(msg.botId, msg.name, performance.now());
                }
            }

            if (msg.type === 'command') {
                if (this.onBotCommand) {
                   this.onBotCommand(msg.botId, msg.action);
                }
            }

        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    sendToBot(botId: string, message: ServerMessage): void {
        for (let client of this.clients.values()) {
            if(client.type === 'bot' && client.botId === botId) {
                client.ws.send(JSON.stringify(message));
            }
        }
    }
    broadcastToViewers(state: GameState, lastSensors: Map<string, number[]>): void {
        let message: ViewerStateMessage = {
            type: 'viewerState',
            tick: state.tick,
            bots: Array.from(state.bots).map(bot => ({
                id: bot.id,
                name: bot.name,
                x: bot.x,
                y: bot.y,
                angle: bot.angle,
                velocity: bot.velocity,
                alive: bot.isAlive,
                reachedGoal: bot.isGoalreached,
                sensorReadings: lastSensors.get(bot.id) ?? []
            })),
            world: {   
                width: state.world.width,   
                height: state.world.height,
                goal: state.world.goal,
                obstacles: state.world.obstacles
            }
        };

        const payload = JSON.stringify(message);

        for (let client of this.clients.values())   {
            if (client.type === 'viewer') {
                client.ws.send(payload);
            }
        }
    }

    onBotRegisterCallback(cb: (botId: string, name: string, timestamp: number) => void): void {
        this.onBotRegister = cb;
    }

    onBotCommandCallback(cb: (botId: string, action: any) => void): void {
        this.onBotCommand = cb;
    }
}