import { ReactNode, ButtonHTMLAttributes } from 'react';

interface HapticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  hapticStyle?: 'light' | 'medium' | 'heavy';
}

function triggerHaptic(style: 'light' | 'medium' | 'heavy') {
  if ('vibrate' in navigator) {
    const duration = style === 'light' ? 5 : style === 'medium' ? 10 : 20;
    navigator.vibrate(duration);
  }
}

export default function HapticButton({
  children,
  hapticStyle = 'light',
  onClick,
  className = '',
  ...props
}: HapticButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic(hapticStyle);
    onClick?.(e);
  };

  return (
    <button
      onClick={handleClick}
      className={`active:scale-95 transition-transform duration-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
