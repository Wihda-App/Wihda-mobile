I am attaching my Figma design for a mobile application called “Wihda”.

Your task is to convert this design into a fully functional, production-ready, mobile-optimized application while strictly preserving:

• All existing features
• Core navigation logic
• Design system (colors, typography, spacing, branding)
• Layout structure

You may improve UX clarity, hierarchy, spacing, responsiveness, and usability — but you must NOT remove or change the product concept or features.

The app must be:

• Fully mobile-optimized (Android + iOS)
• Designed mobile-first
• Responsive across different screen sizes
• Clean, modern, and production-level UI
• Structured for real backend integration

APPLICATION OVERVIEW

Wihda is a neighborhood-based civic mobile platform that reconnects neighbors and enables:

• Sharing unused items
• Requesting items
• Food redistribution
• Participating in neighborhood activities
• Earning coins through positive civic actions
• Redeeming coins in a small in-app rewards marketplace

The application contains two main sections:

My Neighborhood

My Neighbor

There is a toggle switch between both sections.

CORE STRUCTURE

Authentication

• Sign up (email / phone)
• Login
• Basic onboarding (select neighborhood)
• Profile creation

User Profile

• Profile photo
• Name
• Neighborhood
• Coins balance
• Badges (Citizen of the Month, Citizen of the Year, Top Helper, etc.)
• Edit profile
• Activity history
• Posts history

SECTION 1: MY NEIGHBORHOOD

This section focuses on community engagement and activities.

It contains:

A) Activities

Join Campaigns
Example: Red Cross campaigns, local cleanups, donation drives
• View campaign details
• Join campaign
• Track participation
• Earn coins

Clean & Earn (NEW FEATURE – MUST IMPLEMENT)

This is a structured civic cleaning reward system.

FLOW:

Step 1:
User clicks "Clean & Earn"

Step 2:
User uploads a photo of an unclean area (Before image)

Step 3:
User starts a timer (countdown or stopwatch)

Step 4:
After cleaning, user uploads the "After image"

Step 5:
System verifies cleanliness using AI validation logic

AI Validation Requirements:
• Compare before and after images
• Detect reduction in trash objects
• Confirm visible improvement
• If validated → mark as "Approved"
• If rejected → show reason and allow retry

Step 6:
If approved:
• Award coins automatically
• Add entry to activity history
• Update user coin balance
• Show confirmation screen

UX Requirements:
• Show status (Pending / Approved / Rejected)
• Show coin reward amount
• Clean timeline visualization
• Prevent abuse (limit submissions per day)
• Store submission history

SECTION 2: MY NEIGHBOR

This section focuses on item sharing and requests.

There are two main modes inside this section:

Toggle:
• Give
• Get

Categories include:
• Food / Leftovers
• Furniture
• Clothes
• Other reusable items

Each category has TWO tabs:

Post an Item (Give)

Browse Requests (Get)

GIVE FLOW

User selects category
User fills short form:

• Item title
• Description
• Condition
• Quantity
• Optional expiry (for food)
• Upload photos
• Select pickup availability
• Location auto-detected from neighborhood

After publishing:
• Item appears in category feed
• Matching system triggers

Matching Logic:
• Match users within same neighborhood
• Match based on need category
• Notify potential receivers
• Open temporary chat when match is accepted

Temporary Chat Requirements:
• Limited to transaction
• Auto-closes after completion
• Basic messaging
• Option to mark as completed

Upon completion:
• Both users confirm
• Coins awarded to giver
• Transaction logged

GET FLOW

User selects category
User sees list of available items OR requests

User can:
• Express interest
• Send short message
• Request item

Once approved:
• Temporary chat opens
• Completion confirmation required

COINS & REWARDS SYSTEM

Coins are earned through:

• Sharing items
• Completing item transactions
• Participating in campaigns
• Clean & Earn approved tasks

Coins Wallet:

• Display total balance
• Show earning history
• Show spending history

Marketplace:

• Exchange coins for rewards
• Items already defined in design
• Simple redemption logic
• Mark reward as claimed

NAVIGATION STRUCTURE

Bottom navigation bar:

• Home (default)
• Activities
• Neighbor
• Marketplace
• Profile

Toggle between:
My Neighborhood / My Neighbor

Must feel intuitive and fast.

TECHNICAL REQUIREMENTS

Design the system to be ready for:

• Backend API integration
• Image upload & storage
• AI image verification endpoint
• Real-time notifications
• Basic chat functionality
• Secure authentication
• Coin transaction logic

Structure must include:

• Clear component hierarchy
• Reusable UI components
• Proper state management logic
• Error handling states
• Loading states
• Empty states
• Offline fallback

UX IMPROVEMENTS (Allowed)

You may:

• Improve spacing and layout
• Improve hierarchy
• Improve readability
• Improve accessibility (contrast, touch targets)
• Improve responsiveness
• Optimize mobile gestures

You may NOT:

• Remove features
• Change concept
• Remove coins system
• Remove matching system
• Remove toggle logic
• Remove Clean & Earn

MOBILE OPTIMIZATION RULES

• Design for small screens first
• Ensure thumb-friendly buttons
• Use large tap areas
• Avoid clutter
• Use card-based layout
• Smooth transitions
• Fast navigation

FINAL OUTPUT REQUIREMENT

Generate:

• Fully structured app screens
• Complete flow logic
• Clean interaction states
• Ready-for-development mobile design system
• Clean component naming
• Structured for Flutter or React Native export

Preserve brand identity and existing design language.