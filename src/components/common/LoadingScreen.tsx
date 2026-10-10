import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  onLoaded: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Azuki Pet Simulator...');

  useEffect(() => {
    const steps = [
      { at: 15, text: 'Synthesizing Web Audio procedural sound engine...' },
      { at: 35, text: 'Cataloging 63 rarity tiers & 56 pet species...' },
      { at: 55, text: 'Warming up incubators & hatching pens...' },
      { at: 75, text: 'Checking offline earnings from device storage...' },
      { at: 90, text: 'Synchronizing 500 redemption codes...' },
      { at: 100, text: 'Welcome to the Azuki Realm!' },
    ];

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setProgress(100);
        setStatusText('Welcome to the Azuki Realm!');
        setTimeout(() => {
          onLoaded();
        }, 400);
      } else {
        setProgress(current);
        const match = steps.find((s) => current <= s.at);
        if (match) setStatusText(match.text);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [onLoaded]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white select-none">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Center Box */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        {/* Animated Mascot */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-600 via-rose-600 to-purple-600 flex items-center justify-center text-5xl shadow-2xl shadow-amber-500/30 animate-bounce">
            🐱
          </div>
          <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-amber-400 text-slate-950 shadow-md animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Title Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 font-extrabold text-xs mb-3 shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>✨ made with Azuki ✨</span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-1">
          AZUKI PET SIMULATOR
        </h1>
        <p className="text-xs text-slate-400 mb-6">Pure offline pet collection & hatching</p>

        {/* Progress bar container */}
        <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800 p-0.5 overflow-hidden shadow-inner mb-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 transition-all duration-150 shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress percentage & status */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="truncate pr-2">{statusText}</span>
          <span className="font-bold text-amber-400 flex-shrink-0">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
