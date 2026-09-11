import React, { useEffect, useState } from 'react';
import { RotateCcw, Trophy, Share2, Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { sound } from '../utils/audio';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  isNewHigh: boolean;
  deathQuip: string;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  highScore,
  isNewHigh,
  deathQuip,
  onRestart,
}) => {
  const [copied, setCopied] = useState(false);

  // Keyboard shortcut to quickly restart (Space or Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.playClick();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    const shareText = `I helped Johaer fly ${score} points in Johaer's Flappy Adventure! Can you beat my score? 🐥💨`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div
      id="game-over-screen"
      className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 180 }}
        className="w-full max-w-sm bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl border-4 border-slate-900 shadow-[0_12px_0_#0f172a] p-6 flex flex-col items-center text-center text-slate-900"
      >
        {/* Bonk Comic Banner */}
        <div className="relative -mt-12 mb-3">
          <motion.div
            initial={{ rotate: -8, scale: 0.9 }}
            animate={{ rotate: [-8, 8, -8], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="bg-red-500 text-white font-game text-2xl sm:text-3xl px-6 py-2 rounded-2xl border-4 border-slate-900 shadow-[0_4px_0_#0f172a] text-stroke-sm"
          >
            JOHAER HAS BONKED! 💥
          </motion.div>
        </div>

        {/* Humorous death quip */}
        <p className="font-bubble italic text-slate-700 text-sm mb-4 px-2 font-medium">
          "{deathQuip}"
        </p>

        {/* Score Board Box */}
        <div className="w-full bg-white/90 rounded-2xl border-3 border-slate-900 p-4 mb-5 shadow-inner">
          <div className="flex justify-around items-center divide-x-2 divide-slate-200">
            {/* Current Score */}
            <div className="flex flex-col items-center flex-1 px-2">
              <span className="font-bubble text-xs font-bold text-slate-500 uppercase tracking-wide">
                Score
              </span>
              <span className="font-game text-4xl text-amber-500 text-stroke-sm my-1">
                {score}
              </span>
              {isNewHigh && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 bg-yellow-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-slate-900 mt-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-950" />
                  <span>NEW BEST!</span>
                </motion.div>
              )}
            </div>

            {/* High Score */}
            <div className="flex flex-col items-center flex-1 px-2">
              <span className="font-bubble text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Best
              </span>
              <span className="font-game text-4xl text-emerald-600 text-stroke-sm my-1">
                {highScore}
              </span>
              <span className="text-[10px] font-bubble text-slate-500">
                All-time record
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          {/* TRY AGAIN */}
          <motion.button
            id="try-again-button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onRestart();
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-emerald-400 to-green-600 hover:from-emerald-300 hover:to-green-500 text-white font-game text-2xl py-3.5 rounded-2xl border-4 border-slate-900 shadow-[0_6px_0_#0f172a] active:shadow-[0_1px_0_#0f172a] active:translate-y-[5px] transition-all cursor-pointer"
          >
            <RotateCcw className="w-6 h-6" />
            <span>TRY AGAIN</span>
          </motion.button>

          {/* Share score button */}
          <button
            id="share-score-button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bubble font-bold text-sm py-2.5 rounded-xl border-2 border-slate-900 shadow-[0_3px_0_#0f172a] active:shadow-none active:translate-y-[3px] transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Score Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-sky-600" />
                <span>Brag / Copy Score</span>
              </>
            )}
          </button>
        </div>

        <span className="text-[11px] font-bubble text-slate-500 mt-3">
          Press <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono">SPACE</kbd> to restart instantly
        </span>
      </motion.div>
    </div>
  );
};
