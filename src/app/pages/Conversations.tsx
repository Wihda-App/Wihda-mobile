import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { MessageCircle, User, ArrowUpRight, ArrowDownLeft, ChevronLeft } from 'lucide-react';
import MobileContainer from '../components/MobileContainer';
import BottomNav from '../components/BottomNav';
import PageTransition from '../components/PageTransition';
import PullToRefresh from '../components/PullToRefresh';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Thread {
  id: string;
  post_title: string | null;
  post_type: 'give' | 'get' | null;
  other_user: { id: string; display_name: string } | null;
  last_message: { body: string; created_at: string } | null;
  unread_count: number;
  status: string;
  created_at: string;
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function UserAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = [
    'bg-green-100 text-green-600',
    'bg-blue-100 text-blue-600',
    'bg-purple-100 text-purple-600',
    'bg-orange-100 text-orange-600',
    'bg-teal-100 text-teal-600',
    'bg-rose-100 text-rose-600',
  ];
  const color = colors[initial.charCodeAt(0) % colors.length];
  return (
    <div className={`size-12 rounded-full ${color} flex items-center justify-center text-[16px] font-semibold shrink-0`}>
      {initial}
    </div>
  );
}

export default function Conversations() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadThreads = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiFetch('/v1/chats');
      if (data.success) setThreads(data.data.threads || []);
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  return (
    <MobileContainer>
      <PageTransition type="slide">
        <div className="flex flex-col size-full bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-[env(safe-area-inset-top)] pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-700 dark:text-gray-200 -ml-1 active:scale-90 transition-transform"
            >
              <ChevronLeft className="size-6" />
            </button>
            <h1 className="text-[18px] font-semibold text-gray-900 dark:text-white font-[Poppins,sans-serif] flex-1">
              Messages
            </h1>
          </div>

          {/* Thread list */}
          <PullToRefresh onRefresh={loadThreads} className="flex-1 pb-28">
            {loading ? (
              <div className="flex flex-col gap-3 px-5 pt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="size-12 rounded-full bg-gray-100 shrink-0" />
                    <div className="flex-1">
                      <div className="h-3.5 bg-gray-100 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-8">
                <div className="size-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <MessageCircle className="size-8 text-gray-300" />
                </div>
                <p className="text-[15px] font-semibold text-gray-800 dark:text-white mb-1">No conversations yet</p>
                <p className="text-[13px] text-gray-400 text-center">
                  When you match with a neighbor on a post, your conversation will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {threads.map((thread) => {
                  const name = thread.other_user?.display_name || 'Neighbor';
                  const hasUnread = thread.unread_count > 0;
                  const timeStr = thread.last_message?.created_at
                    ? getRelativeTime(thread.last_message.created_at)
                    : getRelativeTime(thread.created_at);

                  return (
                    <button
                      key={thread.id}
                      onClick={() => navigate(`/chat/${thread.id}`)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 active:bg-gray-50 dark:active:bg-gray-800 transition-colors text-left"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <UserAvatar name={name} />
                        {hasUnread && (
                          <span className="absolute -top-0.5 -right-0.5 size-4 bg-[#14ae5c] rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">
                              {thread.unread_count > 9 ? '9+' : thread.unread_count}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`text-[14px] truncate ${hasUnread ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-800 dark:text-gray-200'}`}>
                              {thread.post_title || name}
                            </span>
                            {thread.post_type === 'give' && (
                              <span className="shrink-0 flex items-center gap-0.5 text-[10px] font-medium text-[#14ae5c] bg-green-50 px-1.5 py-0.5 rounded-full">
                                <ArrowUpRight className="size-2.5" /> Give
                              </span>
                            )}
                            {thread.post_type === 'get' && (
                              <span className="shrink-0 flex items-center gap-0.5 text-[10px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
                                <ArrowDownLeft className="size-2.5" /> Get
                              </span>
                            )}
                          </div>
                          <span className={`shrink-0 text-[11px] ${hasUnread ? 'text-[#14ae5c] font-semibold' : 'text-gray-400'}`}>
                            {timeStr}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <p className={`text-[12px] truncate ${hasUnread ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                            {thread.last_message?.body || `With ${name}`}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </PullToRefresh>

          <BottomNav />
        </div>
      </PageTransition>
    </MobileContainer>
  );
}
