import { useNavigate } from 'react-router';
import { Menu, ShoppingBag, MapPin, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

export default function Header({
  showBack = false,
  title,
}: HeaderProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const userName = profile?.name?.split(' ')[0] || 'Neighbor';
  const neighborhood = profile?.location || 'Set location';
  const coinsBalance = profile?.coins ?? 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (title) {
    return (
      <div className="flex items-center justify-between px-5 pt-[env(safe-area-inset-top)] bg-white">
        <div className="flex items-center gap-3 h-14">
          {showBack && (
            <button onClick={() => navigate(-1)} className="text-gray-800 -ml-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-[18px] font-semibold text-gray-900 font-[Poppins,sans-serif]">{title}</h1>
        </div>
        <div className="flex items-center gap-2 bg-[#fff9e6] px-3 py-1.5 rounded-full">
          <div className="size-[18px] rounded-full border-[1.5px] border-[#f0a326] flex items-center justify-center">
            <span className="text-[8px] font-bold text-[#f0a326]">$</span>
          </div>
          <span className="text-[13px] font-semibold text-[#f0a326]">{coinsBalance}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-[env(safe-area-inset-top)] pb-4 bg-gradient-to-b from-[#f0faf4] to-white">
      <div className="flex items-center justify-between h-12">
        <button className="text-gray-800" aria-label="Menu">
          <Menu className="size-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#fff9e6] px-3 py-1.5 rounded-full">
            <div className="size-[18px] rounded-full border-[1.5px] border-[#f0a326] flex items-center justify-center">
              <span className="text-[8px] font-bold text-[#f0a326]">$</span>
            </div>
            <span className="text-[13px] font-semibold text-[#f0a326]">{coinsBalance}</span>
          </div>
          <button onClick={() => navigate('/store')} className="text-gray-800" aria-label="Store">
            <ShoppingBag className="size-5" />
          </button>
        </div>
      </div>
      <div className="mt-1">
        <h2 className="text-[20px] font-semibold text-gray-900 font-[Poppins,sans-serif]">
          {getGreeting()}, {userName}
        </h2>
        <button onClick={() => navigate('/choose-location')} className="flex items-center gap-1 mt-0.5">
          <MapPin className="size-3 text-[#14ae5c]" />
          <span className="text-[12px] text-gray-500">{neighborhood}</span>
          <ChevronDown className="size-3 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
