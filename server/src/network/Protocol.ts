export type BotRegisterMessage = {
  type: 'register';
  botId: string;
  name: string;
};

export type BotCommandMessage = {
  type: 'command';
  botId: string;
  action: {
    turn: -1 | 0 | 1;
    throttle: -1 | 0 | 1;
  };
};

export type BotMessage = BotRegisterMessage | BotCommandMessage;

export type ServerStateMessage = {
  type: 'state';
  tick: number;
  sensors: {
    angleToGoal: number;
    distanceToGoal: number;
    obstacles: number[];
  };
};

export type ServerGameOverMessage = {
  type: 'gameOver';
  reason: 'goal' | 'collision' | 'timeout' | 'out_of_bounds';
  ticks: number;
};

export type ServerMessage = ServerStateMessage | ServerGameOverMessage;

export type ViewerStateMessage = {
  type: 'viewerState';
  tick: number;
  bots: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    angle: number;
    velocity: number;
    alive: boolean;
    reachedGoal: boolean;
  }>;
  world: {
    width: number;
    height: number;
    goal: { x: number; y: number; radius: number };
    obstacles: Array<{ x: number; y: number; radius: number }>;
  };
};