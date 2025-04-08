import React from 'react';

interface GameControlsProps {
  onJump: () => void;
  onRestart: () => void;
  gameOver: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({ onJump, onRestart, gameOver }) => {
  return (
    <div className="mt-4 flex justify-center">
      {!gameOver ? (
        <button
          onClick={onJump}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Jump
        </button>
      ) : (
        <button
          onClick={onRestart}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Restart
        </button>
      )}
    </div>
  );
};

export default GameControls;