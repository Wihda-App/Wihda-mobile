import { ReactNode, useEffect, useState } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  type?: 'slide' | 'fade' | 'scale';
}

export default function PageTransition({ children, type = 'slide' }: PageTransitionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Tiny delay for CSS animation trigger
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const animClass = type === 'slide'
    ? 'animate-page-slide-in'
    : type === 'scale'
    ? 'animate-page-scale-in'
    : 'animate-page-fade-in';

  return (
    <div className={`size-full ${mounted ? animClass : 'opacity-0'}`}>
      {children}
    </div>
  );
}
