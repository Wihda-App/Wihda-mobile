import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import MobileContainer from '../components/MobileContainer';
import PageTransition from '../components/PageTransition';
import SwipeBack from '../components/SwipeBack';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'sonner';
import {
  ArrowLeft, Send, CheckCheck, Loader2, HandshakeIcon,
} from 'lucide-react';

type ConfirmationState = null | 'giver_confirmed' | 'completed' | 'cancelled';

interface Message {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
  message_type: string;
}

interface ThreadInfo {
  id: string;
  match_id: string | null;
  offer_id: string | null;
  need_id: string | null;
  confirmation_state: ConfirmationState;
  giver_id: string | null;
  receiver_id: string | null;
  other_user?: { id: string; display_name: string } | null;
  status: string;
}

export default function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [thread, setThread] = useState<ThreadInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loadingThread, setLoadingThread] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const loadThread = useCallback(async () => {
    if (!chatId) return;
    try {
      const data = await apiFetch(`/v1/chats/${chatId}`);
      if (data.success) setThread(data.data);
    } catch {}
  }, [chatId]);

  const loadMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      const data = await apiFetch(`/v1/chats/${chatId}/messages`);
      if (data.success) {
        setMessages(data.data.messages || []);
        setTimeout(scrollToBottom, 50);
      }
    } catch {}
  }, [chatId]);

  useEffect(() => {
    const init = async () => {
      setLoadingThread(true);
      await Promise.all([loadThread(), loadMessages()]);
      setLoadingThread(false);
    };
    init();
    pollRef.current = setInterval(() => { loadMessages(); loadThread(); }, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadThread, loadMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage || !chatId) return;
    setSendingMessage(true);
    const text = newMessage.trim();
    setNewMessage('');
    try {
      await apiFetch(`/v1/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: text, message_type: 'text' }),
      });
      await loadMessages();
    } catch {
      toast.error('Failed to send message');
      setNewMessage(text);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleConfirm = async (action: 'confirm' | 'cancel') => {
    if (!chatId || confirming) return;
    setConfirming(true);
    try {
      const data = await apiFetch(`/v1/chats/${chatId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      if (data.success) {
        await loadThread();
        if (data.data.confirmation_state === 'completed') {
          toast.success('Exchange complete! 🎉 Coins awarded!');
        } else if (data.data.confirmation_state === 'cancelled') {
          toast.error('Exchange cancelled');
        } else {
          toast.success('Waiting for the other party to confirm...');
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Confirmation failed');
    } finally {
      setConfirming(false);
    }
  };

  const formatTime = (isoDate: string) =>
    new Date(isoDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Role detection
  const isGiver = !!user && thread?.giver_id === user.id;
  const isReceiver = !!user && thread?.receiver_id === user.id;
  const confirmState = thread?.confirmation_state ?? null;
  const isGiveThread = !!thread?.offer_id;
  const isClosed = thread?.status === 'closed';

  // What the confirmation bar should show
  const showGiverAction =
    !isClosed && isGiver && confirmState === null;
  const showReceiverAction =
    !isClosed && isReceiver && confirmState === 'giver_confirmed';
  const showWaiting =
    !isClosed && isGiver && confirmState === 'giver_confirmed';

  const otherUserName = thread?.other_user?.display_name || 'Chat';

  if (loadingThread) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center size-full bg-white dark:bg-gray-900">
          <Loader2 className="size-8 text-[#14ae5c] animate-spin" />
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <PageTransition>
      <Toaster position="top-center" />
      <SwipeBack>
      <div className="flex flex-col size-full bg-gray-50 dark:bg-gray-900">

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 px-4 pt-[env(safe-area-inset-top)] pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 h-14">
            <button onClick={() => navigate(-1)} className="text-gray-800 dark:text-gray-200">
              <ArrowLeft className="size-6" />
            </button>
            <div className="size-10 rounded-full bg-[#14ae5c]/10 flex items-center justify-center">
              <span className="text-[16px] font-bold text-[#14ae5c]">
                {otherUserName[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-gray-800 dark:text-white truncate">{otherUserName}</p>
              <p className="text-[11px] text-gray-400">
                {isClosed ? 'Closed' : (isGiveThread ? 'Food Share' : 'Help Request')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Confirmation bar (top of messages, always visible) ── */}
        {showGiverAction && (
          <div className="bg-[#14ae5c] px-4 py-3 flex items-center justify-between">
            <p className="text-white text-[13px] font-medium">
              {isGiveThread ? 'Did you give the item?' : 'Did you provide help?'}
            </p>
            <button
              onClick={() => handleConfirm('confirm')}
              disabled={confirming}
              className="bg-white text-[#14ae5c] px-4 py-1.5 rounded-full text-[12px] font-bold active:scale-95 transition-transform disabled:opacity-60"
            >
              {confirming ? <Loader2 className="size-3.5 animate-spin" /> : 'YES'}
            </button>
          </div>
        )}

        {showReceiverAction && (
          <div className="bg-orange-500 px-4 py-3">
            <p className="text-white text-[13px] font-medium mb-2">
              {isGiveThread ? 'Did you receive the item?' : 'Did you receive help?'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleConfirm('confirm')}
                disabled={confirming}
                className="flex-1 bg-white text-orange-600 py-2 rounded-full text-[12px] font-bold active:scale-95 transition-transform disabled:opacity-60"
              >
                {confirming ? <Loader2 className="size-3.5 animate-spin inline" /> : 'YES, I received it'}
              </button>
              <button
                onClick={() => handleConfirm('cancel')}
                disabled={confirming}
                className="flex-1 bg-orange-600/20 text-white py-2 rounded-full text-[12px] font-medium active:scale-95 transition-transform disabled:opacity-60"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {showWaiting && (
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2.5 flex items-center gap-2">
            <div className="size-2 rounded-full bg-blue-400 animate-pulse" />
            <p className="text-[12px] text-blue-700 dark:text-blue-300">Waiting for the other party to confirm...</p>
          </div>
        )}

        {confirmState === 'completed' && (
          <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 flex items-center gap-3">
            <HandshakeIcon className="size-5 text-[#14ae5c]" />
            <div>
              <p className="text-[13px] font-semibold text-green-800 dark:text-green-300">Exchange Complete!</p>
              <p className="text-[11px] text-green-600 dark:text-green-400">Coins have been awarded to both parties.</p>
            </div>
          </div>
        )}

        {confirmState === 'cancelled' && (
          <div className="bg-red-50 dark:bg-red-900/20 px-4 py-2.5">
            <p className="text-[12px] text-red-600 dark:text-red-400 font-medium">Exchange was cancelled. No coins awarded.</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-16 rounded-full bg-[#14ae5c]/10 flex items-center justify-center mb-3">
                <span className="text-[28px]">👋</span>
              </div>
              <p className="text-[14px] font-medium text-gray-700 dark:text-gray-300">Start the conversation</p>
              <p className="text-[12px] text-gray-400 mt-1">Coordinate your exchange here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                const isSystem = msg.message_type === 'system';
                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-[11px] px-3 py-1 rounded-full">{msg.body}</span>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 ${
                      isMe
                        ? 'bg-[#14ae5c] text-white rounded-2xl rounded-br-md'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-2xl rounded-bl-md shadow-sm'
                    }`}>
                      <p className="text-[14px] leading-relaxed">{msg.body}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                        <p className={`text-[10px] ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                        {isMe && <CheckCheck className="size-3 text-white/60" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!isClosed ? (
          <form
            onSubmit={handleSend}
            className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-100 dark:border-gray-700 pb-[env(safe-area-inset-bottom)]"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-full px-4 py-2.5 text-[14px] placeholder:text-gray-400 border border-gray-100 dark:border-gray-600 focus:border-[#14ae5c] focus:outline-none transition-colors dark:text-white"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sendingMessage}
                className={`size-[42px] rounded-full flex items-center justify-center transition-all active:scale-95 ${
                  newMessage.trim() && !sendingMessage
                    ? 'bg-[#14ae5c] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}
              >
                {sendingMessage ? <Loader2 className="size-4 animate-spin text-gray-400" /> : <Send className="size-5" />}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white dark:bg-gray-800 px-4 py-4 border-t border-gray-100 dark:border-gray-700 pb-[env(safe-area-inset-bottom)]">
            <p className="text-center text-[13px] text-gray-400">This chat is closed</p>
          </div>
        )}
      </div>
      </SwipeBack>
      </PageTransition>
    </MobileContainer>
  );
}
