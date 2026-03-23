export type Circle = {
    x: number;
    y: number;
    radius: number;

}

 export type Bot = {
    id: string;
    name: string;
    x: number;
    y: number;
    angle: number;
    velocity: number;
    isAlive: boolean;
    isGoalreached: boolean;
 }

 export type BotAction = {
    turn: -1 | 0 | 1;
    throttle: -1 | 0 | 1;
 }

 export type BotKnowledge = {
    angleToGoal: number;
    distanceToGoal: number;
    sensorReadings: number[];
}

export type WorldData = {
    width: number;
    height: number;
    goal: Circle;
    obstacles: Circle[];
    spawnX: number;
    spawnY: number;
}

export type GameState = {
    tick: number;
    bots: Bot[];
    world: WorldData;
    timeLimit: number | null;
}