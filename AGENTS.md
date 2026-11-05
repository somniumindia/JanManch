# JanManch - Digital Town Hall & Citizen Agora Architecture

## Overview
- **App Name**: JanManch (Digital Town Hall & Citizen Agora)
- **Tagline**: Democratic Discourse, Perspective Sharing & Structured Policy Debates
- **Viewport**: Mobile-first responsive shell (`max-w-md mx-auto min-h-screen bg-slate-50 text-slate-900 pb-24`)
- **Stack**: Next.js App Router (React 19), TypeScript, Tailwind CSS, lucide-react, @supabase/supabase-js
- **Aesthetic**: Modern Civic Editorial (clean white cards, porcelain canvas `#F8FAFC`, Mediterranean Blue `#2563EB`, subtle tactile shadows)

---

## 4-Tab Architecture & Authentication

### 1. Authentication & Session Persistence
- **Methods**: `supabase.auth.signUp`, `supabase.auth.signInWithPassword`, `supabase.auth.signOut`, `supabase.auth.getUser`.
- **Slide-Up Auth Modal**:
  * Toggle between "Sign In" (Email, Password) and "Create Citizen Account" (Full Name, Username, Email, Password, Region).
  * Mandatory Authenticated Access with Supabase Auth & Session persistence.
  * Guest access allowed for browsing debates, reading arguments, and viewing pulse analytics.
  * Interactivity guard: Voting, submitting arguments, and proposing new debates automatically trigger the Auth Modal with contextual prompt ("Sign in to record your civic stance.").

### 2. Tab 1: The Agora (Main Discussion Feed)
- **Search & Filter Strip**: Search bar at top + quick category pills ('All Topics', 'Economy', 'Education', 'Civic Life', 'Technology').
- **Debate Cards**:
  * Category badge, author username (`@handle`), location tag, and relative posting time.
  * Proposition title and detailed context text.
  * **Interactive Consensus Split**: Dynamic dual-tone progress bar (Emerald Agree % vs Rose Disagree %). Tapping records the vote and locks state for that user.
  * **"Join Debate Floor" Button**: Shows count of arguments and opens Deliberation Floor.
  * **Viral Sharing**: 1-tap WhatsApp and link copy shortcuts.
- **Deliberation Floor (Drawer)**:
  * Pro Arguments (soft green tint) vs Con Arguments (soft rose tint).
  * View filters: All Sides, In Favor Only, Against Only.
  * 1-Tap argument upvoting calling `upvote_argument_with_karma`.
  * Clean argument input bar with Pro/Con stance toggle (+20 Karma reward).

### 3. Tab 2: Pulse Trends & Consensus Analytics
- Dedicated real-time insights screen:
  * **Top Polarized Debates**: Issues with close to 50-50 split.
  * **Highest Consensus Topics**: Policies where >75-80% of citizens agree.
  * **Topic Activity Breakdown**: Visual stacked distribution comparing Economy vs Education vs Civic Life vs Technology.
  * **1-Tap Shortcut**: Tapping any trend card directly opens its deliberation floor in Tab 1.

### 4. Tab 3: Create Proposition Wizard (Center Floating Button)
- Simple, distraction-free 3-step wizard:
  * **Step 1**: Select Topic category ('Economy', 'Education', 'Civic Life', 'Technology').
  * **Step 2**: Proposition Question & Target Region ('All India', 'Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad').
  * **Step 3**: Background Context / Perspective + Live Card Preview + "Publish to Agora" (+30 Karma).
  * Links newly created post with the logged-in user's `id`.

### 5. Tab 4: My Citizen Profile & Settings
- **Profile Header**: Full name, `@username`, City tag, and avatar initials.
- **Civic Karma Card**: Explanation ("Earn +5 Karma each time neighbors upvote your debate points") + points breakdown.
- **Segmented Tabs**: "My Propositions" (posts created by user) vs "My Arguments" (arguments submitted by user).
- **Edit Profile**: Modal to update name, region, or civic bio.
- **Sign Out**: Red-accented logout button.

---

## Database Schema & RPC Integration

### 1. `posts`
- `id` (text / UUID, Primary Key)
- `title` (text)
- `description` (text)
- `constituency` / `region` (text)
- `category` / `topic` (text)
- `author_name` (text)
- `author_username` (text)
- `author_id` (text / UUID)
- `is_verified_citizen` (boolean)
- `agree_votes` (integer)
- `disagree_votes` (integer)
- `created_at` (timestamptz)

### 2. `arguments`
- `id` (text / UUID, Primary Key)
- `post_id` (foreign key -> `posts.id`)
- `author_name` (text)
- `author_username` (text)
- `author_id` (text / UUID)
- `stance` (`'pro' | 'con'`)
- `content` (text)
- `upvotes` (integer)
- `created_at` (timestamptz)

### 3. RPC Methods
- `cast_debate_vote(target_post_id, vote_stance)`: Atomic increment of agree or disagree votes.
- `upvote_argument_with_karma(target_argument_id)`: Atomic increment of argument upvotes.
- `report_post(target_post_id)`: Community moderation trigger.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
