/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from './types';
import { GameCanvas } from './components/GameCanvas';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { ScoreHUD } from './components/ScoreHUD';
import { sound } from './utils/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);
  const [deathQuip, setDeathQuip] = useState<string>('Gravity wins this round!');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [milestoneNotice, setMilestoneNotice] = useState<{
    title: string;
    subtitle: string;
    color: string;
  } | null>(null);

  // Load high score from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('johaer_flappy_high_score');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val)) setHighScore(val);
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  // Handle Score update
  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  // Handle Milestone trigger
  const handleMilestone = useCallback((ms: { title: string; subtitle: string; color: string }) => {
    setMilestoneNotice(ms);
    const timer = setTimeout(() => {
      setMilestoneNotice(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  // Handle Game Over
  const handleGameOver = useCallback(
    (finalScore: number, newRecord: boolean, quip: string) => {
      setDeathQuip(quip);
      setIsNewHigh(newRecord);

      if (newRecord) {
        setHighScore(finalScore);
        try {
          localStorage.setItem('johaer_flappy_high_score', String(finalScore));
        } catch {}
      }

      setGameState('GAMEOVER');
    },
    []
  );

  // Start new game
  const handleStartGame = useCallback(() => {
    setScore(0);
    setIsNewHigh(false);
    setMilestoneNotice(null);
    setGameState('PLAYING');
  }, []);

  // Restart after game over
  const handleRestart = useCallback(() => {
    handleStartGame();
  }, [handleStartGame]);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  return (
    <div
      id="johaer-game-app"
      className="relative w-screen h-screen max-h-screen overflow-hidden flex flex-col items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-0 sm:p-4 select-none touch-none"
    >
      {/* Game Window Container */}
      <div
        id="game-viewport"
        className="relative w-full h-full sm:max-w-[480px] sm:max-h-[720px] flex items-center justify-center overflow-hidden sm:rounded-3xl sm:border-4 sm:border-slate-800 sm:shadow-2xl bg-sky-300"
      >
        {/* Core Canvas */}
        <GameCanvas
          gameState={gameState}
          score={score}
          highScore={highScore}
          onScoreChange={handleScoreChange}
          onGameOver={handleGameOver}
          onMilestone={handleMilestone}
          onStartGame={handleStartGame}
        />

        {/* HUD during active gameplay */}
        {gameState === 'PLAYING' && (
          <ScoreHUD
            score={score}
            highScore={highScore}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            milestoneNotice={milestoneNotice}
          />
        )}

        {/* Start Screen Overlay */}
        {gameState === 'START' && (
          <StartScreen
            highScore={highScore}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onStart={handleStartGame}
          />
        )}

        {/* Game Over Screen Overlay */}
        {gameState === 'GAMEOVER' && (
          <GameOverScreen
            score={score}
            highScore={highScore}
            isNewHigh={isNewHigh}
            deathQuip={deathQuip}
            onRestart={handleRestart}
          />
        )}
      </div>

      {/* Desktop footer hint */}
      <div className="hidden sm:flex items-center gap-4 text-slate-400 font-bubble text-xs mt-3">
        <span>🎮 Press <strong className="text-yellow-400 font-mono">SPACE</strong> to Flap</span>
        <span>•</span>
        <span>🐥 Help Johaer Dodge Obstacles</span>
        <span>•</span>
        <span>⭐ Collect Milestones at 10, 25, 50, 100</span>
      </div>
    </div>
  );
}
