import { useNavigate } from 'react-router';
import MobileContainer from '../components/MobileContainer';
import PageTransition from '../components/PageTransition';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <PageTransition type="fade">
      <div className="flex flex-col items-center justify-center size-full px-8">
        <span className="text-[64px] mb-4">🔍</span>
        <h1 className="text-[22px] font-semibold text-gray-900 mb-2 font-[Poppins,sans-serif]">
          Page not found
        </h1>
        <p className="text-[14px] text-gray-500 text-center mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/home')}
          className="bg-[#14ae5c] text-white px-6 py-3 rounded-2xl text-[14px] font-semibold flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Home className="size-4" /> Go Home
        </button>
      </div>
      </PageTransition>
    </MobileContainer>
  );
}