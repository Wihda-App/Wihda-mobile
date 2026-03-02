import { ReactNode, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';

interface SwipeBackProps {
  children: ReactNode;
  enabled?: boolean;
}

export default function SwipeBack({ children, enabled = true }: SwipeBackProps) {
  const navigate = useNavigate();
  const [swipeX, setSwipeX] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const startX = useRef(0);
  const startY = useRef(0);
  const isSwiping = useRef(false);
  const isHorizontal = useRef<boolean | null>(null);

  const threshold = 100;
  const edgeWidth = 30; // Only trigger from left edge

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    const touch = e.touches[0];
    // Only start if touching near left edge
    if (touch.clientX > edgeWidth) return;
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    isSwiping.current = true;
    isHorizontal.current = null;
  }, [enabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - startX.current;
    const diffY = touch.clientY - startY.current;

    // Determine direction on first significant move
    if (isHorizontal.current === null) {
      if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
        isHorizontal.current = Math.abs(diffX) > Math.abs(diffY);
        if (!isHorizontal.current) {
          isSwiping.current = false;
          return;
        }
      } else {
        return;
      }
    }

    if (diffX > 0) {
      const distance = Math.min(diffX * 0.7, 300);
      setSwipeX(distance);
      setOpacity(1 - (distance / 300) * 0.3);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    isHorizontal.current = null;

    if (swipeX >= threshold) {
      // Complete the swipe - navigate back
      setSwipeX(400);
      setOpacity(0);
      setTimeout(() => {
        navigate(-1);
      }, 150);
    } else {
      // Snap back
      setSwipeX(0);
      setOpacity(1);
    }
  }, [swipeX, navigate]);

  return (
    <div
      className="size-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Back arrow indicator */}
      {swipeX > 10 && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center"
          style={{
            opacity: Math.min(swipeX / threshold, 1),
            transform: `translateY(-50%) translateX(${Math.min(swipeX * 0.2, 20)}px)`,
          }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full size-10 flex items-center justify-center shadow-lg border border-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14ae5c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>
        </div>
      )}

      <div
        style={{
          transform: swipeX > 0 ? `translateX(${swipeX}px)` : undefined,
          opacity,
          transition: isSwiping.current ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0, 1), opacity 0.3s ease',
        }}
        className="size-full"
      >
        {children}
      </div>
    </div>
  );
}
