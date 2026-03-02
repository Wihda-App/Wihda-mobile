import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileContainer from '../components/MobileContainer';
import BottomNav from '../components/BottomNav';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import PageTransition from '../components/PageTransition';
import {
  ArrowLeft,
  Search,
  Bell,
  Calendar,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';

const mockActivities = [
  {
    id: 1,
    organizationName: 'Croissant Rouge Algerien',
    title: 'Join the Red Cross First Aid Training',
    date: '21 May 2025',
    dateShort: { day: '21', month: 'May' },
    postedDate: '12 April 2025',
    image: 'https://images.unsplash.com/photo-1605714007165-c15eac9c647b?w=600&h=400&fit=crop',
    likes: 124,
    comments: 9,
    coinReward: 300,
    deadline: 'Deadline 21 May 2025',
    joined: false,
  },
  {
    id: 2,
    organizationName: 'Green Earth Algeria',
    title: 'Community Park Cleanup Day',
    date: '8 Mar 2025',
    dateShort: { day: '08', month: 'Mar' },
    postedDate: '20 Feb 2025',
    image: 'https://images.unsplash.com/photo-1612159788732-e189a4dd2284?w=600&h=400&fit=crop',
    likes: 89,
    comments: 15,
    coinReward: 200,
    deadline: 'Deadline 8 Mar 2025',
    joined: true,
  },
  {
    id: 3,
    organizationName: 'Aljazair Alkhadra',
    title: 'Tree Planting Day – 500 Trees for Algiers',
    date: '15 Apr 2025',
    dateShort: { day: '15', month: 'Apr' },
    postedDate: '1 Mar 2025',
    image: 'https://images.unsplash.com/photo-1758599668356-c8c919e24dda?w=600&h=400&fit=crop',
    likes: 210,
    comments: 32,
    coinReward: 250,
    deadline: 'Deadline 15 Apr 2025',
    joined: false,
    emoji: '🌳',
    emojiBg: 'bg-green-50',
  },
  {
    id: 4,
    organizationName: 'First Governorate',
    title: 'Ramadan Food Distribution Drive',
    date: '5 Mar 2025',
    dateShort: { day: '05', month: 'Mar' },
    postedDate: '18 Feb 2025',
    image: 'https://images.unsplash.com/photo-1710092784814-4a6f158913b8?w=600&h=400&fit=crop',
    likes: 156,
    comments: 21,
    coinReward: 180,
    deadline: 'Deadline 5 Mar 2025',
    joined: false,
    emoji: '🏛️',
    emojiBg: 'bg-blue-50',
  },
];

const newsItems = [
  {
    id: 1,
    title: 'New Recycling Center Opens in Downtown',
    excerpt: 'A state-of-the-art recycling center has opened its doors to the community...',
    date: 'Feb 25, 2026',
  },
  {
    id: 2,
    title: 'Neighborhood Watch Program Success',
    excerpt: 'Crime rates dropped 30% since the neighborhood watch was established...',
    date: 'Feb 22, 2026',
  },
  {
    id: 3,
    title: 'Community Garden Project Launch',
    excerpt: 'Join the new community garden initiative starting next month...',
    date: 'Feb 20, 2026',
  },
];

export default function Activities() {
  const [activeTab, setActiveTab] = useState<'activities' | 'news'>('activities');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <PageTransition>
      <div className="flex flex-col size-full bg-white">
        {/* Header */}
        <div className="px-5 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between h-14">
            <button onClick={() => navigate('/home')} className="text-gray-800">
              <ArrowLeft className="size-6" />
            </button>
            <h1 className="text-[18px] font-semibold text-gray-900 font-[Poppins,sans-serif]">Activities</h1>
            <button className="relative" aria-label="Notifications">
              <Bell className="size-5 text-gray-800" />
              <div className="absolute -top-0.5 -right-0.5 size-2 bg-red-500 rounded-full" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 rounded-xl pl-10 pr-4 py-2.5 text-[13px] placeholder:text-gray-400 border border-gray-100 focus:border-[#14ae5c] focus:outline-none transition-colors"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === 'activities'
                  ? 'bg-white text-[#14ae5c] shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Activities
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === 'news'
                  ? 'bg-white text-[#14ae5c] shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              News
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24 px-5">
          {activeTab === 'activities' ? (
            <>
              {/* Clean & Earn Banner */}
              <button
                onClick={() => navigate('/clean-earn')}
                className="w-full bg-gradient-to-r from-[#14ae5c] to-emerald-600 rounded-2xl p-4 mb-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
              >
                <div className="bg-white/20 rounded-full p-2">
                  <Sparkles className="size-5 text-yellow-300" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-[14px] font-semibold">Clean & Earn Coins</p>
                  <p className="text-white/70 text-[11px]">Earn up to 200 coins per cleanup</p>
                </div>
                <ChevronRight className="size-5 text-white/60" />
              </button>

              {/* Activity Cards */}
              {mockActivities.map((activity) => (
                <div key={activity.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4 shadow-sm">
                  {/* Org Header */}
                  <div className="flex items-center gap-3 p-4 pb-2">
                    <div className={`size-10 rounded-full ${(activity as any).emojiBg || (activity.id === 1 ? 'bg-red-50' : 'bg-green-50')} flex items-center justify-center text-[16px]`}>
                      {(activity as any).emoji || (activity.id === 1 ? '🏥' : '🌿')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 truncate">{activity.organizationName}</p>
                      <p className="text-[11px] text-gray-400">{activity.postedDate}</p>
                    </div>
                    <button className="text-gray-400">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>

                  {/* Image */}
                  <div className="relative mx-4 rounded-xl overflow-hidden">
                    <ImageWithFallback
                      src={activity.image}
                      alt={activity.title}
                      className="w-full h-[160px] object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white rounded-lg px-2.5 py-1.5 shadow-sm">
                      <p className="text-[16px] font-bold text-gray-800 leading-tight">{activity.dateShort.day}</p>
                      <p className="text-[10px] font-semibold text-red-500">{activity.dateShort.month}</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 pt-3">
                    <h3 className="text-[15px] font-semibold text-gray-800 mb-1">{activity.title}</h3>
                    <p className="text-[11px] text-gray-400 mb-3">{activity.deadline}</p>

                    <div className="flex items-center gap-2 mb-3">
                      <button className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all active:scale-95 ${
                        activity.joined
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-[#14ae5c] text-white'
                      }`}>
                        {activity.joined ? 'Joined' : 'Join Activity'}
                      </button>
                      <div className="flex items-center gap-1 text-[#f0a326] font-semibold text-[12px]">
                        <div className="size-[18px] rounded-full border-[1.5px] border-[#f0a326] flex items-center justify-center">
                          <span className="text-[7px] font-bold">$</span>
                        </div>
                        {activity.coinReward}
                      </div>
                    </div>

                    <div className="border-t border-gray-50 pt-3 flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-gray-400">
                        <Heart className="size-4" />
                        <span className="text-[12px]">{activity.likes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-gray-400">
                        <MessageCircle className="size-4" />
                        <span className="text-[12px]">{activity.comments}</span>
                      </button>
                      <button className="ml-auto text-gray-400">
                        <Share2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="space-y-3">
              {newsItems.map((news) => (
                <div key={news.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <p className="text-[10px] text-gray-400 mb-1">{news.date}</p>
                  <h3 className="text-[14px] font-semibold text-gray-800 mb-1">{news.title}</h3>
                  <p className="text-[12px] text-gray-500 line-clamp-2">{news.excerpt}</p>
                  <button className="text-[#14ae5c] text-[12px] font-medium mt-2 flex items-center gap-0.5">
                    Read more <ChevronRight className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
      </PageTransition>
    </MobileContainer>
  );
}