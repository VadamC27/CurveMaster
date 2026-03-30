# CurveMaster

install

`npm i`

Run

`npm run dev`

## API

Conect bots via websocket - default would be `ws://localhost:8080`

### Client-side messages

In sent message type field must alaways appear and have correct value, only then message is processed.

#### register

This message will spawn bot in the game and allow user to control it via messages of type "command". It should be sent as first message after connection.

```ts
{
    "type": "register",
    "botId": string, 
    "name": string
 }
 ```  

`botId` must be unique, recomended aproach is to fill it with name + random number

`name` is only for display pourposes, although it's required.

#### command

This message sets next move made by bot. It should be sent once per game tick, as sending it more often will result in only last message before tick to be considered.

```ts
{
    "type": "command",
    "botId": string;
    "action": {
        "turn": -1 | 0 | 1,
        "throttle": -1 | 0 | 1
    }
}
```

`botId` Must be the same as one declared in register. It is left here for future possible API extension for multiple bots per websocket. Currently only one bot per connection is allowed.

`action.turn` tells bot to keep turing left (-1) or tight (1). To go in straight line send 0.

`action.throttle` increasces velocity, although remember that there is max speed cap. -1 slows bot down.

### Server-side messages

#### state

This is message sent each tick to each registered and alive bot.

```ts
{
    "type": "state"
    "tick": number
    "sensors": {
        "angleToGoal": number
        "distanceToGoal": number
        "sensorReadings": number[]
    }
}
  ```

`sensors` is a collection of bot's knowledge.

`sensors.angelToGoal` is an angle in radians between front of a bot and the center of target.

`sensors.distanceToGoal` is a distance in units between center of bot and center of target. Note that target might be reached before distance is 0, as bot and target has it's volume.

`sensors.sensorReadings` is an array including sensor readings from most left to most right sensor looking from bot's front. In default there are 5 sensors, left, center-left, center, center-right and right.
