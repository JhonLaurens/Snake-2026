
import { useReducer, useCallback, useRef, useEffect } from 'react';
import { GameState, Direction, PowerUpType, Coords, PowerUp } from '../types';
import { TILE_SIZE, INITIAL_SPEED, FAST_SPEED, POWERUP_CHANCE, POWERUP_DURATION_TICKS, FAST_SPEED_DURATION_MS } from '../constants';

type Action =
    | { type: 'START_GAME' }
    | { type: 'CHANGE_DIRECTION'; payload: Direction }
    | { type: 'GAME_TICK' }
    // Fix: Added RESET_SPEED action to handle speed power-up timeout correctly.
    | { type: 'RESET_SPEED' };
    
const getBoardDimensions = () => {
    const availableHeight = window.innerHeight - 200;
    const availableWidth = window.innerWidth - 40;
    const COLS = Math.floor(availableWidth / TILE_SIZE);
    const ROWS = Math.floor(availableHeight / TILE_SIZE);
    return { COLS, ROWS };
};

const randPos = (snake: Coords[] = []): Coords => {
    const { COLS, ROWS } = getBoardDimensions();
    let pos: Coords;
    do {
        pos = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS),
        };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
};

const getInitialState = (): GameState => {
    const initialSnake = [{ x: Math.floor(getBoardDimensions().COLS / 2), y: Math.floor(getBoardDimensions().ROWS / 2) }];
    return {
        snake: initialSnake,
        direction: 'right',
        food: randPos(initialSnake),
        powerUp: null,
        points: 0,
        highScore: parseInt(localStorage.getItem('snake2026_highScore') || '0', 10),
        speed: INITIAL_SPEED,
        invincibleTimer: 0,
        doublePointsTimer: 0,
        isGameOver: true,
    };
};

const gameReducer = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'START_GAME':
            const newHighScore = Math.max(state.points, state.highScore);
            if(newHighScore > state.highScore) {
                localStorage.setItem('snake2026_highScore', String(newHighScore));
            }
            return {
                ...getInitialState(),
                highScore: newHighScore,
                isGameOver: false,
            };
        case 'CHANGE_DIRECTION':
            const newDirection = action.payload;
            const { direction } = state;
            if (
                (newDirection === 'up' && direction !== 'down') ||
                (newDirection === 'down' && direction !== 'up') ||
                (newDirection === 'left' && direction !== 'right') ||
                (newDirection === 'right' && direction !== 'left')
            ) {
                return { ...state, direction: newDirection };
            }
            return state;
        case 'GAME_TICK':
            if (state.isGameOver) return state;

            const newSnake = [...state.snake];
            const head = { ...newSnake[0] };

            switch (state.direction) {
                case 'up': head.y--; break;
                case 'down': head.y++; break;
                case 'left': head.x--; break;
                case 'right': head.x++; break;
            }

            const { COLS, ROWS } = getBoardDimensions();
            const isWallCollision = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
            const isSelfCollision = newSnake.some(s => s.x === head.x && s.y === head.y);

            if (state.invincibleTimer <= 0 && (isWallCollision || isSelfCollision)) {
                return { ...state, isGameOver: true, speed: INITIAL_SPEED };
            }
            
            // Allow wrapping around walls when invincible
            if (state.invincibleTimer > 0 && isWallCollision) {
                if (head.x < 0) head.x = COLS - 1;
                if (head.x >= COLS) head.x = 0;
                if (head.y < 0) head.y = ROWS - 1;
                if (head.y >= ROWS) head.y = 0;
            }

            newSnake.unshift(head);

            let newPoints = state.points;
            let newFood = state.food;
            let newPowerUp = state.powerUp;
            let newSpeed = state.speed;
            let newInvincibleTimer = Math.max(0, state.invincibleTimer - 1);
            let newDoublePointsTimer = Math.max(0, state.doublePointsTimer - 1);

            if (head.x === newFood.x && head.y === newFood.y) {
                newPoints += (newDoublePointsTimer > 0 ? 2 : 1);
                newFood = randPos(newSnake);
                if (Math.random() < POWERUP_CHANCE && !newPowerUp) {
                    const types: PowerUpType[] = [PowerUpType.SPEED, PowerUpType.INVINCIBLE, PowerUpType.DOUBLE];
                    const type = types[Math.floor(Math.random() * types.length)];
                    newPowerUp = { ...randPos(newSnake), type };
                }
            } else {
                newSnake.pop();
            }

            if (newPowerUp && head.x === newPowerUp.x && head.y === newPowerUp.y) {
                switch (newPowerUp.type) {
                    case PowerUpType.SPEED:
                        newSpeed = FAST_SPEED;
                        break;
                    case PowerUpType.INVINCIBLE:
                        newInvincibleTimer = POWERUP_DURATION_TICKS;
                        break;
                    case PowerUpType.DOUBLE:
                        newDoublePointsTimer = POWERUP_DURATION_TICKS;
                        break;
                }
                newPowerUp = null;
            }

            return {
                ...state,
                snake: newSnake,
                points: newPoints,
                food: newFood,
                powerUp: newPowerUp,
                speed: newSpeed,
                invincibleTimer: newInvincibleTimer,
                doublePointsTimer: newDoublePointsTimer,
            };
        // Fix: Added a reducer case to handle resetting the speed.
        case 'RESET_SPEED':
            return { ...state, speed: INITIAL_SPEED };
        default:
            return state;
    }
};

export const useGameLogic = () => {
    const [state, dispatch] = useReducer(gameReducer, getInitialState());
    // Fix: Use ReturnType to get the correct timer ID type for browser environments, avoiding NodeJS-specific types.
    const gameLoopRef = useRef<ReturnType<typeof setInterval>>();
    const speedTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const startGame = useCallback(() => {
        dispatch({ type: 'START_GAME' });
    }, []);

    const changeDirection = useCallback((payload: Direction) => {
        dispatch({ type: 'CHANGE_DIRECTION', payload });
    }, []);

    useEffect(() => {
        if (state.isGameOver) {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            return;
        }

        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        gameLoopRef.current = setInterval(() => {
            dispatch({ type: 'GAME_TICK' });
        }, state.speed);
        
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [state.speed, state.isGameOver]);
    
    useEffect(() => {
        if (state.speed === FAST_SPEED) {
            if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
            // Fix: Use dispatch to correctly update the state via the reducer, ensuring a reliable state transition.
            speedTimeoutRef.current = setTimeout(() => {
                dispatch({ type: 'RESET_SPEED' });
            }, FAST_SPEED_DURATION_MS);
        }
        return () => {
             if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
        }
    // Fix: Corrected the dependency array to include dispatch for stable updates.
    }, [state.speed, dispatch]);

    return { state, changeDirection, startGame };
};
