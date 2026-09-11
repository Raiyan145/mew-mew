import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';
import { THEME_PALETTES } from '../utils/constants';
import { getTimeOfDay } from '../utils/sceneryRenderer';

interface ScoreHUDProps {
  score: number;
  highScore: number;
  isMuted: boolean;
  onToggleMute: () => void;
  milestoneNotice: { title: string; subtitle: string; color: string } | null;
}

export const ScoreHUD: React.FC<ScoreHUDProps> = ({
  score,
  highScore,
  isMuted,
  onToggleMute,
  milestoneNotice,
}) => {
  const [popScale, setPopScale] = useState(1);
  const timeOfDay = getTimeOfDay(score);
  const theme = THEME_PALETTES[timeOfDay];

  // Trigger pop animation when score increments
  useEffect(() => {
    if (score > 0) {
      setPopScale(1.35);
      const timer = setTimeout(() => setPopScale(1), 160);
      return () => clearTimeout(timer);
    }
  }, [score]);

  return (
    <div
      id="score-hud"
      className="absolute top-0 inset-x-0 p-4 pointer-events-none flex flex-col items-center z-10 select-none"
    >
      {/* Top row: Day/Night pill, Sound toggle, Best Score */}
      <div className="w-full max-w-sm flex items-center justify-between pointer-events-auto">
        {/* Day / Sunset / Night Theme Badge */}
        <div className="bg-slate-900/70 backdrop-blur-xs text-white px-3 py-1 rounded-full border-2 border-slate-900 shadow font-bubble text-xs font-bold flex items-center gap-1.5">
          <span>{theme.label}</span>
        </div>

        {/* High score badge */}
        <div className="flex items-center gap-1.5 bg-amber-400/90 text-slate-900 px-3 py-1 rounded-full border-2 border-slate-900 shadow font-bubble text-xs font-bold">
          <Trophy className="w-3.5 h-3.5 text-amber-900 fill-amber-500" />
          <span>BEST: {highScore}</span>
        </div>

        {/* Audio Toggle */}
        <button
          id="hud-mute-button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
            sound.playClick();
          }}
          className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full border-2 border-slate-900 shadow active:scale-90 transition-transform cursor-pointer"
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-600" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          )}
        </button>
      </div>

      {/* Main Score Display in Center */}
      <div className="mt-3 flex flex-col items-center">
        <motion.div
          animate={{ scale: popScale }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="font-game text-5xl sm:text-6xl text-white text-stroke-lg drop-shadow-md tracking-wider"
        >
          {score}
        </motion.div>
      </div>

      {/* Milestone / Combo Announcement Banner */}
      <AnimatePresence>
        {milestoneNotice && (
          <motion.div
            initial={{ scale: 0.5, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0, y: -15 }}
            className="mt-2 px-5 py-2 rounded-2xl border-3 border-slate-900 shadow-xl text-center bg-white/95"
            style={{ borderColor: milestoneNotice.color }}
          >
            <div
              className="font-game text-lg sm:text-xl tracking-wide"
              style={{ color: milestoneNotice.color }}
            >
              {milestoneNotice.title}
            </div>
            <div className="font-bubble text-xs font-bold text-slate-700">
              {milestoneNotice.subtitle}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
