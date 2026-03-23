import { type Bot, type BotKnowledge, type Circle, type WorldData } from "../../../types/GameTypes.js";
import { GAME_CONFIG } from "./GameConfig.js";
import { Physics } from "./Physics.js";

export class Sensors {
    static computeSensorReadings(bot: Bot, world: WorldData): BotKnowledge {
    
        return {
            angleToGoal: this.computeAngleToGoal(bot, world.goal),
            distanceToGoal: this.computeDistanceToGoal(bot, world.goal),
            sensorReadings: this.computeObstacleSensors(bot, world.obstacles)
        }
    }

    static computeObstacleSensors(bot: any, obstacles: any): number[] {
        return GAME_CONFIG.SENSOR_ANGLES.map(offset => {
            const rayAngle = bot.angle + offset;
            return this.raycast(bot.x, bot.y, rayAngle, obstacles);
        });
    }

   static computeDistanceToGoal(bot: any, goal: any): number {
        let dx = goal.x - bot.x;
        let dy = goal.y - bot.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    
    static computeAngleToGoal(bot: any, goal: any): number {
        let dx = goal.x - bot.x;
        let dy = goal.y - bot.y;
        let targetAngle = Math.atan2(dy, dx);
        let angleDiff = targetAngle - bot.angle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        return angleDiff / Math.PI;
    }

    static raycast(x: number, y: number, angle: number, obstacles: Circle[]): number {
        let dx = Math.cos(angle) * GAME_CONFIG.STEP_SIZE;
        let dy = Math.sin(angle) * GAME_CONFIG.STEP_SIZE;
        let distance = 0;   
        let currentX = x;
        let currentY = y;
    
        while (distance < GAME_CONFIG.SENSOR_MAX_RANGE) {
            currentX += dx;
            currentY += dy;
            distance += GAME_CONFIG.STEP_SIZE;
            for(let obstacle of obstacles) {
                if( Physics.isColliding({ x: currentX, y: currentY, radius: 0 }, obstacle)) {
                    return distance;
                }
            }
        }
        return GAME_CONFIG.SENSOR_MAX_RANGE;
    }    
}