import React from 'react';
import { Direction } from '../types';

interface ControlsProps {
    onDirectionChange: (dir: Direction) => void;
}

const ArrowUp = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
const ArrowDown = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const ArrowLeft = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ArrowRight = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;


const Controls: React.FC<ControlsProps> = ({ onDirectionChange }) => {
    const buttonClass = "bg-neon-cyan text-neon-bg border-none text-2xl p-4 rounded-lg shadow-neon-cyan flex items-center justify-center active:scale-95 transition-transform";

    return (
        <div className="grid grid-cols-3 grid-rows-2 gap-2 p-4 w-full max-w-xs md:hidden">
            {/* Up Button */}
            <div className="col-start-2 row-start-1">
                <button onClick={() => onDirectionChange('up')} className={buttonClass}><ArrowUp/></button>
            </div>

            {/* Left Button */}
            <div className="col-start-1 row-start-2">
                <button onClick={() => onDirectionChange('left')} className={buttonClass}><ArrowLeft/></button>
            </div>

            {/* Down Button */}
            <div className="col-start-2 row-start-2">
                <button onClick={() => onDirectionChange('down')} className={buttonClass}><ArrowDown/></button>
            </div>

            {/* Right Button */}
            <div className="col-start-3 row-start-2">
                 <button onClick={() => onDirectionChange('right')} className={buttonClass}><ArrowRight/></button>
            </div>
        </div>
    );
};

export default Controls;