import image_1682076aeae1debac9f79438f2cc9a64223bb352 from 'figma:asset/1682076aeae1debac9f79438f2cc9a64223bb352.png'
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import MobileContainer from '../components/MobileContainer';
import BottomNav from '../components/BottomNav';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import PageTransition from '../components/PageTransition';
import image_084f77939cee70576a8518f8a5bb3cb4bd2c33ae from 'figma:asset/084f77939cee70576a8518f8a5bb3cb4bd2c33ae.png';
import image_55d6b4f98cb2367f7a7f64456f1de71079681202 from 'figma:asset/55d6b4f98cb2367f7a7f64456f1de71079681202.png';
import image_7271bba7fc27d57890f880f41b244ed65abd79d0 from 'figma:asset/7271bba7fc27d57890f880f41b244ed65abd79d0.png';
import SwipeBack from '../components/SwipeBack';
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Clock,
  MapPin,
  MessageCircle,
} from 'lucide-react';

const categoryMeta: Record<string, { title: string; emoji: string; color: string }> = {
  leftovers: { title: 'Leftovers', emoji: '🍞', color: 'bg-orange-50' },
  'old-items': { title: 'Old Items', emoji: '📦', color: 'bg-blue-50' },
  borrow: { title: 'Borrow', emoji: '🤝', color: 'bg-purple-50' },
  'offer-help': { title: 'Offer Help', emoji: '💪', color: 'bg-green-50' },
  'ask-help': { title: 'Ask Help', emoji: '🆘', color: 'bg-rose-50' },
  exchange: { title: 'Exchange', emoji: '🔄', color: 'bg-teal-50' },
};

const mockGivePosts = [
  {
    id: 1,
    userName: 'Oualid Laib',
    userPhoto: 'https://images.unsplash.com/photo-1768696082160-c8da7db9ed95?w=100&h=100&fit=crop',
    timeAgo: '1hr ago',
    title: 'Fresh homemade bread',
    description: 'I have extra bread from baking today. Available for pickup in the neighborhood.',
    image: 'https://images.unsplash.com/photo-1661509833506-266e183dbe6c?w=600&h=400&fit=crop',
    coins: 100,
    category: 'leftovers',
    location: 'Hadjam Moukhtar',
  },
  {
    id: 2,
    userName: 'Amina H.',
    userPhoto: 'https://images.unsplash.com/photo-1770802675122-baf6cab22839?w=100&h=100&fit=crop',
    timeAgo: '2hr ago',
    title: 'Homemade couscous',
    description: 'Made a big pot of couscous with vegetables for a family gathering. Plenty of leftovers!',
    image: 'https://images.unsplash.com/photo-1688940738506-acfe9334bf5c?w=600&h=400&fit=crop',
    coins: 90,
    category: 'leftovers',
    location: 'Houch Aoun',
  },
  {
    id: 8,
    userName: 'Rachid T.',
    userPhoto: 'https://images.unsplash.com/photo-1721713833969-5254d4c4d106?w=100&h=100&fit=crop',
    timeAgo: '3hr ago',
    title: 'Baklava pastry tray',
    description: 'Leftover baklava from a celebration. About 20 pieces, still fresh and crispy.',
    image: 'https://images.unsplash.com/photo-1769812343879-f49768203a8d?w=600&h=400&fit=crop',
    coins: 110,
    category: 'leftovers',
    location: 'Sidi Yahya',
  },
  {
    id: 9,
    userName: 'Samira K.',
    userPhoto: 'https://images.unsplash.com/photo-1675526607070-f5cbd71dde92?w=100&h=100&fit=crop',
    timeAgo: '4hr ago',
    title: 'Lentil soup pot',
    description: 'Warm homemade lentil soup, enough for 3-4 servings. Perfect for this cold weather.',
    image: 'https://images.unsplash.com/photo-1724856774356-99331a86866f?w=600&h=400&fit=crop',
    coins: 70,
    category: 'leftovers',
    location: 'Hadjam Moukhtar',
  },
  {
    id: 10,
    userName: 'Mourad B.',
    userPhoto: 'https://images.unsplash.com/photo-1597835260780-d0ea22a9b66e?w=100&h=100&fit=crop',
    timeAgo: '5hr ago',
    title: 'Fresh fruit basket',
    description: 'Oranges and clementines from my garden. Too many for our family, happy to share!',
    image: 'https://images.unsplash.com/photo-1771179231898-08373610c123?w=600&h=400&fit=crop',
    coins: 80,
    category: 'leftovers',
    location: 'Houch Aoun',
  },
];

const mockGetPosts = [
  {
    id: 3,
    userName: 'Ahmed K.',
    userPhoto: 'https://images.unsplash.com/photo-1597835260780-d0ea22a9b66e?w=100&h=100&fit=crop',
    timeAgo: '2hr ago',
    title: 'Looking for a ladder',
    description: 'Need a ladder for the weekend for home repairs. Will return Monday.',
    coins: 50,
    category: 'borrow',
    location: 'Sidi Yahya',
  },
  {
    id: 4,
    userName: 'Fatima B.',
    userPhoto: 'https://images.unsplash.com/photo-1619545307432-9fc73f8135ff?w=100&h=100&fit=crop',
    timeAgo: '4hr ago',
    title: 'Need help moving furniture',
    description: 'Moving to a new apartment nearby. Need 1-2 people to help carry a couch and table.',
    coins: 120,
    category: 'ask-help',
    location: 'Hadjam Moukhtar',
  },
  {
    id: 5,
    userName: 'Youcef D.',
    userPhoto: 'https://images.unsplash.com/photo-1544694032-19eb3ee39243?w=100&h=100&fit=crop',
    timeAgo: '5hr ago',
    title: 'Looking for baby stroller',
    description: 'Does anyone have a baby stroller we could borrow for a few weeks? Our toddler is visiting.',
    coins: 60,
    category: 'borrow',
    location: 'Houch Aoun',
  },
  {
    id: 6,
    userName: 'Nadia R.',
    userPhoto: 'https://images.unsplash.com/photo-1769867618566-8c73ee5059ff?w=100&h=100&fit=crop',
    timeAgo: '6hr ago',
    title: 'Need a drill for one day',
    description: 'Installing shelves this weekend. Just need to borrow a power drill for Saturday.',
    coins: 40,
    category: 'borrow',
    location: 'Sidi Yahya',
  },
  {
    id: 7,
    userName: 'Karim M.',
    userPhoto: 'https://images.unsplash.com/photo-1760359289500-413a84f54800?w=100&h=100&fit=crop',
    timeAgo: '8hr ago',
    title: 'Seeking math tutor for son',
    description: 'My son needs help with high school math. Looking for a neighbor who can tutor 2x a week.',
    coins: 150,
    category: 'ask-help',
    location: 'Hadjam Moukhtar',
  },
];

export default function CategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'give' | 'get'>('give');

  const meta = categoryMeta[categoryId || ''] || { title: 'Share', emoji: '📋', color: 'bg-gray-50' };

  const givePosts = mockGivePosts.filter(
    (p) => categoryId === 'leftovers' || categoryId === 'old-items' ? p.category === categoryId : true
  );
  const getPosts = mockGetPosts;

  return (
    <MobileContainer>
      <PageTransition>
      <SwipeBack>
      <div className="flex flex-col size-full bg-white">
        {/* Header */}
        <div className="px-5 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between h-14">
            <button onClick={() => navigate('/home')} className="text-gray-800">
              <ArrowLeft className="size-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[18px]">{meta.emoji}</span>
              <h1 className="text-[18px] font-semibold text-gray-900 font-[Poppins,sans-serif]">{meta.title}</h1>
            </div>
            <button
              onClick={() => navigate(`/post-item/${categoryId}`)}
              className="bg-[#14ae5c] text-white rounded-full size-9 flex items-center justify-center shadow-md active:scale-95 transition-transform"
              aria-label="Add post"
            >
              <Plus className="size-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Give / Get Toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
            <button
              onClick={() => setActiveTab('give')}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === 'give'
                  ? 'bg-[#14ae5c] text-white shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Give
            </button>
            <button
              onClick={() => setActiveTab('get')}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === 'get'
                  ? 'bg-[#14ae5c] text-white shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Get
            </button>
          </div>
        </div>

        {/* Posts */}
        <div className="flex-1 overflow-y-auto pb-24 px-5">
          {activeTab === 'give' ? (
            givePosts.length > 0 ? (
              <div className="space-y-4">
                {givePosts.map((post) => (
                  <PostCard key={post.id} post={post} navigate={navigate} />
                ))}
              </div>
            ) : (
              <EmptyState
                emoji="📦"
                title="No items shared yet"
                description="Be the first to share something!"
                onAction={() => navigate(`/post-item/${categoryId}`)}
                actionLabel="Share Something"
              />
            )
          ) : getPosts.length > 0 ? (
            <div className="space-y-4">
              {getPosts.map((post) => (
                <RequestCard key={post.id} post={post} navigate={navigate} />
              ))}
            </div>
          ) : (
            <EmptyState
              emoji="🔍"
              title="No requests available"
              description="Check back later to see what your neighbors need"
            />
          )}
        </div>

        <BottomNav />
      </div>
      </SwipeBack>
      </PageTransition>
    </MobileContainer>
  );
}

function PostCard({ post, navigate }: { post: any; navigate: any }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* User header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <ImageWithFallback
          src={post.userPhoto}
          alt={post.userName}
          className="size-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-gray-800">{post.userName}</p>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="flex items-center gap-0.5"><Clock className="size-3" />{post.timeAgo}</span>
            <span className="flex items-center gap-0.5"><MapPin className="size-3" />{post.location}</span>
          </div>
        </div>
        <button className="text-gray-400">
          <MoreVertical className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <h4 className="text-[14px] font-semibold text-gray-800 mb-1">{post.title}</h4>
        <p className="text-[12px] text-gray-500 line-clamp-2">{post.description}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="mx-4 rounded-xl overflow-hidden mb-3">
          <ImageWithFallback
            src={post.image}
            alt={post.title}
            className="w-full h-[180px] object-cover"
          />
        </div>
      )}

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(`/chat/${post.id}`)}
          className="bg-[#14ae5c] text-white px-4 py-2 rounded-full text-[12px] font-semibold flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <MessageCircle className="size-3.5" /> Request
        </button>
        <div className="flex items-center gap-1.5 text-[#f0a326] font-semibold text-[13px]">
          <div className="size-[18px] rounded-full border-[1.5px] border-[#f0a326] flex items-center justify-center">
            <span className="text-[7px] font-bold">$</span>
          </div>
          {post.coins}
        </div>
      </div>
    </div>
  );
}

function RequestCard({ post, navigate }: { post: any; navigate: any }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <ImageWithFallback
          src={post.userPhoto}
          alt={post.userName}
          className="size-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-gray-800">{post.userName}</p>
          <p className="text-[11px] text-gray-400">{post.timeAgo} &middot; {post.location}</p>
        </div>
      </div>
      <h4 className="text-[14px] font-semibold text-gray-800 mb-1">{post.title}</h4>
      <p className="text-[12px] text-gray-500 mb-3">{post.description}</p>
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/chat/${post.id}`)}
          className="bg-[#14ae5c] text-white px-4 py-2 rounded-full text-[12px] font-semibold active:scale-95 transition-transform"
        >
          Offer to Help
        </button>
        <div className="flex items-center gap-1 text-[#f0a326] font-semibold text-[12px]">
          <div className="size-[16px] rounded-full border-[1.5px] border-[#f0a326] flex items-center justify-center">
            <span className="text-[7px] font-bold">$</span>
          </div>
          {post.coins}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ emoji, title, description, onAction, actionLabel }: {
  emoji: string;
  title: string;
  description: string;
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <span className="text-[48px] mb-3">{emoji}</span>
      <p className="text-[16px] font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-[13px] text-gray-400 text-center px-8 mb-4">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="bg-[#14ae5c] text-white px-6 py-2.5 rounded-full text-[13px] font-semibold active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}