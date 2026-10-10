import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatNumber, formatTime } from '../../utils/format';
import { soundManager } from '../../utils/audio';
import { Gift, Sparkles, Calendar, RotateCw, CheckCircle2 } from 'lucide-react';

const WHEEL_SLICES = [
  { label: '5,000 Coins', color: '#f59e0b', textColor: '#000', icon: '🪙' },
  { label: '25 Gems', color: '#06b6d4', textColor: '#fff', icon: '💎' },
  { label: '50,000 Coins', color: '#eab308', textColor: '#000', icon: '🪙' },
  { label: '100 Gems', color: '#0284c7', textColor: '#fff', icon: '💎' },
  { label: '2x Boost 15m', color: '#a855f7', textColor: '#fff', icon: '⚡' },
  { label: '500,000 Coins', color: '#d97706', textColor: '#fff', icon: '🪙' },
  { label: 'Epic Pet', color: '#ec4899', textColor: '#fff', icon: '🐾' },
  { label: 'JACKPOT 5M', color: '#ef4444', textColor: '#fff', icon: '👑' },
];

const SEVEN_DAY_SCHEDULE = [
  { day: 1, title: 'Day 1', reward: '🪙 500 Coins', icon: '🪙' },
  { day: 2, title: 'Day 2', reward: '🪙 2,500 + 💎 10 Gems', icon: '💎' },
  { day: 3, title: 'Day 3', reward: '🐾 Rare Pet + 💎 25 Gems', icon: '🐾' },
  { day: 4, title: 'Day 4', reward: '🪙 25,000 + 💎 50 Gems', icon: '🪙' },
  { day: 5, title: 'Day 5', reward: '🐾 Epic Pet + 💎 100 Gems', icon: '🦅' },
  { day: 6, title: 'Day 6', reward: '🪙 150,000 + 💎 150 Gems', icon: '💎' },
  { day: 7, title: 'Day 7', reward: '👑 TITANIC PET + 💎 500 Gems', icon: '👑' },
];

export const DailyRewardsView: React.FC = () => {
  const { state, spinWheel, claimLoginReward } = useGame();
  const [activeSubTab, setActiveSubTab] = useState<'spin' | 'login'>('spin');

  // Wheel state
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinResultModal, setSpinResultModal] = useState<string | null>(null);

  const now = Date.now();
  const timeSinceLastSpin = now - state.lastDailySpinTimestamp;
  const isFreeSpinAvailable = timeSinceLastSpin >= 24 * 60 * 60 * 1000;
  const timeUntilFreeSpin = Math.max(0, 24 * 3600 - Math.floor(timeSinceLastSpin / 1000));

  const handleSpin = (isFree: boolean) => {
    if (isSpinning) return;
    if (!isFree && state.gems < 25) return;

    setIsSpinning(true);
    setSpinResultModal(null);

    const { sliceIndex, rewardText } = spinWheel(isFree);
    if (sliceIndex === -1) {
      setIsSpinning(false);
      return;
    }

    // Sound ticking effect
    soundManager.playSpinClick();
    const tickInterval = setInterval(() => {
      soundManager.playSpinClick();
    }, 150);

    // Calculate rotation: 8 slices = 45 deg per slice
    // Pointer is at the top (270 deg or 90 deg offset)
    const sliceAngle = 360 / 8;
    const targetSliceCenter = sliceIndex * sliceAngle + sliceAngle / 2;
    const extraRotations = 360 * 5; // 5 full turns
    const finalAngle = wheelRotation + extraRotations + (360 - (targetSliceCenter % 360));

    setWheelRotation(finalAngle);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setSpinResultModal(rewardText);
      soundManager.playLevelUp();
    }, 3200);
  };

  const currentLoginDay = ((state.loginStreak - 1) % 7) + 1;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-4 pb-36 sm:pb-32 text-slate-100">
      {/* Title */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Gift className="w-7 h-7 text-amber-400" />
            <span>Daily Rewards & Prize Wheel</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Spin the fortune wheel daily and maintain your 7-day login streak for titanic prizes!
          </p>
        </div>

        {/* Sub-tab segmented control */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveSubTab('spin')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeSubTab === 'spin'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Prize Wheel
          </button>
          <button
            onClick={() => setActiveSubTab('login')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeSubTab === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            7-Day Streak
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: PRIZE WHEEL */}
      {activeSubTab === 'spin' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col items-center">
          {/* Wheel Result Banner */}
          {spinResultModal && (
            <div className="w-full max-w-md p-4 mb-4 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-200 font-extrabold text-center text-sm shadow-lg animate-in zoom-in-95">
              🎉 {spinResultModal}
            </div>
          )}

          {/* Interactive SVG Prize Wheel */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 my-4 flex items-center justify-center">
            {/* Pointer Needle at Top */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-lg" />
            </div>

            {/* Rotating SVG Wheel */}
            <div
              className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.3)] transition-transform ease-out"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transitionDuration: isSpinning ? '3.2s' : '0s',
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
                {WHEEL_SLICES.map((slice, i) => {
                  const angle = (360 / 8) * (Math.PI / 180);
                  const startAngle = i * angle;
                  const endAngle = (i + 1) * angle;

                  const x1 = 50 + 50 * Math.cos(startAngle);
                  const y1 = 50 + 50 * Math.sin(startAngle);
                  const x2 = 50 + 50 * Math.cos(endAngle);
                  const y2 = 50 + 50 * Math.sin(endAngle);

                  // Text position
                  const textAngle = startAngle + angle / 2;
                  const tx = 50 + 32 * Math.cos(textAngle);
                  const ty = 50 + 32 * Math.sin(textAngle);

                  return (
                    <g key={i}>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                        fill={slice.color}
                        stroke="#0f172a"
                        strokeWidth="1"
                      />
                      <text
                        x={tx}
                        y={ty}
                        fill={slice.textColor}
                        fontSize="3.5"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${((textAngle * 180) / Math.PI) + 90}, ${tx}, ${ty})`}
                      >
                        {slice.icon} {slice.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Center Hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-slate-950 border-4 border-amber-400 flex items-center justify-center font-black text-xs text-amber-300 shadow-xl z-20">
              SPIN
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            {/* Free Spin Button */}
            <button
              onClick={() => handleSpin(true)}
              disabled={isSpinning || !isFreeSpinAvailable}
              className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                isFreeSpinAvailable && !isSpinning
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 shadow-amber-500/25 active:scale-95 animate-pulse'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>
                {isFreeSpinAvailable
                  ? 'FREE DAILY SPIN!'
                  : `Free in: ${formatTime(timeUntilFreeSpin)}`}
              </span>
            </button>

            {/* Paid Spin for 25 Gems */}
            <button
              onClick={() => handleSpin(false)}
              disabled={isSpinning || state.gems < 25}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                state.gems >= 25 && !isSpinning
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/25 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Extra Spin (💎 25 Gems)</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: 7-DAY LOGIN REWARDS */}
      {activeSubTab === 'login' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>7-Day Login Calendar</span>
              </h3>
              <p className="text-xs text-slate-400">
                Current Streak: <span className="text-amber-400 font-bold">{state.loginStreak} Days</span>
              </p>
            </div>

            <button
              onClick={claimLoginReward}
              disabled={state.claimedToday}
              className={`py-2.5 px-6 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
                !state.claimedToday
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 shadow-amber-500/25 animate-pulse active:scale-95'
                  : 'bg-slate-800 text-emerald-400 border border-slate-700 cursor-default'
              }`}
            >
              {!state.claimedToday ? 'CLAIM TODAY\'S PRIZE' : 'CLAIMED FOR TODAY'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {SEVEN_DAY_SCHEDULE.map((item) => {
              const isToday = item.day === currentLoginDay;
              const isPast = item.day < currentLoginDay;
              const isFuture = item.day > currentLoginDay;

              return (
                <div
                  key={item.day}
                  className={`rounded-2xl p-4 border flex flex-col justify-between text-center transition-all ${
                    isToday
                      ? 'bg-amber-950/60 border-amber-400 shadow-lg ring-1 ring-amber-400'
                      : isPast
                      ? 'bg-slate-950/40 border-slate-900 opacity-60'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-slate-400">
                      {item.title}
                    </span>
                    <div className="text-3xl my-2">{item.icon}</div>
                    <div className="text-xs font-bold text-white leading-tight min-h-[32px] flex items-center justify-center">
                      {item.reward}
                    </div>
                  </div>

                  <div className="mt-3">
                    {isPast || (isToday && state.claimedToday) ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                      </span>
                    ) : isToday ? (
                      <span className="text-[10px] text-amber-300 font-black animate-pulse">
                        Ready to Claim!
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold">Locked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
