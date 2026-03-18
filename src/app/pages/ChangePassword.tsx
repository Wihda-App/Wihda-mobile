import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileContainer from '../components/MobileContainer';
import PageTransition from '../components/PageTransition';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../lib/i18n';
import { apiFetch } from '../lib/api';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { language } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/v1/me/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <PageTransition>
      <div className="flex flex-col size-full bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="px-5 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center h-14 gap-3">
            <button onClick={() => navigate('/settings')} className="text-gray-800 dark:text-gray-200">
              <ArrowLeft className="size-6" />
            </button>
            <h1 className="text-[18px] font-semibold text-gray-900 dark:text-white flex-1 font-[Poppins,sans-serif]">
              {t(language, 'changePasswordTitle')}
            </h1>
          </div>
        </div>

        <div className="flex-1 px-6 pt-4 overflow-y-auto pb-10">
          {done ? (
            <div className="flex flex-col items-center justify-center pt-20">
              <div className="bg-green-50 dark:bg-green-900/30 rounded-full p-5 mb-4">
                <CheckCircle2 className="size-12 text-[#14ae5c]" />
              </div>
              <h2 className="text-[20px] font-semibold text-gray-900 dark:text-white mb-2">
                {t(language, 'passwordChanged')}
              </h2>
              <button
                onClick={() => navigate('/settings')}
                className="mt-6 bg-[#14ae5c] text-white px-8 py-3 rounded-xl text-[14px] font-semibold active:scale-[0.98] transition-all"
              >
                {t(language, 'backToSettings')}
              </button>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <Lock className="size-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-blue-700 dark:text-blue-300 leading-relaxed">
                  {language === 'ar'
                    ? 'أدخل كلمة مرورك الحالية ثم اختر كلمة مرور جديدة قوية.'
                    : 'Enter your current password, then choose a strong new password.'}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current password */}
                <div>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium mb-1.5">
                    {t(language, 'currentPasswordLabel')}
                  </p>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl pl-11 pr-11 py-3.5 text-[14px] text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-[#14ae5c] focus:outline-none transition-colors"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium mb-1.5">
                    {t(language, 'newPasswordLabel')}
                  </p>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl pl-11 pr-11 py-3.5 text-[14px] text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-[#14ae5c] focus:outline-none transition-colors"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm new password */}
                <div>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium mb-1.5">
                    {t(language, 'confirmNewPassword')}
                  </p>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-[#14ae5c] focus:outline-none transition-colors"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#14ae5c] text-white py-3.5 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
                >
                  {loading ? (
                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    t(language, 'changePasswordTitle')
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      </PageTransition>
    </MobileContainer>
  );
}
