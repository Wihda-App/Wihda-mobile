import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import MobileContainer from '../components/MobileContainer';
import { useAuth } from '../context/AuthContext';
import { setTokens } from '../lib/api';

/**
 * Handles Apple Sign In OAuth redirects from the backend.
 * Apple POSTs to the backend which then redirects here with tokens in the URL.
 *
 * ?access_token=...&refresh_token=... → store tokens, navigate home
 * ?error=...                          → show message, redirect to login
 */
export default function AppleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken  = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const errorParam   = searchParams.get('error');

    if (errorParam) {
      setError('Apple sign-in failed. Please try again.');
      setTimeout(() => navigate('/login'), 2500);
      return;
    }

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
            <div className="size-10 border-[3px] border-gray-200 border-t-[#14ae5c] rounded-full animate-spin" />
            <p className="text-gray-500 text-[14px]">Signing you in…</p>
          </>
        )}
      </div>
    </MobileContainer>
  );
}
