# Wihda — Mobile App (Frontend)

A community-first mobile application that connects neighbors to share food, items, and help — built with React, Capacitor, and Tailwind CSS.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 (via Vite plugin) |
| Build Tool | Vite 6 |
| Mobile Runtime | Capacitor 7 |
| Icons | Lucide React |
| Notifications (UI) | Sonner |
| Maps | Leaflet |

---

## Features

- **Authentication** — Email/phone signup, OTP verification, Google OAuth login
- **Neighborhood Feed** — Browse and post food offers, item exchanges, help requests
- **Leftovers** — Share and request surplus food with neighbors; favorite posts, filter by saved
- **Clean & Earn** — Submit before/after photos of cleaned public spaces to earn coins
- **Exchange Chat** — Real-time messaging with match partners; two-step exchange confirmation
- **Rewards Store** — Redeem coins for rewards from the community store
- **Badges & Achievements** — Progress-based badges earned through community activity
- **My Impact** — Personal stats dashboard (coins, cleanify actions, items shared)
- **My Listings** — View your own posts and active matches
- **Notifications** — Real-time activity alerts
- **Profile** — Edit name, photo upload, neighborhood, verification status
- **Identity Verification** — Optional KYC flow (ID front/back + selfie) reviewed by Gemini AI
- **Help Center** — FAQ accordion + contact form
- **Navigation Sidebar** — Slide-in menu with profile section and app links
- **Responsive** — Optimized for phones, tablets, and iPads (iOS & Android)

---

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── BottomNav.tsx          # Bottom navigation bar
│   │   ├── Header.tsx             # Top header + slide-in sidebar menu
│   │   ├── MobileContainer.tsx    # Full-screen app wrapper
│   │   ├── PageTransition.tsx     # Animated page transitions
│   │   ├── PullToRefresh.tsx      # Pull-to-refresh gesture handler
│   │   ├── SwipeBack.tsx          # iOS-style swipe-back gesture
│   │   ├── NetworkStatus.tsx      # Offline banner
│   │   └── figma/                 # Image components
│   ├── context/
│   │   └── AuthContext.tsx        # Global auth state (JWT, profile, sign in/out)
│   ├── lib/
│   │   └── api.ts                 # Authenticated fetch wrapper (auto token refresh)
│   ├── pages/
│   │   ├── SplashPage.tsx         # Launch screen
│   │   ├── Login.tsx              # Login + Google OAuth
│   │   ├── Signup.tsx             # Registration
│   │   ├── VerifyOTP.tsx          # Email/phone OTP confirmation
│   │   ├── VerifyPending.tsx      # Waiting for KYC review
│   │   ├── VerifyIdentity.tsx     # KYC document upload flow
│   │   ├── GoogleCallback.tsx     # OAuth redirect handler
│   │   ├── Home.tsx               # Main feed with category grid
│   │   ├── CategoryDetail.tsx     # Per-category post list (offers + needs)
│   │   ├── PostItem.tsx           # Create a new offer or need
│   │   ├── Chat.tsx               # Exchange chat with confirmation flow
│   │   ├── CleanAndEarn.tsx       # Cleanify submission flow
│   │   ├── Activities.tsx         # Community campaigns/events
│   │   ├── Store.tsx              # Coin rewards store
│   │   ├── Notifications.tsx      # Notification list
│   │   ├── Profile.tsx            # User profile + badges
│   │   ├── EditProfile.tsx        # Edit name, photo, preferences
│   │   ├── ChooseLocation.tsx     # Neighborhood map picker
│   │   ├── MyListings.tsx         # My posts and matches
│   │   ├── MyImpact.tsx           # Personal impact stats
│   │   ├── MyBadges.tsx           # Badge grid with detail modal
│   │   ├── HelpCenter.tsx         # FAQ + contact form
│   │   ├── About.tsx              # About the app
│   │   ├── Terms.tsx              # Terms and conditions
│   │   ├── Leftovers.tsx          # Legacy leftovers page
│   │   └── NotFound.tsx           # 404 page
│   └── routes.tsx                 # React Router route definitions
├── styles/
│   ├── index.css                  # Global styles, animations, safe area
│   ├── tailwind.css               # Tailwind base import
│   ├── fonts.css                  # Custom font declarations
│   └── theme.css                  # CSS custom properties / design tokens
├── assets/                        # Static images
└── main.tsx                       # App entry point
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run (Web)

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`. API requests to `/v1/*` are proxied to `http://localhost:8787` (the backend dev server).

### Environment Variables

Create a `.env.local` file (for local overrides):

```
VITE_API_URL=http://localhost:8787
```

For production builds, set `VITE_API_URL` to your deployed backend URL:

```
VITE_API_URL=https://wihda-backend-prod.YOUR_SUBDOMAIN.workers.dev
```

---

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. This is what Capacitor copies into the native iOS/Android projects.

---

## iOS Deployment (Capacitor)

### One-time Mac Setup

```bash
# Install Xcode from the App Store, then:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo gem install cocoapods
```

### Build & Sync

```bash
npm run build
npx cap sync ios
```

### Open in Xcode

```bash
npx cap open ios
```

Select a simulator or physical device in Xcode and press **▶ Run**.

### Update After Code Changes

```bash
npm run build && npx cap sync ios
# Then in Xcode: ⌘ + Shift + K (clean), then ▶ Run
```

---

## Android Deployment (Capacitor)

```bash
npm run build
npx cap sync android
npx cap open android   # Opens Android Studio
```

---

## Key Design Decisions

### Auth Flow

```
Signup → OTP verification (email or phone) → Home
                                           └→ Verify Identity (optional, skippable)
```

- JWT tokens stored in `localStorage` (`access_token` + `refresh_token`)
- Token auto-refresh handled in `src/app/lib/api.ts`
- `verificationStatus` embedded in JWT payload — no extra API call needed on each route

### Safe Area Handling

- `viewport-fit=cover` in `index.html` enables `env(safe-area-inset-*)` CSS variables
- `contentInset: "never"` in `capacitor.config.json` — safe areas handled entirely via CSS
- BottomNav uses `pb-[env(safe-area-inset-bottom)]` for proper iOS home indicator spacing
- Content areas use `pb-28` to clear the nav bar on all device sizes

### Responsive Layout

- Phone: full-width single-column layouts
- Tablet (768px+): 2-column card grids, 6-column category grid, larger touch targets
- No artificial max-width constraint — the app fills the device screen natively

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with API proxy |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npx cap sync ios` | Copy web build + sync plugins to iOS project |
| `npx cap sync android` | Copy web build + sync plugins to Android project |
| `npx cap open ios` | Open iOS project in Xcode |
| `npx cap open android` | Open Android project in Android Studio |
