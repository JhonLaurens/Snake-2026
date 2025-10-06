
import React, { useEffect, useCallback } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import GameBoard from './GameBoard';
import GameUI from './GameUI';
import Controls from './Controls';
import { Direction } from '../types';

const GameContainer: React.FC = () => {
    const { state, changeDirection, startGame } = useGameLogic();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const keyMap: { [key: string]: Direction } = {
            ArrowUp: 'up',
            ArrowDown: 'down',
            ArrowLeft: 'left',
            ArrowRight: 'right',
            w: 'up',
            s: 'down',
            a: 'left',
            d: 'right',
        };
        const newDirection = keyMap[e.key];
        if (newDirection) {
            e.preventDefault();
            changeDirection(newDirection);
        }
    }, [changeDirection]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
    
    useEffect(() => {
      // Start the game on initial mount
      startGame();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <GameUI
                points={state.points}
                highScore={state.highScore}
                powerUpType={state.powerUp?.type || null}
                invincible={state.invincibleTimer > 0}
                doublePoints={state.doublePointsTimer > 0}
            />
            <GameBoard
                snake={state.snake}
                food={state.food}
                powerUp={state.powerUp}
                isInvincible={state.invincibleTimer > 0}
                isGameOver={state.isGameOver}
                onSwipe={changeDirection}
                onRestart={startGame}
            />
            <Controls onDirectionChange={changeDirection} />
        </>
    );
};

export default GameContainer;
