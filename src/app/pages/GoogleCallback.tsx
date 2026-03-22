import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import MobileContainer from '../components/MobileContainer';
import { useAuth } from '../context/AuthContext';
import { apiFetch, setTokens } from '../lib/api';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Google sign-in was cancelled or failed.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Backend redirects here with tokens already issued
    if (accessToken) {
      setTokens(accessToken, refreshToken || '');
      refreshProfile().then(() => navigate('/home', { replace: true }));
      return;
    }

    navigate('/login');
  }, [searchParams, navigate, refreshProfile]);

  return (
    <MobileContainer>
      <div className="flex flex-col items-center justify-center size-full bg-white gap-4">
        {error ? (
          <p className="text-red-500 text-[14px] text-center px-8">{error}</p>
        ) : (
          <>
            <div className="size-10 border-3 border-gray-200 border-t-[#14ae5c] rounded-full animate-spin" />
            <p className="text-gray-500 text-[14px]">Signing you in...</p>
          </>
        )}
      </div>
    </MobileContainer>
  );
}
