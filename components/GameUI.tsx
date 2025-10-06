
import React, { useState, useEffect } from 'react';
import { PowerUpType } from '../types';

interface GameUIProps {
    points: number;
    highScore: number;
    powerUpType: PowerUpType | null;
    invincible: boolean;
    doublePoints: boolean;
}

const PowerUpMessage: React.FC<{ type: PowerUpType | null; invincible: boolean; doublePoints: boolean }> = ({ type, invincible, doublePoints }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    
    let currentMessage = '';
    let currentType: PowerUpType | 'none' = 'none';

    if (invincible) {
        currentMessage = "¡Invencible!";
        currentType = PowerUpType.INVINCIBLE;
    } else if (doublePoints) {
        currentMessage = "¡Puntos x2!";
        currentType = PowerUpType.DOUBLE;
    } else if(type) {
         if (type === PowerUpType.SPEED) currentMessage = "¡Velocidad!";
         currentType = type;
    }

    useEffect(() => {
        if (currentMessage) {
            setMessage(currentMessage);
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [currentMessage]);
    
    const powerUpClass = {
        [PowerUpType.INVINCIBLE]: 'bg-neon-magenta shadow-neon-magenta',
        [PowerUpType.DOUBLE]: 'bg-neon-yellow text-black shadow-lg shadow-yellow-400/50',
        [PowerUpType.SPEED]: 'bg-neon-green text-black shadow-lg shadow-green-400/50',
        'none': ''
    }[currentType];

    return (
        <div 
            className={`absolute top-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md font-bold transition-opacity duration-300 ${powerUpClass} ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
            {message}
        </div>
    );
};


const GameUI: React.FC<GameUIProps> = ({ points, highScore, powerUpType, invincible, doublePoints }) => {
    return (
        <div className="w-full p-4 flex justify-between items-center text-lg md:text-xl text-shadow-neon-cyan">
            <h1 className="font-bold text-2xl md:text-3xl flex-1 text-center md:text-left">Snake 2026</h1>
            <div className="flex-1 text-center">Puntos: <span className="font-semibold">{points}</span></div>
            <div className="flex-1 text-center md:text-right">Récord: <span className="font-semibold">{highScore}</span></div>
            <PowerUpMessage type={powerUpType} invincible={invincible} doublePoints={doublePoints} />
        </div>
    );
};

export default GameUI;
