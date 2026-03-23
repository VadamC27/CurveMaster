export const GAME_CONFIG = {
    //WORLD CONFIG
    WORLD_WIDTH: 800,
    WORLD_HEIGHT: 600,
    GOAL_RADIUS: 20,
    BOT_RADIUS: 10,

    //Bot physics
    TURN_SPEED: 0.1,
    ACCELERATION: 0.2,
    MAX_VELOCITY: 5,
    SENSOR_ANGLES: [-0.5, -0.25, 0, 0.25, 0.5], 
    SENSOR_MAX_RANGE: 150,
    STEP_SIZE: 2,

    //GAME LOOP
    TICK_RATE: 20,
    DEFAULT_TIME_LIMIT: 12000, // seconds

} as const;