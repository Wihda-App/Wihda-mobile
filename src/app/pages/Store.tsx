import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileContainer from '../components/MobileContainer';
import BottomNav from '../components/BottomNav';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import PageTransition from '../components/PageTransition';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Search,
  Heart,
  ShoppingBag,
  Award,
  Ticket,
  Leaf,
  Star,
  Check,
} from 'lucide-react';

const storeCategories = ['All', 'Popular', 'New', 'Top'];

const storeItems = [
  {
    id: 1,
    name: 'Feed 3 Cats Today',
    price: 8000,
    icon: '🐱',
    color: 'bg-[#fffaeb]',
    category: 'Popular',
    favorited: false,
  },
  {
    id: 2,
    name: 'Plant a Tree',
    price: 5000,
    icon: '🌳',
    color: 'bg-green-50',
    category: 'Popular',
    favorited: true,
  },
  {
    id: 3,
    name: 'Event Tickets',
    price: 10000,
    icon: '🎫',
    color: 'bg-blue-50',
    category: 'New',
    favorited: false,
  },
  {
    id: 4,
    name: 'Eco-friendly Items',
    price: 10000,
    icon: '♻️',
    color: 'bg-rose-50',
    category: 'New',
    favorited: false,
  },
  {
    id: 5,
    name: 'Premium Badges',
    price: 10000,
    icon: '🏅',
    color: 'bg-purple-50',
    category: 'Top',
    favorited: false,
  },
  {
    id: 6,
    name: 'Donation to Charity',
    price: 3000,
    icon: '❤️',
    color: 'bg-red-50',
    category: 'Popular',
    favorited: false,
  },
];

export default function Store() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [claimedItems, setClaimedItems] = useState<number[]>([]);
  const userCoins = 450;

  const filteredItems = storeItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleClaim = (itemId: number) => {
    const item = storeItems.find((i) => i.id === itemId);
    if (item && userCoins >= item.price) {
      setClaimedItems([...claimedItems, itemId]);
      toast(`${item.name} redeemed!`, {
        description: `${item.price.toLocaleString()} coins deducted`,
        duration: 2500,
      });
    }
  };

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
            <h1 className="text-[18px] font-semibold text-gray-900 font-[Poppins,sans-serif]">Rewards Store</h1>
            <div className="flex items-center gap-1.5 bg-[#fff9e6] px-3 py-1.5 rounded-full">
              <div className="size-[16px] rounded-full border-[1.5px] border-[#f0a326] flex items-center justify-center">
                <span className="text-[7px] font-bold text-[#f0a326]">$</span>
              </div>
              <span className="text-[13px] font-semibold text-[#f0a326]">{userCoins}</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for rewards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 rounded-xl pl-10 pr-4 py-2.5 text-[13px] placeholder:text-gray-400 border border-gray-100 focus:border-[#14ae5c] focus:outline-none transition-colors"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
            {storeCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#14ae5c] text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto pb-24 px-5">
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const isClaimed = claimedItems.includes(item.id);
              const canAfford = userCoins >= item.price;

              return (
                <div
                  key={item.id}
                  className={`${item.color} rounded-2xl p-4 flex flex-col items-center relative overflow-hidden`}
                >
                  {/* Favorite */}
                  <button className="absolute top-3 right-3">
                    <Heart
                      className={`size-4 ${item.favorited ? 'text-red-500 fill-red-500' : 'text-gray-300'}`}
                    />
                  </button>

                  {/* Icon */}
                  <div className="text-[40px] mb-3 mt-2">{item.icon}</div>

                  {/* Name */}
                  <p className="text-[13px] font-semibold text-gray-800 text-center mb-2 leading-tight">
                    {item.name}
                  </p>

                  {/* Price */}
                  <div className="flex items-center gap-1 text-[#f0a326] mb-3">
                    <div className="size-[16px] rounded-full border-[1.5px] border-[#f0a326] flex items-center justify-center">
                      <span className="text-[7px] font-bold">$</span>
                    </div>
                    <span className="text-[13px] font-bold">{item.price.toLocaleString()}</span>
                  </div>

                  {/* Claim Button */}
                  <button
                    onClick={() => handleClaim(item.id)}
                    disabled={isClaimed || !canAfford}
                    className={`w-full py-2 rounded-xl text-[12px] font-semibold transition-all active:scale-95 ${
                      isClaimed
                        ? 'bg-gray-200 text-gray-500'
                        : canAfford
                        ? 'bg-[#14ae5c] text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isClaimed ? (
                      <span className="flex items-center justify-center gap-1">
                        <Check className="size-3" /> Claimed
                      </span>
                    ) : canAfford ? (
                      'Redeem'
                    ) : (
                      'Not enough coins'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <BottomNav />
      </div>
      </PageTransition>
    </MobileContainer>
  );
}