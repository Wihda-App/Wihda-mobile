import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileContainer from '../components/MobileContainer';
import PageTransition from '../components/PageTransition';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Mail, KeyRound, Lock, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';

type Step = 'email' | 'code' | 'password' | 'success';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await apiFetch('/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setStep('code');
      toast('Code sent', { description: 'Check your email for the reset code' });
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { setError('Enter the 6-digit code'); return; }
    setLoading(true);
    setError('');
    try {
      await apiFetch('/v1/auth/verify-reset-code', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
      });
      setStep('password');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      await apiFetch('/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code,
          new_password: newPassword,
        }),
      });
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <PageTransition>
        <div className="flex flex-col size-full bg-white">
          {/* Header */}
          <div className="px-5 pt-[env(safe-area-inset-top)]">
            <div className="flex items-center gap-3 h-14">
              <button
                onClick={() => step === 'email' ? navigate('/login') : setStep(step === 'code' ? 'email' : step === 'password' ? 'code' : 'email')}
                className="text-gray-800"
              >
                <ArrowLeft className="size-6" />
              </button>
              <h1 className="text-[18px] font-semibold text-gray-900">
                {step === 'email' && 'Forgot Password'}
                {step === 'code' && 'Enter Code'}
                {step === 'password' && 'New Password'}
                {step === 'success' && 'Done'}
              </h1>
            </div>

            {/* Progress bar */}
            {step !== 'success' && (
              <div className="flex gap-1.5 mb-2">
                {(['email', 'code', 'password'] as Step[]).map((s, i) => (
                  <div key={s} className={`h-1 rounded-full flex-1 transition-all ${
                    ['email', 'code', 'password'].indexOf(step) >= i ? 'bg-[#14ae5c]' : 'bg-gray-100'
                  }`} />
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 pt-6 pb-10">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-5 text-[13px] text-red-600">
                {error}
              </div>
            )}

            {/* ── Step 1: Email ── */}
            {step === 'email' && (
              <form onSubmit={handleSendCode} className="flex flex-col gap-5">
                <div>
                  <p className="text-gray-500 text-[14px] mb-6">
                    Enter your email address and we'll send you a code to reset your password.
                  </p>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3.5 text-[14px] placeholder:text-gray-400 focus:border-[#14ae5c] focus:outline-none transition-colors"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-[#14ae5c] text-white py-3.5 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {loading ? <Loader2 className="size-5 animate-spin" /> : 'Send Code'}
                </button>
              </form>
            )}

            {/* ── Step 2: OTP Code ── */}
            {step === 'code' && (
              <form onSubmit={handleVerifyCode} className="flex flex-col gap-5">
                <p className="text-gray-500 text-[14px] mb-2">
                  We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>. Enter it below.
                </p>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3.5 text-[20px] font-mono tracking-[0.3em] placeholder:text-gray-300 focus:border-[#14ae5c] focus:outline-none transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-[#14ae5c] text-white py-3.5 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {loading ? <Loader2 className="size-5 animate-spin" /> : 'Verify Code'}
                </button>
                <button
                  type="button"
                  onClick={() => { setError(''); handleSendCode({ preventDefault: () => {} } as any); }}
                  className="text-[13px] text-[#14ae5c] font-medium text-center"
                >
                  Resend code
                </button>
              </form>
            )}

            {/* ── Step 3: New Password ── */}
            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <p className="text-gray-500 text-[14px] mb-2">
                  Choose a new password for your account.
                </p>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-12 py-3.5 text-[14px] placeholder:text-gray-400 focus:border-[#14ae5c] focus:outline-none transition-colors"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3.5 text-[14px] placeholder:text-gray-400 focus:border-[#14ae5c] focus:outline-none transition-colors"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <p className="text-[12px] text-gray-400">Minimum 8 characters</p>
                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full bg-[#14ae5c] text-white py-3.5 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
                >
                  {loading ? <Loader2 className="size-5 animate-spin" /> : 'Reset Password'}
                </button>
              </form>
            )}

            {/* ── Success ── */}
            {step === 'success' && (
              <div className="flex flex-col items-center pt-8">
                <div className="bg-green-50 rounded-3xl p-6 mb-5">
                  <CheckCircle2 className="size-16 text-[#14ae5c]" />
                </div>
                <h2 className="text-[22px] font-semibold text-gray-900 mb-2">Password Reset!</h2>
                <p className="text-gray-500 text-[14px] text-center mb-8 px-4">
                  Your password has been updated. You can now sign in with your new password.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-[#14ae5c] text-white py-3.5 rounded-xl text-[15px] font-semibold active:scale-[0.98] transition-all"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </MobileContainer>
  );
}
