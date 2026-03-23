import type { BotAction, GameState, WorldData } from "../../../types/GameTypes.js";
import { GAME_CONFIG } from "./GameConfig.js";
import { Physics } from "./Physics.js";
import { Sensors } from "./Sensors.js";

export type GameEndReason = 'goal' | 'collision' | 'timeout' | 'out_of_bounds';

export type GameEndEvent = {
  botId: string;
  reason: GameEndReason;
  tick: number;
};

export class GameEngine {
    private state: GameState;
    private botActions: Map<string, BotAction>

    private onSensorUpdate?: (botId: string, sensors: any) => void;
    private onGameEnd? : (event: GameEndEvent) => void;

    constructor(world: WorldData, timeLimit: number | null = null) {
        this.state = {
            tick: 0,
            bots: [],
            world,
            timeLimit
        };
        this.botActions = new Map();
    }

    addNewBot(id: string, name: string) {
        this.state.bots.push({
            id,
            name,
            x: this.state.world.spawnX,
            y: this.state.world.spawnY,
            angle: 0,
            velocity: 0,
            isAlive: true,
            isGoalreached: false
        });
    }

    setBotAction(botId: string, action: BotAction) {
        this.botActions.set(botId, action);
    }

    tick() : void {    
        for(let bot of this.state.bots) {
            if(!bot.isAlive || bot.isGoalreached) continue;
            const sensors = Sensors.computeSensorReadings(bot, this.state.world);

            if (this.onSensorUpdate) {
                this.onSensorUpdate(bot.id, {
                    type: 'state',
                    tick: this.state.tick,
                    sensors,
                });
            }

            let action = this.botActions.get(bot.id) || { turn: 0, throttle: 0 };
 
            Physics.updateBot(bot, action);

            if (Physics.checkObstacleCollisions(bot, this.state.world.obstacles)) {
                bot.isAlive = false;
                this.endGame(bot.id, 'collision');
                continue;
            }

            if (Physics.isOutOfBounds(bot)) {
                bot.isAlive = false;
                this.endGame(bot.id, 'out_of_bounds');
                continue;
            }

            if (Physics.checkGoalReached(bot, this.state.world.goal)) {
                bot.isAlive = false;
                bot.isGoalreached = true;
                this.endGame(bot.id, 'goal');
            }
        }

        if (this.state.timeLimit !== null && this.state.tick >= this.state.timeLimit) {
            for (const bot of this.state.bots) {
                if (bot.isAlive) {
                    bot.isAlive = false;
                    this.endGame(bot.id, 'timeout');
                }
            }
        }

        this.state.tick++;   
    }

    endGame(id: string, reason: GameEndReason) {
        if (this.onGameEnd) {
            this.onGameEnd({ botId: id, reason, tick: this.state.tick });
        }
    }

    getState() : GameState {
        return this.state;
    }

    setSensorUpdateCallback(cb: (botId: string, sensors: any) => void) {
        this.onSensorUpdate = cb;
    }
    
    setGameEndCallback(cb: (event: { botId: string; reason: GameEndReason; tick: number; }) => void) {
        this.onGameEnd = cb;
    }
}