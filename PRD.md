# Product Requirements Document (PRD): Dosebase (MVP)

**Version:** 1.0  
**Status:** MVP (Live Candidate)  
**Date:** October 26, 2023  
**Platform:** Web / PWA (Mobile-First)  

---

## 1. Executive Summary

**Dosebase** is a privacy-first, specialized tracking application designed for the "DIY Aesthetic" and biohacking community. Unlike generic habit trackers, Dosebase is engineered specifically for managing injection protocols (peptides, relaxants, skin boosters) and correlating them with subjective physical metrics (skin clarity, facial fullness, inflammation).

The current MVP operates entirely client-side using LocalStorage, ensuring immediate privacy and zero-latency usage. The roadmap includes a transition to a cloud-based architecture to support multi-device syncing, image hosting, and community features.

### 1.1 Core Value Proposition
*   **Precision:** Specialized units (IU, mcg, mg, ml) and specific fields for aesthetic procedures (needle depth, glide serum).
*   **Correlation:** Unites "Inputs" (Dosages) with "Outputs" (Aesthetic/Wellness Scores) to prove efficacy.
*   **Privacy:** User data resides on the device in the MVP phase.
*   **Education:** Integrated research vault and dosage calculators to reduce harm and increase efficacy.

---

## 2. User Persona

**"The Architect"**
*   **Profile:** 25–45 years old. High-agency individual.
*   **Behavior:** Self-administers treatments (Botox, Peptides, Microneedling). Reads clinical studies. Tracks biometrics.
*   **Pain Point:** Currently tracks protocols in messy Apple Notes, Excel sheets, or generic habit apps that don't support "500mcg BPC-157 every 3 days."
*   **Goal:** To optimize their "stack" for maximum physical aesthetic return while minimizing side effects.

---

## 3. Functional Requirements (Current MVP State)

### 3.1 Onboarding & System
*   **Disclaimer:** Upon first load, the user must acknowledge a medical disclaimer ("Not medical advice"). This state is persisted in LocalStorage.
*   **Theme Engine:** System supports Light, Dark, and System-Default modes. Tailwinds `dark:` classes are used throughout.
*   **Navigation:** Bottom tab bar navigation (Home, Protocols, Log, Trends, Settings) hidden on specific form pages for focus.

### 3.2 Dashboard (Home)
*   **Greeting:** Personalized "Good Morning, Champion" header with a placeholder avatar.
*   **Progress Card:**
    *   Visual progress bar showing % of today's tasks completed.
    *   Dynamic background effects (blur/gradients).
*   **Calendar Strip:**
    *   7-day horizontal scrollable view (Current day ± 3 days).
    *   **Indicators:**
        *   Blue Dot: Scheduled dose.
        *   Black/White Dot: Logged entry exists.
    *   **Interaction:** Tapping a day opens the `DayDetailsModal`.
*   **Quick Stats:**
    *   **Weight Card:** Displays most recent weight entry + delta from previous entry.
    *   **Up Next:** Displays the immediate next scheduled protocol or "Rest Day" logic.
*   **Today's Protocol List:**
    *   Lists all compounds calculated to be due today.
    *   **States:**
        *   *Pending:* Clickable, leads to `LogInjection` pre-filled.
        *   *Completed:* Strikethrough text, visual checkmark, distinct opacity.

### 3.3 Protocol Management (Compounds)
*   **CRUD Operations:** Create, Read, Update, Delete protocols.
*   **Categorization:**
    *   *Peptides:* Unit (mg/mcg). Reconstitution fields available.
    *   *Relaxants:* Unit (IU). Target Area fields (Masseter, Forehead, etc.).
    *   *Boosters:* Unit (ml). Sub-categories (Polynucleotide, Filler).
    *   *Microneedling:* Unit (mm). Depth focus.
*   **Scheduling Logic:**
    *   *Specific Days:* Select Mon, Wed, Fri.
    *   *Interval:* Every X days (e.g., Every 4 days).
*   **Visuals:** User selects a color theme (Tailwind color palette) for each compound for easy identification.
*   **Archiving:** Soft delete functionality to hide protocols without losing historical data.
*   **Views:** Toggle between "Active Protocols" list and "Log History" (chronological timeline).

### 3.4 Logging Engine
*   **Entry Points:** via Dashboard (tapping a scheduled item), via FAB (Floating Action Button), or via Protocol list.
*   **Pre-filling:** If accessed via a scheduled item, the compound is pre-selected.
*   **Dynamic Inputs:**
    *   *Standard:* Large numeric keypad input for Dose.
    *   *Microneedling:* Inputs for Needle Depth (mm) and Glide Serum used.
*   **Metadata:**
    *   **Date/Time:** Defaults to now, editable.
    *   **Photo:** Capture/Upload input. stored as Base64 string (Current limitation).
    *   **Site:** Auto-filled from protocol defaults or user-editable.
*   **Validation:** Prevents submission without selecting a compound.

### 3.5 Check-In System (Subjective Metrics)
*   **Input:** 1-10 Slider interfaces.
*   **Metrics Tracked:**
    *   *Aesthetics:* Muscle Fullness, Skin Clarity, Skin Texture, Facial Fullness, Jawline Definition, Inflammation.
    *   *Wellness:* Energy, Sleep Quality, Libido.
    *   *Biometric:* Body Weight (lbs/kg).
*   **Info Modals:** Each metric has a help icon explaining what to look for (e.g., "Facial Fullness: Water retention or bloat").

### 3.6 Trends & Analytics
*   **Visualization:** Area Charts (Recharts library).
*   **Metric Switching:** User can toggle between any of the tracked metrics (Weight, Skin Clarity, etc.).
*   **Data Parsing:**
    *   Weight domain is dynamic (Min-5 to Max+5).
    *   Score domain is fixed (0-10).
    *   Gradient fills for aesthetic appeal.
    *   Trend Indicator: Calculates delta between first and last data point in view.

### 3.7 Tools & Utilities
*   **Peptide Calculator:**
    *   **Inputs:** Vial Quantity (mg), Water Added (ml), Desired Dose (mcg).
    *   **Outputs:** "Draw to" units (IU) for standard U-100 insulin syringes, Volume (ml).
*   **Unit Converter:** Simple toggle converter for mg/mcg and lb/kg.
*   **Research Vault:**
    *   Static JSON database of popular compounds (BPC-157, GHK-Cu, etc.).
    *   Search/Filter by category.
    *   **Safety:** Specific disclaimer overlay before accessing this section.

### 3.8 Settings & Data Control
*   **Preferences:** Unit toggle (Imperial/Metric), Theme toggle.
*   **Data Sovereignty:**
    *   *Export:* Generates a `.json` file of all LocalStorage data.
    *   *Reset:* "Nuclear option" to wipe LocalStorage.
*   **Support:** FAQ section (static text).

---

## 4. Technical Architecture (Current)

### 4.1 Tech Stack
*   **Framework:** React 18
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (extensive use of utility classes, custom color palette extensions).
*   **Routing:** React Router DOM (HashRouter used for easy static hosting compatibility).
*   **Icons:** Lucide React.
*   **Charts:** Recharts.

### 4.2 Data Model (LocalStorage Schema)
The app relies on four primary keys in `localStorage`:

1.  **`al_compounds`**: Array of Protocol Objects.
    ```typescript
    {
      id: string;
      name: string;
      category: 'peptide' | 'relaxant' | 'booster' | 'microneedling';
      doseAmount: number;
      doseUnit: string;
      frequencyType: 'interval' | 'specific_days';
      frequencyDays: number; // e.g. 3
      frequencySpecificDays: string[]; // e.g. ["Mon", "Thu"]
      startDate: ISOString;
      color: string; // e.g. "bg-blue-500"
      // ... category specific fields
    }
    ```

2.  **`al_injections`**: Array of Log Objects.
    ```typescript
    {
      id: string;
      compoundId: string; // Foreign Key
      timestamp: ISOString;
      dose: number;
      site?: string;
      photo?: string; // Base64 (High storage cost)
      needleDepth?: number;
    }
    ```

3.  **`al_checkins`**: Array of Daily Stats.
    ```typescript
    {
      id: string;
      date: ISOString;
      weight: number;
      metrics: { skinClarity: number, energy: number, ... };
    }
    ```

4.  **`al_settings`**: Configuration.
    ```typescript
    {
      units: 'metric' | 'imperial';
      theme: 'system' | 'dark' | 'light';
    }
    ```

### 4.3 Scheduler Logic (`services/scheduler.ts`)
The scheduler is deterministic and runs client-side.
*   **Interval Logic:** Calculates days elapsed since `startDate`. If `(daysElapsed % frequency) === 0`, it is due.
*   **Day Logic:** Checks if `currentDate.getDay()` matches the array of selected days.

---

## 5. Roadmap: Migration to Backend (Next Steps)

To transform Dosebase from a local MVP to a scalable SaaS product, the following steps must be taken. This transitions the app from "Local-First" to "Cloud-Synced".

### Phase 1: Authentication & Database Setup

1.  **Select Provider:** Supabase (PostgreSQL) is recommended for its strong relational data support and ease of Row Level Security (RLS).
2.  **User Schema:**
    *   Create `profiles` table linked to `auth.users`.
    *   Store preferences (theme, units) in the `profiles` table.
3.  **Data Migration Schema:**
    *   `compounds` table (matches `al_compounds` but with `user_id`).
    *   `logs` table (matches `al_injections` but with `user_id`).
    *   `checkins` table (matches `al_checkins` but with `user_id`).
4.  **Security Policies (RLS):**
    *   *Critical:* Enable RLS on all tables. Ensure users can ONLY select/insert/update/delete rows where `user_id = auth.uid()`.

### Phase 2: Blob Storage for Images

*   **Problem:** Current Base64 storage in LocalStorage will crash the browser if the user uploads too many high-res photos (5MB cap on LS).
*   **Solution:**
    1.  Create a Supabase Storage Bucket named `progress-photos`.
    2.  Update `LogInjection.tsx`:
        *   Instead of `reader.readAsDataURL`, use `FormData`.
        *   Upload file to Storage Bucket -> Get Public URL.
        *   Save the URL string to the database `logs` table, not the image data.
    3.  **Migration Script:** If users have existing Base64 data, a script must run on first sync to upload those strings to the bucket and replace them with URLs.

### Phase 3: API Integration (Frontend Refactor)

1.  **Service Layer Replacement:**
    *   Replace `services/storage.ts` (LocalStorage wrapper) with `services/api.ts` (Supabase Client wrapper).
    *   Implement `React Query` (TanStack Query) for data fetching, caching, and optimistic updates. This is crucial for maintaining the "snappy" feel of the local app.
2.  **Offline Support (PWA):**
    *   Since the user base values privacy and speed, implement `queue-offline` logic.
    *   If offline, save to IndexedDB (not LocalStorage). When online, sync IndexedDB -> Postgres.

### Phase 4: Enhanced Features (Server-Side)

1.  **Push Notifications:**
    *   Move scheduler logic to a server-side Cron job (Supabase Edge Functions).
    *   Check user protocols daily at 8:00 AM user-time.
    *   Send Push Notification via FCM (Firebase Cloud Messaging) or OneSignal if a dose is due.
2.  **Community Research:**
    *   Move `researchData.ts` to a database table `compounds_library`.
    *   Allow an Admin panel to update research without deploying new frontend code.

### Phase 5: Monetization & Analytics

1.  **Subscription:** Gate "Unlimited Protocols" or "Data Export" behind Stripe subscription.
2.  **Analytics:** aggregated (anonymized) data on which peptides are most popular.

---

## 6. UI/UX Design System Details

### 6.1 Color Palette
*   **Neutral:** Stone (`stone-50` to `stone-950`). Warm greys create a "clinical but organic" feel.
*   **Accents (Pastel):**
    *   `pastel-blue`: #CBE4F9 (Primary Action)
    *   `pastel-green`: #CDF5E3 (Success/Weight)
    *   `pastel-yellow`: #FDF4C4 (Warnings/Highlights)
*   **Semantic Colors:**
    *   Red/Rose: Micro-needling, Blood, Alerts.
    *   Purple/Indigo: Relaxants (Botox), Sleep.
    *   Teal/Cyan: Peptides, Healing.

### 6.2 Typography
*   **Font:** 'Plus Jakarta Sans'. Geometric, modern, high readability.
*   **Hierarchy:**
    *   Headers: Bold/ExtraBold.
    *   Labels: Uppercase, tracking-widest, small text (10px-12px) in Stone-400.

### 6.3 Components
*   **Cards:** `rounded-[32px]`, heavy usage of `bg-white dark:bg-stone-900`, subtle borders `border-stone-50`.
*   **Inputs:** No traditional borders. Inputs use `bg-stone-50` backgrounds with `rounded-2xl`. Focus states use rings.
*   **Modals:** Bottom-sheet style on mobile, centered on desktop. heavily blurred backdrops (`backdrop-blur-sm`).

---

## 7. Edge Cases & Constraints

1.  **Timezones:** currently, the scheduler uses the device's local time. When moving to backend, all dates must be stored in UTC and converted to user's local time for accurate "Due Today" calculation.
2.  **Protocol Changes:** If a user edits a protocol (e.g., changes frequency from 3 days to 5 days), how does it affect historical data?
    *   *Decision:* Historical logs remain untouched. The scheduler only looks forward from the *last logged dose* or the *start date*.
3.  **Data Loss:** If the user clears browser cache, LocalStorage is wiped.
    *   *Mitigation:* The "Settings" page currently offers an Export JSON button. This must be highlighted to the user until Cloud Sync is implemented.

---

## 8. Summary of Tasks for Developer

1.  **Initialize Git Repo:** Commit current code.
2.  **Linting:** Set up ESLint + Prettier to enforce the codebase style.
3.  **Refactor Images:** Move from Base64 to `Blob` storage immediately, even before full backend, or limit image size to 500kb via canvas compression to prevent LS quota exceeded errors.
4.  **Backend Init:** Run `supabase init`. Define SQL Schema.
5.  **Auth Flow:** Build Login/Signup screens (currently missing).
6.  **Hook Replacement:** Swap `useEffect` data loading for `useQuery`.
