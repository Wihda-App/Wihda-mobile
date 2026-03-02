import { ReactNode, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export default function PullToRefresh({ children, onRefresh, className = '' }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const threshold = 70;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container || container.scrollTop > 0 || isRefreshing) return;
    startY.current = e.touches[0].clientY;
    isPulling.current = true;
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      isPulling.current = false;
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    if (diff > 0) {
      // Rubber band effect: diminishing returns
      const distance = Math.min(diff * 0.4, 120);
      setPullDistance(distance);
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold * 0.6);
      try {
        await onRefresh();
      } catch (e) {
        // ignore
      }
      setIsRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, isRefreshing, onRefresh]);

  const spinnerOpacity = Math.min(pullDistance / threshold, 1);
  const spinnerScale = 0.5 + spinnerOpacity * 0.5;

  return (
    <div className="relative size-full overflow-hidden">
      {/* Pull indicator */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center transition-all duration-200"
        style={{
          top: Math.max(pullDistance - 40, -40),
          opacity: spinnerOpacity,
          transform: `translateX(-50%) scale(${spinnerScale})`,
        }}
      >
        <div className={`bg-white rounded-full p-2 shadow-lg border border-gray-100 ${isRefreshing ? '' : ''}`}>
          <Loader2
            className={`size-5 text-[#14ae5c] ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: isRefreshing ? undefined : `rotate(${pullDistance * 3}deg)`,
            }}
          />
        </div>
      </div>

      <div
        ref={containerRef}
        className={`size-full overflow-y-auto ${className}`}
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: isPulling.current ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
