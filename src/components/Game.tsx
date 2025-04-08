import React, { useEffect, useState, useCallback } from 'react';
import GameCanvas from './GameCanvas';
import GameControls from './GameControls';
import NotificationManager from './NotificationManager';
import ScoreHistory from './ScoreHistory';
import { useGameLoop } from '../hooks/useGameLoop';
import { Cat } from 'lucide-react';

const Game: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const { gameState, jump, resetGame } = useGameLoop(dimensions.width, dimensions.height);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Handle window resize with useCallback to prevent unnecessary re-renders
  const handleResize = useCallback(() => {
    const width = Math.min(window.innerWidth - 40, 800);
    const height = Math.min(window.innerHeight - 200, 400);
    setDimensions({ width, height });
  }, []);

  // Handle canvas touch with useCallback
  const handleCanvasTouch = useCallback(() => {
    if (gameState.gameOver) {
      resetGame();
    } else {
      jump();
    }
  }, [gameState.gameOver, jump, resetGame]);

  useEffect(() => {
    // Initial resize
    handleResize();
    
    // Set up event listeners
    window.addEventListener('resize', handleResize);

    // Handle keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState.gameOver) {
          resetGame();
        } else {
          jump();
        }
      }
    };

    // Handle online/offline status
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [gameState.gameOver, jump, resetGame, handleResize]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="mb-4 flex items-center">
        <Cat className="mr-2" size={32} />
        <h1 className="text-3xl font-bold">Cat Jump Game</h1>
        {!isOnline && (
          <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            Offline Mode
          </span>
        )}
      </div>
      
      <div 
        className="touch-manipulation" 
        onClick={handleCanvasTouch}
        style={{ touchAction: 'manipulation' }}
      >
        <GameCanvas 
          gameState={gameState} 
          width={dimensions.width} 
          height={dimensions.height} 
        />
      </div>
      
      <GameControls 
        onJump={jump} 
        onRestart={resetGame} 
        gameOver={gameState.gameOver} 
      />
      
      <div className="mt-4 text-center">
        <p>Tap or press SPACE to jump. You can jump up to 5 times in the air!</p>
        <p className="text-sm text-gray-600 mt-2">
          Current Score: {Math.floor(gameState.score)} | High Score: {Math.floor(gameState.highScore)}
        </p>
        <p className="text-sm text-gray-600">
          Jumps remaining: {gameState.gameOver ? 0 : 5 - gameState.cat.jumpCount}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <NotificationManager />
        <ScoreHistory />
      </div>
    </div>
  );
};

export default Game;