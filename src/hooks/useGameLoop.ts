import { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Platform, GameScore } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { useIndexedDB } from './useIndexedDB';

const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MAX_JUMP_COUNT = 5; // Increased from 2 to 5 jumps
const PLATFORM_SPEED = 3;
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 20;
const PLATFORM_GAP = 200;
const SCORE_INCREMENT = 0.1; // Slow score increment

export const useGameLoop = (canvasWidth: number, canvasHeight: number) => {
  // Use localStorage for high score persistence
  const [savedHighScore, setSavedHighScore] = useLocalStorage<number>('catJumpHighScore', 0);
  
  // Use IndexedDB for storing game scores
  const { add: addScore } = useIndexedDB<GameScore>({
    dbName: 'catJumpDB',
    storeName: 'scores'
  });

  const [gameState, setGameState] = useState<GameState>({
    cat: {
      x: 50,
      y: canvasHeight / 2,
      width: 40,
      height: 40,
      velocityY: 0,
      isJumping: false,
      jumpCount: 0
    },
    platforms: [],
    score: 0,
    gameOver: false,
    highScore: savedHighScore
  });

  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const platformTimerRef = useRef<number>(0);
  const initializedRef = useRef<boolean>(false);

  const generateInitialPlatforms = useCallback((width: number, height: number): Platform[] => {
    const platforms: Platform[] = [];
    
    // Create a platform directly under the cat for starting
    platforms.push({
      x: 20,
      y: height / 2 + 60,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
      speed: PLATFORM_SPEED
    });
    
    // Add a few more platforms
    for (let i = 1; i < 5; i++) {
      platforms.push({
        x: width + (i * PLATFORM_GAP),
        y: Math.random() * (height - 200) + 100,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT,
        speed: PLATFORM_SPEED
      });
    }
    
    return platforms;
  }, []);

  const jump = useCallback(() => {
    setGameState(prevState => {
      // Only allow jumping if we haven't used all jumps
      if (prevState.cat.jumpCount < MAX_JUMP_COUNT) {
        return {
          ...prevState,
          cat: {
            ...prevState.cat,
            velocityY: JUMP_FORCE,
            isJumping: true,
            jumpCount: prevState.cat.jumpCount + 1
          }
        };
      }
      return prevState;
    });
  }, []);

  const resetGame = useCallback(() => {
    // Save the score to IndexedDB when game is reset after game over
    if (gameState.gameOver && gameState.score > 0) {
      const scoreRecord: GameScore = {
        score: Math.floor(gameState.score),
        date: new Date().toISOString(),
        id: Date.now()
      };
      
      addScore(scoreRecord).catch(err => {
        console.error('Failed to save score to IndexedDB:', err);
      });
    }

    setGameState(prevState => ({
      cat: {
        x: 50,
        y: canvasHeight / 2,
        width: 40,
        height: 40,
        velocityY: 0,
        isJumping: false,
        jumpCount: 0
      },
      platforms: generateInitialPlatforms(canvasWidth, canvasHeight),
      score: 0,
      gameOver: false,
      highScore: prevState.highScore
    }));
  }, [canvasWidth, canvasHeight, generateInitialPlatforms, gameState.gameOver, gameState.score, addScore]);

  const updateGameState = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
      platformTimerRef.current = timestamp;
      animationFrameRef.current = requestAnimationFrame(updateGameState);
      return;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    setGameState(prevState => {
      if (prevState.gameOver) return prevState;

      // Update cat position
      let newCat = { ...prevState.cat };
      newCat.velocityY += GRAVITY;
      newCat.y += newCat.velocityY;

      // Update platforms
      let newPlatforms = [...prevState.platforms];
      newPlatforms = newPlatforms.map(platform => ({
        ...platform,
        x: platform.x - platform.speed
      }));

      // Remove platforms that are off-screen
      newPlatforms = newPlatforms.filter(platform => platform.x + platform.width > 0);

      // Add new platforms
      if (timestamp - platformTimerRef.current > 1500) {
        platformTimerRef.current = timestamp;
        newPlatforms.push({
          x: canvasWidth,
          y: Math.random() * (canvasHeight - 200) + 100,
          width: PLATFORM_WIDTH,
          height: PLATFORM_HEIGHT,
          speed: PLATFORM_SPEED
        });
      }

      // Check for collisions with platforms
      let isOnPlatform = false;
      for (const platform of newPlatforms) {
        if (
          newCat.velocityY > 0 &&
          newCat.x + newCat.width > platform.x &&
          newCat.x < platform.x + platform.width &&
          newCat.y + newCat.height > platform.y &&
          newCat.y + newCat.height < platform.y + platform.height + 10
        ) {
          isOnPlatform = true;
          newCat.y = platform.y - newCat.height;
          newCat.velocityY = 0;
          newCat.isJumping = false;
          newCat.jumpCount = 0; // Reset jump count when landing
          break;
        }
      }

      // Check if cat is out of bounds
      let gameOver = prevState.gameOver;
      if (newCat.y > canvasHeight || newCat.y < -newCat.height) {
        gameOver = true;
      }

      // Update score (slowly)
      const newScore = prevState.score + SCORE_INCREMENT;
      const highScore = Math.max(prevState.highScore, newScore);
      
      // Update localStorage if high score changes
      if (highScore > prevState.highScore) {
        setSavedHighScore(highScore);
      }

      return {
        cat: newCat,
        platforms: newPlatforms,
        score: newScore,
        gameOver,
        highScore
      };
    });

    animationFrameRef.current = requestAnimationFrame(updateGameState);
  }, [canvasWidth, canvasHeight, setSavedHighScore]);

  useEffect(() => {
    // Only initialize platforms once
    if (!initializedRef.current) {
      initializedRef.current = true;
      setGameState(prevState => ({
        ...prevState,
        platforms: generateInitialPlatforms(canvasWidth, canvasHeight),
        highScore: savedHighScore // Initialize with saved high score
      }));
    }

    // Start game loop
    animationFrameRef.current = requestAnimationFrame(updateGameState);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [canvasWidth, canvasHeight, generateInitialPlatforms, updateGameState, savedHighScore]);

  return { gameState, jump, resetGame };
};