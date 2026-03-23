import type { Bot, BotAction, Circle } from "../../../types/GameTypes.js";
import { GAME_CONFIG } from "./GameConfig.js";

export class Physics {
    static updateBot(bot: Bot, action: BotAction) {
        if (!bot.isAlive) return;
        
        bot.angle += action.turn * GAME_CONFIG.TURN_SPEED;
    
        bot.velocity += action.throttle * GAME_CONFIG.ACCELERATION;     
        bot.velocity = Math.max(0, Math.min(bot.velocity, GAME_CONFIG.MAX_VELOCITY));
    
        bot.x += Math.cos(bot.angle) * bot.velocity;
        bot.y += Math.sin(bot.angle) * bot.velocity;
    }

    static  isColliding(a:Circle, b:Circle): boolean {
        const dx = a.x - b.x; 
        const dy = a.y - b.y;
    
        const distance = Math.sqrt(Math.pow(dx,2) + Math.pow(dy, 2));

        if (distance < a.radius + b.radius) {
            return true;
        } 

        return false;
    }

    static checkObstacleCollisions(bot: Bot, obstacles: Circle[]): boolean {
        let botCircle: Circle = { x: bot.x, y: bot.y, radius: GAME_CONFIG.BOT_RADIUS };

        for (let obs of obstacles) {
            if (this.isColliding(botCircle, obs)) {
                return true;
            }
        }
    
        return false;
    }

    static checkGoalReached(bot: Bot, goal: Circle): boolean {
        let dx = bot.x - goal.x;
        let dy = bot.y - goal.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < GAME_CONFIG.GOAL_RADIUS + GAME_CONFIG.BOT_RADIUS) {
            return true;
        }
        return false;
    }

    static isOutOfBounds(bot: Bot): boolean {
        if (bot.x < 0 || bot.x > GAME_CONFIG.WORLD_WIDTH || bot.y < 0 || bot.y > GAME_CONFIG.WORLD_HEIGHT) {
            return true;
        }
        return false;
    }
}