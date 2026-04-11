import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Capacitor } from '@capacitor/core';
import onboarding1 from '../assets/onboarding1.png';
import onboarding2 from '../assets/onboarding2.png';
import onboarding3 from '../assets/onboarding3.png';

const SLIDES = [
  {
    image: onboarding1,
    title: 'Share',
    text: 'Give and receive items with people around you.',
  },
  {
    image: onboarding2,
    title: 'Clean & Earn',
    text: 'Clean your neighborhood and earn rewards for your impact.',
  },
  {
    image: onboarding3,
    title: 'Impact',
    text: 'Small actions from you create a better community.',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const finish = () => {
    if (Capacitor.isNativePlatform()) {
      // Mobile: gate with localStorage, send user to login
      localStorage.setItem('wihda_onboarding_done', '1');
      navigate('/login', { replace: true });
    } else {
      // Web: always go to home (already logged in, no flag check)
      navigate('/home', { replace: true });
    }
  };

  const next = () => {
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1);
    } else {
      finish();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 50 && current < SLIDES.length - 1) setCurrent(c => c + 1);
    if (delta < -50 && current > 0) setCurrent(c => c - 1);
    touchStartX.current = null;
  };

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <div
      className="flex flex-col size-full bg-white select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip — top right */}
      <div className="flex justify-end px-6 pt-[calc(env(safe-area-inset-top)+16px)] h-14 items-center shrink-0">
        {!isLast && (
          <button
            onClick={finish}
            className="text-[14px] font-medium text-gray-400 active:text-gray-600 transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* Image area — slides with translateX */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 min-h-0">
        <div className="w-full relative overflow-hidden" style={{ height: '45vh' }}>
          <div
            className="flex h-full transition-transform duration-400 ease-in-out will-change-transform"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {SLIDES.map((s, i) => (
              <div
                key={i}
                className="shrink-0 w-full h-full flex items-center justify-center"
              >
                <img
                  src={s.image}
                  alt={s.title}
                  className="h-full w-full object-contain drop-shadow-sm"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Text block — animates via key change */}
        <div
          key={current}
          className="mt-10 flex flex-col items-center text-center animate-fadeUp"
        >
          <h2 className="text-[26px] font-bold text-gray-900 mb-3 tracking-tight">
            {slide.title}
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed max-w-[280px]">
            {slide.text}
          </p>
        </div>
      </div>

      {/* Bottom area: dots + button */}
      <div className="shrink-0 flex flex-col items-center gap-8 px-8 pb-[calc(env(safe-area-inset-bottom)+40px)]">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="transition-all duration-300"
            >
              <div
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'bg-[#14ae5c] w-6 h-2.5'
                    : 'bg-gray-200 w-2.5 h-2.5'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Button */}
        {isLast ? (
          <button
            onClick={finish}
            className="w-full bg-[#14ae5c] text-white py-4 rounded-2xl text-[16px] font-semibold active:scale-[0.97] transition-transform shadow-sm shadow-[#14ae5c]/30"
          >
            Get Started
          </button>
        ) : (
          <button
            onClick={next}
            className="w-full bg-[#14ae5c] text-white py-4 rounded-2xl text-[16px] font-semibold active:scale-[0.97] transition-transform shadow-sm shadow-[#14ae5c]/30"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
