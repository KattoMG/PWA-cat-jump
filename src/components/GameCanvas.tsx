import React, { useRef, useEffect } from 'react';
import { GameState } from '../types';
import { Cat } from 'lucide-react';

interface GameCanvasProps {
  gameState: GameState;
  width: number;
  height: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, width, height);

    // Draw platforms
    ctx.fillStyle = '#8B4513';
    gameState.platforms.forEach(platform => {
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw cat
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(gameState.cat.x, gameState.cat.y, gameState.cat.width, gameState.cat.height);

    // Draw cat face (simple representation)
    ctx.fillStyle = '#000000';
    ctx.fillRect(gameState.cat.x + 10, gameState.cat.y + 10, 5, 5); // Left eye
    ctx.fillRect(gameState.cat.x + 25, gameState.cat.y + 10, 5, 5); // Right eye
    ctx.fillRect(gameState.cat.x + 15, gameState.cat.y + 20, 10, 5); // Mouth

    // Draw jump count indicator
    const jumpCount = gameState.cat.jumpCount;
    const maxJumps = 5;
    const jumpIndicatorWidth = 5;
    const jumpIndicatorGap = 3;
    const totalWidth = (jumpIndicatorWidth * maxJumps) + (jumpIndicatorGap * (maxJumps - 1));
    const startX = gameState.cat.x + (gameState.cat.width / 2) - (totalWidth / 2);
    
    for (let i = 0; i < maxJumps; i++) {
      ctx.fillStyle = i < jumpCount ? '#FF0000' : '#00FF00';
      ctx.fillRect(
        startX + (i * (jumpIndicatorWidth + jumpIndicatorGap)), 
        gameState.cat.y - 10, 
        jumpIndicatorWidth, 
        5
      );
    }

    // Draw score
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${Math.floor(gameState.score)}`, 10, 30);

    // Draw high score
    ctx.fillText(`High Score: ${Math.floor(gameState.highScore)}`, 10, 60);

    // Draw game over message
    if (gameState.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', width / 2, height / 2 - 40);
      
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${Math.floor(gameState.score)}`, width / 2, height / 2);
      ctx.fillText('Tap to restart', width / 2, height / 2 + 40);
    }
  }, [gameState, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-300"
    />
  );
};

export default GameCanvas;