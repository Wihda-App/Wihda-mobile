import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Home, Activity, Plus, Store, User, X,
  Utensils, Package, Handshake, HeartHandshake, HelpCircle, ArrowLeftRight,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { t } from '../lib/i18n';
import wihdaLogo from '../../assets/wihda_logo.png';

const sheetActionDefs = [
  { id: 'leftovers',  labelKey: 'catLeftovers'  as const, subKey: 'catLeftoversSub'  as const, icon: Utensils,       color: 'text-orange-500', bg: 'bg-orange-50',  path: '/category/leftovers'  },
  { id: 'old-items',  labelKey: 'catOldItems'   as const, subKey: 'catOldItemsSub'   as const, icon: Package,        color: 'text-blue-500',   bg: 'bg-blue-50',    path: '/category/old-items'  },
  { id: 'borrow',     labelKey: 'catBorrow'     as const, subKey: 'catBorrowSub'     as const, icon: Handshake,      color: 'text-purple-500', bg: 'bg-purple-50',  path: '/category/borrow'     },
  { id: 'offer-help', labelKey: 'catOfferHelp'  as const, subKey: 'catOfferHelpSub'  as const, icon: HeartHandshake, color: 'text-green-500',  bg: 'bg-green-50',   path: '/category/offer-help' },
  { id: 'ask-help',   labelKey: 'catAskHelp'    as const, subKey: 'catAskHelpSub'    as const, icon: HelpCircle,     color: 'text-rose-500',   bg: 'bg-rose-50',    path: '/category/ask-help'   },
  { id: 'exchange',   labelKey: 'catExchange'   as const, subKey: 'catExchangeSub'   as const, icon: ArrowLeftRight, color: 'text-teal-500',   bg: 'bg-teal-50',    path: '/category/exchange'   },
];

export default function Sidebar() {
  const { user, profile } = useAuth();
  const { language } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Only render on tablet/desktop and when logged in
  if (!user) return null;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    { path: '/home',          icon: Home,          labelKey: 'home'          as const },
    { path: '/activities',    icon: Activity,      labelKey: 'activities'    as const },
    { path: '/conversations', icon: MessageCircle, labelKey: 'messages'      as const },
    { path: '/store',         icon: Store,         labelKey: 'store'         as const },
    { path: '/profile',       icon: User,          labelKey: 'profile'       as const },
  ];

  return (
    <>
      {/* Action bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl px-5 pt-5 pb-8 animate-slide-up shadow-2xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <button
              onClick={() => setSheetOpen(false)}
              className="absolute top-4 right-5 size-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="size-4 text-gray-500" />
            </button>
            <h3 className="text-[16px] font-semibold text-gray-900 mb-4">{t(language, 'whatToDo')}</h3>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {sheetActionDefs.map((action) => (
                <button
                  key={action.id}
                  onClick={() => { setSheetOpen(false); navigate(action.path); }}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md active:scale-95 transition-all"
                >
                  <div className={`${action.bg} rounded-xl p-3`}>
                    <action.icon className={`size-6 ${action.color}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold text-gray-800 leading-tight">{t(language, action.labelKey)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{t(language, action.subKey)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar — hidden on mobile, shown on tablet+ */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-white border-r border-gray-100
                        w-16 lg:w-56 transition-all duration-300">

        {/* Logo */}
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-5 shrink-0 border-b border-gray-100">
          {/* Desktop: full logo */}
          <img src={wihdaLogo} alt="Wihda" className="hidden lg:block h-7 object-contain" />
          {/* Tablet: W icon */}
          <div className="lg:hidden size-9 bg-[#14ae5c] rounded-xl flex items-center justify-center">
            <span className="text-white text-[15px] font-bold">W</span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 group
                  ${active
                    ? 'bg-[#14ae5c]/10 text-[#14ae5c]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
              >
                <item.icon
                  className="size-5 shrink-0"
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span className="hidden lg:block text-[14px] font-medium truncate">
                  {t(language, item.labelKey)}
                </span>
                {active && (
                  <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-[#14ae5c]" />
                )}
              </button>
            );
          })}

          {/* Post / FAB equivalent */}
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
          >
            <div className="size-8 bg-[#14ae5c] rounded-full flex items-center justify-center shrink-0 shadow-sm shadow-[#14ae5c]/30">
              <Plus className="size-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="hidden lg:block text-[14px] font-semibold text-gray-700">
              {t(language, 'post')}
            </span>
          </button>
        </nav>

        {/* User profile footer */}
        <div className="shrink-0 border-t border-gray-100 p-2">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 w-full rounded-xl p-2 hover:bg-gray-50 transition-all"
          >
            {profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt=""
                className="size-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="size-8 rounded-full bg-[#14ae5c]/10 flex items-center justify-center shrink-0">
                <User className="size-4 text-[#14ae5c]" />
              </div>
            )}
            <div className="hidden lg:block text-left min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate">{profile?.name || 'Neighbor'}</p>
              <p className="text-[11px] text-gray-400 truncate">{profile?.neighborhood?.name || ''}</p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
