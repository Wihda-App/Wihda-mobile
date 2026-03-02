import image_29f2e4e91e8e696361ddf7518d97e0f4bf57fb43 from 'figma:asset/29f2e4e91e8e696361ddf7518d97e0f4bf57fb43.png'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import MobileContainer from '../components/MobileContainer';
import BottomNav from '../components/BottomNav';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/supabase';
import {
  ArrowLeft,
  Settings,
  Edit3,
  Award,
  Flame,
  Clock,
  Package,
  Users,
  ChevronRight,
  Crown,
  BadgeCheck,
  MapPin,
  LogOut,
  User,
  Trash2,
} from 'lucide-react';

const badges = [
  { id: 1, name: 'Food Saver', icon: '🍞', color: 'bg-orange-50', earned: true },
  { id: 2, name: 'Active Member', icon: '⚡', color: 'bg-blue-50', earned: true },
  { id: 3, name: 'Citizen of Month', icon: '🏆', color: 'bg-yellow-50', earned: true },
  { id: 4, name: 'Local Giver', icon: '🤝', color: 'bg-green-50', earned: true },
  { id: 5, name: 'Top Helper', icon: '💪', color: 'bg-purple-50', earned: false },
  { id: 6, name: 'Eco Warrior', icon: '🌿', color: 'bg-emerald-50', earned: false },
];

interface UserPost {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  coins: number;
  createdAt: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { profile, user, signOut, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'activity' | 'posts'>('activity');
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const isGuest = !user;

  useEffect(() => {
    if (user?.id && activeTab === 'posts') {
      setLoadingPosts(true);
      apiFetch(`/posts/user/${user.id}`)
        .then(data => setUserPosts(data.posts || []))
        .catch(err => console.error('Failed to load user posts:', err))
        .finally(() => setLoadingPosts(false));
    }
  }, [user?.id, activeTab]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await apiFetch(`/posts/${postId}`, { method: 'DELETE' });
      setUserPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const recentActivity = [
    { id: 1, text: 'Shared fresh bread with neighbor', coins: 100, time: '2h ago', type: 'give' },
    { id: 2, text: 'Joined Red Cross Training', coins: 300, time: '1d ago', type: 'activity' },
    { id: 3, text: 'Clean & Earn - Park area', coins: 75, time: '3d ago', type: 'clean' },
  ];

  const displayName = profile?.name || 'Guest User';
  const displayLocation = profile?.location || 'Set your location';
  const displayBio = profile?.bio || (isGuest ? 'Sign in to set up your profile' : 'Tap Edit Profile to add a bio');
  const displayCoins = profile?.coins ?? 0;
  const displayPhoto = profile?.photoUrl || '';

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
            <h1 className="text-[18px] font-semibold text-gray-900 font-[Poppins,sans-serif]">My Profile</h1>
            {!isGuest ? (
              <button onClick={handleSignOut} className="text-gray-400" aria-label="Sign Out">
                <LogOut className="size-5" />
              </button>
            ) : (
              <button className="text-gray-800" aria-label="Settings">
                <Settings className="size-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Guest prompt */}
          {isGuest && (
            <div className="mx-5 mb-4 bg-gradient-to-r from-[#14ae5c] to-emerald-600 rounded-2xl p-4">
              <p className="text-white text-[15px] font-semibold mb-1">Join the community!</p>
              <p className="text-white/70 text-[12px] mb-3">Create an account to share items, earn coins, and connect with neighbors.</p>
              <div className="flex gap-2">
                <button onClick={() => navigate('/signup')} className="bg-white text-[#14ae5c] px-4 py-2 rounded-xl text-[13px] font-semibold active:scale-95 transition-transform">
                  Sign Up
                </button>
                <button onClick={() => navigate('/login')} className="bg-white/20 text-white px-4 py-2 rounded-xl text-[13px] font-semibold active:scale-95 transition-transform">
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* Profile Card */}
          <div className="px-5 pb-5">
            <div className="flex items-start gap-4">
              <div className="relative">
                {displayPhoto ? (
                  <ImageWithFallback
                    src={displayPhoto}
                    alt="Profile"
                    className="size-[68px] rounded-2xl object-cover"
                  />
                ) : (
                  <div className="size-[68px] rounded-2xl bg-gray-100 flex items-center justify-center">
                    <User className="size-8 text-gray-400" />
                  </div>
                )}
                {!isGuest && (
                  <div className="absolute -bottom-1 -right-1 bg-[#14ae5c] rounded-full p-0.5">
                    <BadgeCheck className="size-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] font-semibold text-gray-900">{displayName}</h2>
                  {!isGuest && <Crown className="size-4 text-[#f0a326]" />}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3 text-gray-400" />
                  <p className="text-[12px] text-gray-500">{displayLocation}</p>
                </div>
                <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
                  {displayBio}
                </p>
              </div>
            </div>

            {!isGuest && (
              <button
                onClick={() => navigate('/edit-profile')}
                className="mt-4 w-full bg-[#14ae5c] text-white py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Edit3 className="size-4" /> Edit Profile
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="px-5 mb-5">
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={Flame} label="Activities" value={String(profile?.activitiesJoined ?? 0)} color="text-orange-500" bg="bg-orange-50" />
              <StatCard icon={Package} label="Items Shared" value={String(profile?.itemsShared ?? 0)} color="text-blue-500" bg="bg-blue-50" />
              <StatCard icon={Clock} label="Volunteer" value={`${profile?.volunteerHours ?? 0}h`} color="text-purple-500" bg="bg-purple-50" />
            </div>
          </div>

          {/* Coins Balance */}
          <div className="px-5 mb-5">
            <div className="bg-gradient-to-r from-[#f0a326] to-[#e8932a] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-white/80 text-[12px] font-medium">Total Balance</p>
                <p className="text-white text-[28px] font-bold">{displayCoins}</p>
                <p className="text-white/60 text-[11px]">coins available</p>
              </div>
              <div className="bg-white/20 rounded-2xl p-3">
                <Award className="size-8 text-white" />
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="px-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-semibold text-gray-800">Badges</h3>
              <span className="text-[12px] text-gray-400">{badges.filter(b => b.earned).length}/{badges.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`${badge.color} rounded-2xl p-3 flex flex-col items-center gap-1.5 ${
                    !badge.earned ? 'opacity-40' : ''
                  }`}
                >
                  <span className="text-[24px]">{badge.icon}</span>
                  <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity / Posts Tabs */}
          <div className="px-5">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  activeTab === 'activity' ? 'bg-white text-[#14ae5c] shadow-sm' : 'text-gray-500'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  activeTab === 'posts' ? 'bg-white text-[#14ae5c] shadow-sm' : 'text-gray-500'
                }`}
              >
                My Posts
              </button>
            </div>

            {activeTab === 'activity' ? (
              <div className="space-y-2">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className={`size-9 rounded-full flex items-center justify-center ${
                      item.type === 'give' ? 'bg-blue-50 text-blue-500' :
                      item.type === 'activity' ? 'bg-orange-50 text-orange-500' :
                      'bg-green-50 text-[#14ae5c]'
                    }`}>
                      {item.type === 'give' ? <Package className="size-4" /> :
                       item.type === 'activity' ? <Users className="size-4" /> :
                       <Flame className="size-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-gray-800 truncate">{item.text}</p>
                      <p className="text-[11px] text-gray-400">{item.time}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#f0a326] text-[12px] font-semibold shrink-0">
                      +{item.coins}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {loadingPosts ? (
                  <div className="flex flex-col items-center py-8">
                    <div className="size-8 border-2 border-gray-200 border-t-[#14ae5c] rounded-full animate-spin mb-2" />
                    <p className="text-gray-400 text-[13px]">Loading posts...</p>
                  </div>
                ) : userPosts.length > 0 ? (
                  <div className="space-y-3">
                    {userPosts.map((post) => (
                      <div key={post.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        {post.image && (
                          <ImageWithFallback src={post.image} alt={post.title} className="w-full h-[120px] object-cover" />
                        )}
                        <div className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[14px] font-semibold text-gray-800 truncate">{post.title}</h4>
                              <p className="text-[12px] text-gray-500 line-clamp-1 mt-0.5">{post.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[11px] text-gray-400 capitalize bg-gray-50 px-2 py-0.5 rounded-full">{post.category}</span>
                                <div className="flex items-center gap-1 text-[#f0a326] text-[11px] font-semibold">
                                  <div className="size-[14px] rounded-full border-[1.5px] border-[#f0a326] flex items-center justify-center">
                                    <span className="text-[6px] font-bold">$</span>
                                  </div>
                                  {post.coins}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-gray-300 hover:text-red-400 p-1 transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <Package className="size-10 text-gray-300 mb-2" />
                    <p className="text-gray-400 text-[13px]">
                      {isGuest ? 'Sign in to see your posts' : 'No posts yet'}
                    </p>
                    {!isGuest && (
                      <button
                        onClick={() => navigate('/category/leftovers')}
                        className="mt-3 text-[#14ae5c] text-[13px] font-semibold"
                      >
                        Share your first item
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <BottomNav />
      </div>
      </PageTransition>
    </MobileContainer>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center gap-1.5">
      <div className={`${bg} rounded-full p-2`}>
        <Icon className={`size-4 ${color}`} />
      </div>
      <span className="text-[16px] font-bold text-gray-800">{value}</span>
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  );
}
