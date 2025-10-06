
import React, { useRef, useEffect, useState } from 'react';
import { Coords, PowerUp, Direction, PowerUpType } from '../types';
import { TILE_SIZE } from '../constants';

interface GameBoardProps {
    snake: Coords[];
    food: Coords;
    powerUp: PowerUp | null;
    isInvincible: boolean;
    isGameOver: boolean;
    onSwipe: (dir: Direction) => void;
    onRestart: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ snake, food, powerUp, isInvincible, isGameOver, onSwipe, onRestart }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [boardSize, setBoardSize] = useState({ width: 0, height: 0, cols: 0, rows: 0 });
    const touchStartRef = useRef<{ x: number, y: number } | null>(null);

    useEffect(() => {
        const calculateBoardSize = () => {
            // Adjust for UI and controls height, with some margin
            const availableHeight = window.innerHeight - 200; 
            const availableWidth = window.innerWidth - 40;

            const cols = Math.floor(availableWidth / TILE_SIZE);
            const rows = Math.floor(availableHeight / TILE_SIZE);
            setBoardSize({
                width: cols * TILE_SIZE,
                height: rows * TILE_SIZE,
                cols,
                rows,
            });
        };

        calculateBoardSize();
        window.addEventListener('resize', calculateBoardSize);
        return () => window.removeEventListener('resize', calculateBoardSize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        // Clear canvas
        ctx.fillStyle = '#0d0d1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        for (let x = 0; x < boardSize.cols; x++) {
            for (let y = 0; y < boardSize.rows; y++) {
                ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }

        // Draw snake
        ctx.fillStyle = isInvincible ? '#ff00c1' : '#00f0ff';
        snake.forEach((segment, i) => {
            ctx.globalAlpha = i === 0 ? 1 : 0.8;
            ctx.fillRect(segment.x * TILE_SIZE + 2, segment.y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        });
        ctx.globalAlpha = 1;

        // Draw food
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(food.x * TILE_SIZE + 2, food.y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);

        // Draw power-up
        if (powerUp) {
            const powerUpColors: { [key in PowerUpType]: string } = {
                [PowerUpType.SPEED]: '#44ff44',
                [PowerUpType.DOUBLE]: '#ffff44',
                [PowerUpType.INVINCIBLE]: '#ff44ff',
            };
            ctx.fillStyle = powerUpColors[powerUp.type];
            ctx.fillRect(powerUp.x * TILE_SIZE, powerUp.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
        
        if (isGameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 48px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
             ctx.fillStyle = 'white';
            ctx.font = '24px "Segoe UI", sans-serif';
            ctx.fillText('Tap to Restart', canvas.width / 2, canvas.height / 2 + 20);
        }

    }, [snake, food, powerUp, isInvincible, boardSize, isGameOver]);

    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        if(isGameOver) return;
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        if (!touchStartRef.current || isGameOver) return;
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;

        if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
            if (Math.abs(dx) > Math.abs(dy)) {
                onSwipe(dx > 0 ? 'right' : 'left');
            } else {
                onSwipe(dy > 0 ? 'down' : 'up');
            }
            touchStartRef.current = null; // Reset after a swipe is registered
        }
    };
    
    const handleClick = () => {
        if(isGameOver) {
            onRestart();
        }
    }

    return (
        <canvas
            ref={canvasRef}
            width={boardSize.width}
            height={boardSize.height}
            className="border-2 border-neon-cyan shadow-neon-cyan"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onClick={handleClick}
        />
    );
};

export default GameBoard;
