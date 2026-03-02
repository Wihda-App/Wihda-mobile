import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import MobileContainer from '../components/MobileContainer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import PageTransition from '../components/PageTransition';
import { toast } from 'sonner';
import SwipeBack from '../components/SwipeBack';
import {
  ArrowLeft,
  Send,
  MoreVertical,
  CheckCheck,
  Phone,
  Award,
} from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  timestamp: Date;
}

const mockMessages: Message[] = [
  { id: 1, text: 'Hi! Is this still available?', sender: 'other', timestamp: new Date(Date.now() - 3600000) },
  { id: 2, text: 'Yes, it is! When can you pick it up?', sender: 'me', timestamp: new Date(Date.now() - 3000000) },
  { id: 3, text: 'Great! How about tomorrow afternoon?', sender: 'other', timestamp: new Date(Date.now() - 2400000) },
  { id: 4, text: 'Perfect! I\'ll be home after 2pm', sender: 'me', timestamp: new Date(Date.now() - 1800000) },
];

export default function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showComplete, setShowComplete] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'me',
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <MobileContainer>
      <PageTransition>
      <SwipeBack>
      <div className="flex flex-col size-full bg-gray-50">
        {/* Header */}
        <div className="bg-white px-4 pt-[env(safe-area-inset-top)] pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3 h-14">
            <button onClick={() => navigate(-1)} className="text-gray-800">
              <ArrowLeft className="size-6" />
            </button>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1557353425-09253747c2bf?w=100&h=100&fit=crop"
              alt="User"
              className="size-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-gray-800">Sara M.</p>
              <p className="text-[11px] text-[#14ae5c] font-medium">Online</p>
            </div>
            <button className="text-gray-400">
              <MoreVertical className="size-5" />
            </button>
          </div>

          {/* Transaction Info */}
          <div className="bg-green-50 rounded-xl px-3 py-2 flex items-center gap-2 mt-1">
            <div className="size-2 rounded-full bg-[#14ae5c] animate-pulse" />
            <p className="text-[11px] text-gray-600">
              <span className="font-medium text-gray-800">Active transaction</span> &middot; Fresh homemade bread
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            {/* Date separator */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400">Today</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 ${
                    message.sender === 'me'
                      ? 'bg-[#14ae5c] text-white rounded-2xl rounded-br-md'
                      : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-[14px] leading-relaxed">{message.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${
                    message.sender === 'me' ? 'justify-end' : ''
                  }`}>
                    <p className={`text-[10px] ${
                      message.sender === 'me' ? 'text-white/60' : 'text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                    {message.sender === 'me' && (
                      <CheckCheck className="size-3 text-white/60" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Complete Transaction Card */}
          {showComplete && (
            <div className="bg-white rounded-2xl p-4 mt-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Award className="size-5 text-[#f0a326]" />
                <p className="text-[14px] font-semibold text-gray-800">Mark as Complete?</p>
              </div>
              <p className="text-[12px] text-gray-500 mb-3">
                Once both parties confirm, you'll each receive coins!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowComplete(false);
                    toast('Transaction confirmed!', {
                      description: 'Coins will be credited shortly',
                      duration: 2500,
                    });
                  }}
                  className="flex-1 bg-[#14ae5c] text-white py-2.5 rounded-xl text-[13px] font-semibold active:scale-95 transition-transform"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowComplete(false)}
                  className="flex-1 bg-gray-100 text-gray-500 py-2.5 rounded-xl text-[13px] font-medium active:scale-95 transition-transform"
                >
                  Not Yet
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="bg-white px-4 py-3 border-t border-gray-100 pb-[env(safe-area-inset-bottom)]"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-[14px] placeholder:text-gray-400 border border-gray-100 focus:border-[#14ae5c] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className={`size-[42px] rounded-full flex items-center justify-center transition-all active:scale-95 ${
                newMessage.trim()
                  ? 'bg-[#14ae5c] text-white shadow-md'
                  : 'bg-gray-100 text-gray-400'
              }`}
              aria-label="Send"
            >
              <Send className="size-5" />
            </button>
          </div>
        </form>
      </div>
      </SwipeBack>
      </PageTransition>
    </MobileContainer>
  );
}