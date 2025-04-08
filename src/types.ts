export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Cat extends GameObject {
  velocityY: number;
  isJumping: boolean;
  jumpCount: number;
}

export interface Platform extends GameObject {
  speed: number;
}

export interface GameState {
  cat: Cat;
  platforms: Platform[];
  score: number;
  gameOver: boolean;
  highScore: number;
}

export interface GameScore {
  id?: number;
  score: number;
  date: string;
}

export interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}