
export type Direction = "up" | "down" | "left" | "right";

export enum PowerUpType {
    SPEED = "speed",
    INVINCIBLE = "invincible",
    DOUBLE = "double",
}

export interface Coords {
    x: number;
    y: number;
}

export interface PowerUp extends Coords {
    type: PowerUpType;
}

export interface GameState {
    snake: Coords[];
    direction: Direction;
    food: Coords;
    powerUp: PowerUp | null;
    points: number;
    highScore: number;
    speed: number;
    invincibleTimer: number;
    doublePointsTimer: number;
    isGameOver: boolean;
}
