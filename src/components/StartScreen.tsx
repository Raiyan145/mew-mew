import React from 'react';
import { Play, Trophy, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';
import { sound } from '../utils/audio';

interface StartScreenProps {
  highScore: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  highScore,
  isMuted,
  onToggleMute,
  onStart,
}) => {
  return (
    <div
      id="start-screen-overlay"
      className="absolute inset-0 z-20 flex flex-col items-center justify-between p-6 pointer-events-auto bg-slate-900/30 backdrop-blur-[2px]"
    >
      {/* Top bar with audio toggle and high score */}
      <div className="w-full flex justify-between items-center max-w-sm pt-2">
        <div className="flex items-center gap-2 bg-amber-400/90 text-slate-900 px-3.5 py-1.5 rounded-full border-2 border-slate-900 shadow-md">
          <Trophy className="w-4 h-4 text-amber-900 fill-amber-500" />
          <span className="font-bubble font-bold text-xs">BEST: {highScore}</span>
        </div>

        <button
          id="sound-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
            sound.playClick();
          }}
          className="p-2.5 bg-white/90 hover:bg-white text-slate-800 rounded-full border-2 border-slate-900 shadow-md active:scale-95 transition-transform"
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-600" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
        </button>
      </div>

      {/* Main Title Card */}
      <div className="flex flex-col items-center text-center my-auto">
        <motion.div
          initial={{ scale: 0.8, y: -20 }}
          animate={{ scale: [1, 1.04, 1], y: [0, -6, 0] }}
          transition={{
            scale: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
            y: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
          }}
          className="relative mb-2"
        >
          <div className="inline-block bg-amber-300 text-slate-900 px-4 py-1 rounded-full border-2 border-slate-900 font-bubble font-extrabold text-xs tracking-wider shadow-sm mb-2 uppercase">
            Bird Flight Simulator 🐥
          </div>
          <h1 className="font-game text-4xl sm:text-5xl text-yellow-300 text-stroke-lg tracking-wider drop-shadow-lg leading-tight">
            JOHAER'S
            <br />
            <span className="text-sky-300 text-stroke-lg">FLAPPY</span>
            <br />
            <span className="text-emerald-400 text-stroke-lg">ADVENTURE</span>
          </h1>
        </motion.div>

        <p className="font-bubble font-semibold text-white text-stroke-sm text-base sm:text-lg max-w-[260px] mt-2 mb-6">
          Can Johaer survive gravity?
        </p>

        {/* Big Juicy PLAY Button */}
        <motion.button
          id="play-button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick();
            onStart();
          }}
          className="group relative flex items-center justify-center gap-3 bg-gradient-to-b from-emerald-400 to-green-600 hover:from-emerald-300 hover:to-green-500 text-white font-game text-2xl sm:text-3xl px-10 py-4 rounded-2xl border-4 border-slate-900 shadow-[0_8px_0_#0f172a] active:shadow-[0_2px_0_#0f172a] active:translate-y-[6px] transition-all cursor-pointer"
        >
          <Play className="w-8 h-8 fill-current drop-shadow" />
          <span>PLAY!</span>
          <Sparkles className="w-6 h-6 text-yellow-200 animate-pulse" />
        </motion.button>

        {/* High Score callout if exists */}
        {highScore > 0 && (
          <div className="mt-5 flex items-center gap-2 text-amber-200 font-bubble text-sm font-bold bg-slate-900/60 px-4 py-1.5 rounded-full border border-amber-400/40">
            <span>Current High Score:</span>
            <span className="text-amber-300 text-base">{highScore} pts</span>
          </div>
        )}
      </div>

      {/* Control instructions */}
      <div className="flex flex-col items-center gap-2 pb-3">
        <div className="flex items-center gap-3 bg-slate-900/80 text-slate-200 px-4 py-2 rounded-xl border border-slate-700 text-xs sm:text-sm font-bubble shadow-lg">
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-yellow-300 font-mono text-xs">
              SPACE
            </kbd>
            or
            <kbd className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-yellow-300 font-mono text-xs">
              CLICK / TAP
            </kbd>
          </span>
          <span className="text-slate-400">to Flap!</span>
        </div>
      </div>
    </div>
  );
};
