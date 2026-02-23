# Dosebase Web App — Product Reference Document (PRD)

> **Purpose**: This document serves as the complete reference for all features, flows, buttons, functions, and UI patterns from the Dosebase web app. Use this when continuing native app (Expo/React Native) development.
>
> **Generated**: February 2025
> **Web App Version**: v0.2.0 (MVP)

---

## Table of Contents

1. [App Overview](#1-app-overview)
2. [Authentication & Onboarding](#2-authentication--onboarding)
3. [Navigation & Layout](#3-navigation--layout)
4. [Dashboard (Home)](#4-dashboard-home)
5. [Protocols (Compounds)](#5-protocols-compounds)
6. [Protocol Form (CompoundForm)](#6-protocol-form-compoundform)
7. [Log Injection](#7-log-injection)
8. [Daily Check-In](#8-daily-check-in)
9. [Trends (Analytics)](#9-trends-analytics)
10. [Calendar View](#10-calendar-view)
11. [Settings](#11-settings)
12. [FAQ / Help Center](#12-faq--help-center)
13. [Research Vault](#13-research-vault)
14. [Tools (Calculator & Converter)](#14-tools-calculator--converter)
15. [Legal Pages (Terms & Privacy)](#15-legal-pages-terms--privacy)
16. [Data Models & Types](#16-data-models--types)
17. [Services & Business Logic](#17-services--business-logic)
18. [Scheduling Logic](#18-scheduling-logic)
19. [State Management (Contexts)](#19-state-management-contexts)
20. [Theme & Styling](#20-theme--styling)
21. [Pro Plan & Limits](#21-pro-plan--limits)
22. [Routing Map](#22-routing-map)

---

## 1. App Overview

**Dosebase** is a privacy-first aesthetic logbook PWA for tracking wellness and aesthetic protocols. It supports logging injections (peptides, relaxants, boosters, microneedling), tracking subjective body/skin/vitality metrics, viewing analytics trends, and managing protocol schedules.

**Core Pillars**:
- Privacy-first: All data stored in user's Supabase account with Row Level Security
- Not medical advice: Educational research content only
- Mobile-first: Designed for phone-sized screens
- Dark mode: Full light/dark/system theme support

---

## 2. Authentication & Onboarding

### 2.1 Auth Page (`/auth`)
**Modes**: Sign Up | Sign In | Forgot Password | Reset Password

**Sign Up Flow**:
- Fields: Email, Password (min 6 chars), Confirm Password
- Password visibility toggle (eye icon)
- On success → auto-login → redirect to onboarding
- Error handling: email already registered, weak password, network errors

**Sign In Flow**:
- Fields: Email, Password
- Password visibility toggle
- On success → redirect to dashboard (or onboarding if not completed)
- "Forgot password?" link → Forgot Password mode

**Forgot Password**:
- Field: Email
- Sends reset link via Supabase
- Success message: "Check your email for a reset link"

**Reset Password** (triggered by email link):
- Supabase PASSWORD_RECOVERY event redirects to `/auth?type=recovery`
- Fields: New Password, Confirm Password
- On success → redirect to dashboard

**UI Design**:
- Glassmorphic card on hero background
- Collage layout with decorative images
- Stone color palette, pastel accents
- Smooth transitions between modes

### 2.2 Disclaimer Modal
- Shown on first login if `disclaimer_version < CURRENT_DISCLAIMER_VERSION` (currently 1)
- Title: "Important Disclaimer"
- Content: "This app is not a medical device and does not provide medical advice..."
- Single button: "I Understand & Accept"
- On accept → updates profile `disclaimer_version` and `disclaimer_accepted_at`
- Blocks interaction until accepted (modal overlay)

### 2.3 Onboarding (`/onboarding`)
**7-step flow** (version 3):

**Step 0 — Welcome**:
- Time-based greeting ("Good Morning/Afternoon/Evening")
- User initials avatar (derived from email)
- "Let's set up your logbook" message
- Button: "Let's Go"

**Step 1 — Journey Selection** (multi-select):
- Options: Peptides, DIY Tox, Skin Boosters, Microneedling
- Pill-shaped toggle buttons
- Must select at least 1

**Step 2 — Optimization Goals** (multi-select):
- Options:
  - Skin clarity & anti-aging
  - Muscle growth & recovery
  - Cognitive performance
  - Overall wellness
  - Body composition
- Must select at least 1

**Step 3 — Current Tracking Method** (single-select):
- Options:
  - Apple Notes / Spreadsheets
  - Generic habit apps
  - Memory only
  - Nothing consistent

**Step 4 — Active Protocols Count** (single-select):
- Options: Just starting (0), 1-2, 3-5, 6+

**Step 5 — Theme Selection**:
- Options: Light, Dark, System (auto)
- Live preview of selected theme
- Icons: Sun, Moon, Monitor

**Step 6 — Unit Preference**:
- Options: Metric (kg), Imperial (lbs)
- Toggle between the two

**Step 7 — Summary & Persona**:
- Derived persona based on selections (algorithm):
  - "The Biohacker" — peptide-focused, performance-oriented
  - "The Aesthetician" — skin/face focused
  - "The Optimizer" — multi-category, data-driven
  - "The Explorer" — just starting out
  - (and more combinations)
- Shows persona name, description, and key benefit
- Feature highlights: Smart Scheduling, Visual Tracking, Research Vault
- Button: "Start Logging" → saves profile → redirects to dashboard

**On Complete**: Saves to profile:
- `onboarding_completed: true`
- `onboarding_version: 3`
- `units`: metric | imperial
- `theme`: light | dark | system

---

## 3. Navigation & Layout

### 3.1 Bottom Tab Bar (5 tabs)
Floating pill-shaped navigation bar at bottom of screen.

| Position | Icon       | Label     | Route        | Description            |
|----------|------------|-----------|--------------|------------------------|
| 1        | Home       | Home      | `/`          | Dashboard              |
| 2        | List       | Protocols | `/compounds` | Protocol management    |
| 3 (FAB)  | Plus (+)   | Log       | `/log-injection` | Floating action button |
| 4        | Heartbeat  | Trends    | `/trends`    | Analytics charts       |
| 5        | Cog        | Settings  | `/settings`  | App settings           |

**Tab Bar Behavior**:
- Hidden on: auth, onboarding, form pages (compound-form, log-injection, check-in)
- Active tab: filled icon + bold label
- Inactive tab: outline icon + muted label
- FAB (center): raised black/white button with plus icon, larger than other tabs

### 3.2 Page Header Pattern (Stack Screens)
For non-tab pages (forms, details, sub-pages):
```
[← Back]         SUBTITLE          [spacer]
                  Title
```
- Back button: 40x40 rounded, chevron-left icon
- Subtitle: uppercase, small, tracking-widest, muted color
- Title: large, bold
- Right spacer: 40px (balances the back button)

---

## 4. Dashboard (Home)

### 4.1 Header Section
- Time-based greeting: "Good Morning/Afternoon/Evening"
- User initials avatar (from email)
- Search icon (top right) — triggers search functionality
- Inbox/notification icon

### 4.2 Week Calendar Strip
- Horizontal 7-day view (Mon-Sun for current week)
- Each day shows: abbreviated day name, date number
- Today: highlighted with accent color
- Days with scheduled doses: blue dot indicator
- Days with logged doses: dark dot indicator
- Tap day → scrolls to that day's content

### 4.3 Today's Protocol Section
- Title: "Today's Protocol"
- Lists all compounds scheduled for today
- Each card shows:
  - Compound color indicator (left border or icon background)
  - Compound name
  - Dose amount + unit (e.g., "250 mcg")
  - Category icon (syringe for peptide, sparkles for booster, etc.)
  - Chevron right (→) to navigate to log
- Tap card → navigates to `/log-injection?compound={id}`
- Empty state: "No protocols scheduled today"

### 4.4 Next Dose Predictor
- Shows next upcoming scheduled dose if no protocols today
- Format: "Next: {compound name} on {day name}"
- Calculates based on frequency settings

### 4.5 Daily Check-In Widget
- Prompt card: "How are you feeling today?"
- Tap → navigates to `/check-in?date={today}`
- If already checked in: shows summary of today's metrics

### 4.6 Quick Actions
- "Log Injection" button → `/log-injection`
- "Check In" button → `/check-in`

---

## 5. Protocols (Compounds)

### 5.1 View Tabs
Two top-level tabs:
- **Active Protocols** — currently active (not archived)
- **History** — archived protocols and past logs

### 5.2 Active Protocols View
- Grouped by category: Peptide, Relaxant, Booster, Microneedling
- Each group has:
  - Category header with icon and count
  - Protocol cards

**Protocol Card**:
- Color indicator (left dot/border)
- Name (bold)
- Category badge
- Dose: "{amount} {unit}"
- Frequency: "Every {N} days" or "Mon, Wed, Fri"
- Last logged: relative date ("2 days ago") or "Never"
- Chevron right → navigate to edit

**Buttons**:
- "Add Protocol" (top right or floating) → `/compounds/new`
- Each card tap → `/compounds/edit/{id}`
- Swipe/long-press → Archive option

### 5.3 History View
- Shows archived protocols
- Log history grouped by date (Today, Yesterday, older dates)
- Each log entry shows: compound name, dose, timestamp, notes preview
- Unarchive action available

### 5.4 Archive/Unarchive
- Archive: soft-delete (sets `isArchived: true`)
- Unarchive: restores to active
- Confirmation dialog for archive action

---

## 6. Protocol Form (CompoundForm)

### 6.1 Create Mode (`/compounds/new`)
### 6.2 Edit Mode (`/compounds/edit/:id`)

**Common Fields**:
- **Name**: Text input with autocomplete from research data peptide list
- **Category**: Segmented control (Peptide | Relaxant | Booster | Microneedling)
- **Color**: Color picker (10 colors: red, rose, pink, fuchsia, purple, indigo, blue, sky, teal, emerald)

**Category-Specific Fields**:

**Peptide**:
- Dose Unit: mg, mcg, IU, ml
- Default Dose Amount: number input
- Vial Amount (mg): for reconstitution
- Dilution Amount (ml): bacteriostatic water
- Concentration (auto-calculated): mg/ml

**Relaxant**:
- Dose Unit: units (IU)
- Default Dose Amount
- Target Areas (multi-select):
  - Glabella (11s), Forehead, Crow's Feet, Masseter, Bunny Lines,
    Chin (Mentalis), DAO, Lip Flip, Platysma, Traps, Full Face

**Booster**:
- Sub-Category (single-select):
  - Dermal Filler, Body Filler, Polynucleotide, PLLA (Sculptra),
    PDO Threads, Hair/Scalp Booster, Other
- Dose Unit: ml
- Default Dose Amount
- Target Areas (multi-select):
  - Full Face, Under Eyes, Cheeks, Lips, Jawline, Neck,
    Décolletage, Hands, Scalp, Body

**Microneedling**:
- Areas (multi-select):
  - Face, Neck, Scalp, Hands, Body (Stretch Marks), Scars
- Default Needle Depth (mm)
- Default Glide Serum (text input with recent suggestions)

**Frequency Settings**:
- Type toggle: Specific Days | Interval
- Specific Days: Day picker (Mon-Sun, multi-select)
- Interval: Number input ("Every N days")
- Start Date: Date picker (defaults to today)

**Buttons**:
- "Save Protocol" / "Update Protocol" (primary)
- "Delete Protocol" (destructive, edit mode only, with confirmation)
- Back navigation (top-left)

**Pro Plan Limit**: Free tier limited to 5 active protocols. Shows upgrade prompt when limit reached.

---

## 7. Log Injection

### 7.1 Entry Point
- From dashboard protocol cards (pre-selects compound)
- From FAB (center tab button)
- From URL: `/log-injection?compound={id}&edit={logId}`

### 7.2 Compound Selection
- Dropdown/list of active (non-archived) compounds
- Shows compound name, category icon, color
- Pre-selected if navigated from dashboard card
- Autocomplete filtering

### 7.3 Log Fields (vary by category)

**All Categories**:
- Date/Time picker (defaults to now)
- Notes: multiline text input (optional)

**Peptide / Relaxant / Booster**:
- Dose Amount: number with +/- buttons and preset chips
- Dose presets: based on compound default + last logged dose + standard values
  - mcg: [100, 250, 500, 750, 1000]
  - mg: [2.5, 5, 10, 20, 50]
  - IU: [5, 10, 20, 30, 50, 100]
  - ml: [0.5, 1, 2, 2.5]
- Injection Site: text input (optional)
  - Common sites: "Left delt", "Right glute", "Abdomen", etc.
- Photo: camera capture or gallery (optional)
  - Compressed to max 1200px, max 500KB JPEG
  - Uploaded to Supabase private storage bucket

**Microneedling-Specific**:
- Needle Depth (mm): number input with presets (0.25, 0.5, 1.0, 1.5, 2.0)
- Glide Serum: text input with recent suggestions from profile

### 7.4 Edit Mode
- Pre-fills all fields from existing log
- Can update any field
- Delete button with confirmation dialog

### 7.5 Buttons
- "Log Dose" / "Update Log" (primary, full-width)
- "Delete" (destructive, edit mode only)
- Back navigation

### 7.6 Dose Step Logic
- mcg: step of 50
- mg: step of 1
- IU: step of 1
- ml: step of 0.1

---

## 8. Daily Check-In

### 8.1 Entry Point
- Dashboard check-in widget
- Route: `/check-in?date={YYYY-MM-DD}`

### 8.2 Metrics (9 subjective ratings, 1-10 scale)

**Body Stats**:
| Metric             | Label                      | Scale    |
|--------------------|----------------------------|----------|
| muscleFullness     | Muscle Fullness            | 1-10     |
| facialFullness     | Facial Fullness            | 1-10     |
| jawlineDefinition  | Jawline Definition         | 1-10     |
| inflammation       | Inflammation (Low to High) | 1-10     |

**Aesthetics**:
| Metric        | Label         | Scale |
|---------------|---------------|-------|
| skinClarity   | Skin Clarity  | 1-10  |
| skinTexture   | Skin Texture  | 1-10  |

**Vitality**:
| Metric       | Label         | Scale |
|--------------|---------------|-------|
| energy       | Energy        | 1-10  |
| sleepQuality | Sleep Quality | 1-10  |
| libido       | Libido        | 1-10  |

### 8.3 Weight Tracking
- Optional weight field
- Supports metric (kg) and imperial (lbs)
- Auto-converts based on user's unit preference
- Stored internally as kg

### 8.4 Notes
- Optional multiline text input

### 8.5 Behavior
- One check-in per day (upsert on date)
- If existing check-in for date: pre-fills all values (edit mode)
- Date shown in header with day name

### 8.6 Buttons
- "Save Check-In" / "Update Check-In" (primary)
- "Delete Check-In" (destructive, if existing, with confirmation)
- Back navigation

---

## 9. Trends (Analytics)

### 9.1 Chart Type
- Area chart (Recharts library)
- Smooth curves with gradient fill
- Responsive width, fixed height

### 9.2 Metric Groups (tabs)
Three tabs for organizing metrics:

**Body Stats**: muscleFullness, facialFullness, jawlineDefinition, inflammation
**Aesthetics**: skinClarity, skinTexture
**Vitality**: energy, sleepQuality, libido

### 9.3 Metric Selection
- Chip/pill toggles for each metric within the active group
- Multiple metrics can be displayed simultaneously
- Each metric has a distinct color on the chart

### 9.4 Weight Chart
- Separate weight trend line
- Displays in user's preferred unit (kg/lbs)
- Date range matches check-in history

### 9.5 Date Range
- Shows all available check-in data
- X-axis: dates (formatted)
- Y-axis: metric value (1-10) or weight

### 9.6 Empty State
- "No check-in data yet"
- Prompt to complete first check-in

---

## 10. Calendar View

### 10.1 Month Grid
- Standard month calendar layout
- Navigation: Previous/Next month arrows
- Current month/year title

### 10.2 Day Indicators
- **Scheduled dose (not logged)**: Blue dot
- **Logged dose (completed)**: Dark/filled dot
- **Today**: Highlighted background
- **Selected day**: Ring/border highlight

### 10.3 Day Details Modal
Tap a day to open modal showing:

**Sections**:
1. **Scheduled but not logged**: List of compounds due but not yet logged
2. **Completed logs**: Injection logs for that day
   - Compound name, dose, time, notes
   - Photo thumbnail (if exists, lazy-loaded)
   - Edit button → navigates to log edit
   - Delete button → confirmation → removes log
3. **Check-in data**: If check-in exists for that day
   - All 9 metrics displayed
   - Weight if logged
   - Edit button → navigates to check-in edit
   - Delete button → confirmation → removes check-in

**Buttons within modal**:
- "Log Dose" → `/log-injection?date={selected-date}`
- "Check In" → `/check-in?date={selected-date}`
- Close (X) button

---

## 11. Settings

### 11.1 Profile Section
- User avatar (initials from email)
- Email display
- Plan badge (Starter / Pro)

### 11.2 Units Preference
- Toggle: Metric (kg) | Imperial (lbs)
- Immediately saves to profile

### 11.3 Theme
- Three options: Light (Sun icon), Dark (Moon icon), System (Monitor icon)
- Immediately applies and saves

### 11.4 Notifications
- **Push Notifications**: Toggle on/off
  - On enable: requests browser permission, subscribes to web push
  - Shows unsupported reason if not available
- **Scheduled Reminders**: Toggle (Pro feature only)
  - Requires push to be enabled first
  - Free users see upgrade prompt

### 11.5 Tools Section
- **Peptide Calculator** → `/tools/peptide-calculator`
- **Unit Converter** → `/tools/unit-converter`

### 11.6 Support & Info Section
- **FAQ** → `/settings/faq` (in-app)
- **Research Vault** → `/research` (in-app)
- **Terms of Use** → `/legal/terms` (in-app)
- **Privacy Policy** → `/legal/privacy` (in-app)
- **Invite a Friend** → native share API (`https://dosebase.app`)

### 11.7 Data Management
- **Export Data**: Downloads complete JSON backup of all user data
  - Includes: compounds, injection_logs, check-ins
  - Filename: `dosebase-export-{date}.json`
- **Import Data**: Upload JSON file to restore data
  - Confirmation dialog before import
  - Validates file format
- **Reset All Data**: Destructive action
  - Two-step confirmation (button turns red → confirm)
  - Deletes all compounds, logs, and check-ins
  - Does NOT delete profile/account

### 11.8 Dev Tools (conditional)
- Only visible if `VITE_ENABLE_SEED=true` or in development mode
- **Seed Demo Data**: Populates with sample data for testing
- Only available for test accounts

### 11.9 Account Section
- Device info (iOS/PWA/Browser detection)
- App version display (v0.2.0)
- Sign Out button → clears session → redirect to `/auth`

### 11.10 Footer
- Medical disclaimer text
- Contact: help@dosebase.app

---

## 12. FAQ / Help Center

### 12.1 Sections (4 categories)

**General & Privacy**:
- Q: What is Dosebase?
- Q: Is my data private?
- Q: Do you store my health data on your servers?
- Q: Can I delete all my data?

**Features & Usage**:
- Q: How do I add a new protocol?
- Q: What is the Check-In feature?
- Q: How do I view my trends?
- Q: Can I add photos to my logs?

**Protocols**:
- Q: What types of protocols can I track?
- Q: How does the scheduling work?
- Q: Can I track microneedling sessions?
- Q: What is the Research Vault?

**Troubleshooting**:
- Q: The app isn't loading properly
- Q: I can't see my data after updating
- Q: How do I report a bug?

### 12.2 UI Pattern
- Collapsible accordion sections
- Category headers with icons
- Footer with support email

---

## 13. Research Vault

### 13.1 Disclaimer Gate
- Session-based (resets each app session)
- Title: "Research Vault"
- Warning text: Educational reference only, not medical advice
- Button: "I Understand — View Research"
- Must accept before viewing entries

### 13.2 Search & Filters
- **Search bar**: Filters by name and classification (real-time)
- **Category chips**: All, Reparative, Metabolic, Cosmetic, Cognitive
- Horizontal scrollable chip list

### 13.3 Entry Cards
Each card shows:
- Category badge (colored pill)
- Compound name (bold)
- Classification (subtitle, muted)
- Tap → navigates to detail view

### 13.4 Research Detail (`/research/:id`)
**Sections**:
1. **Category badge** (colored)
2. **Name** (large title)
3. **Classification** (with left border accent)
4. **Overview** — general description
5. **Research Context** — bulleted list of research areas/models
6. **Mechanism of Interest** — how it works
7. **Research Limitations** — warning-styled section
8. **Regulatory Status** — FDA/EMA status
9. **Selected References** — academic citations in cards

### 13.5 Research Entries (25+ compounds)
Categories and examples:

**Reparative**: BPC-157, Thymosin Beta-4, Glutathione, Thymosin Alpha-1, PDRN
**Metabolic**: Semaglutide, Tirzepatide, Ipamorelin
**Cosmetic**: GHK-Cu, Melanotan II, PT-141, Relaxants (Botulinum analogs), HA, Polynucleotides
**Cognitive**: NAD+, Semax, Selank, Epitalon

### 13.6 Footer
- Disclaimer text: "Educational reference only"

---

## 14. Tools (Calculator & Converter)

### 14.1 Peptide Calculator (`/tools/peptide-calculator`)
**Purpose**: Calculate injection volume for reconstituted peptides

**Inputs**:
- Vial Amount (mg): e.g., 5mg, 10mg
- Bacteriostatic Water Added (ml): e.g., 1ml, 2ml
- Desired Dose (mcg): e.g., 250mcg, 500mcg

**Outputs** (auto-calculated):
- Volume to inject (ml): rounded to 2 decimals
- Volume in units (IU): for insulin syringes (U-100)
- Concentration (mcg/ml)

**Note**: "Based on U-100 insulin syringe (1ml = 100 units)"

### 14.2 Unit Converter (`/tools/unit-converter`)
**Two Modes** (tab toggle):
- **mg ↔ mcg**: Milligrams to Micrograms
- **lbs ↔ kg**: Pounds to Kilograms

**Behavior**:
- Real-time bidirectional conversion
- Input either field → other updates
- Clear/reset button

---

## 15. Legal Pages (Terms & Privacy)

### 15.1 Terms of Use (`/legal/terms`)
**Sections**:
1. Acceptance of Terms
2. Service Description (logging tool, not medical device)
3. Not Medical Advice (bold disclaimer)
4. User Responsibility
5. Data Ownership (user owns their data)
6. Limitation of Liability

### 15.2 Privacy Policy (`/legal/privacy`)
**"Privacy First" Banner**: Shield icon with pastel green background

**Sections**:
1. Data Storage (Supabase, encrypted, RLS)
2. What We Collect (email, profile settings, protocol data)
3. What We Don't Collect (no selling, no third-party ads)
4. Your Data Control (export, delete anytime)
5. Cookies & Tracking (minimal, no ad trackers)
6. Third-Party Services (Supabase only)
7. Changes to Policy

**Contact**: help@dosebase.app
**Last Updated**: February 2025

---

## 16. Data Models & Types

### 16.1 Compound (Protocol)
```typescript
interface Compound {
  id: string;                    // UUID
  name: string;                  // e.g., "BPC-157"
  category: 'peptide' | 'relaxant' | 'booster' | 'microneedling';
  subCategory?: string;          // Booster only: "Dermal Filler", "Polynucleotide", etc.
  targetArea?: string[];         // Relaxant/Booster: treatment areas
  doseUnit: string;              // mg, mcg, IU, ml, mm
  doseAmount?: number;           // Default dose
  frequencyType?: 'interval' | 'specific_days';
  frequencyDays?: number;        // Interval: every N days
  frequencySpecificDays?: string[]; // Specific: ['Mon', 'Wed', 'Fri']
  startDate: string;             // YYYY-MM-DD
  isArchived: boolean;
  color: string;                 // Tailwind color class
  // Peptide-specific reconstitution
  peptideAmount?: number;        // Vial mg
  dilutionAmount?: number;       // Water ml
  concentration?: number;        // Auto-calculated mg/ml
}
```

### 16.2 Injection Log
```typescript
interface InjectionLog {
  id: string;
  compoundId: string;            // FK to Compound
  timestamp: string;             // ISO datetime
  dose: number;
  notes?: string;
  site?: string;                 // Injection site
  photo?: string;                // Signed URL for display
  photoPath?: string;            // Storage path
  needleDepth?: number;          // Microneedling only (mm)
  glideSerum?: string;           // Microneedling only
}
```

### 16.3 Aesthetic Check-In
```typescript
interface AestheticCheckIn {
  id: string;
  date: string;                  // YYYY-MM-DD (one per day)
  weight?: number;               // Stored in kg internally
  notes?: string;
  metrics: {
    muscleFullness: number;      // 1-10
    skinClarity: number;         // 1-10
    skinTexture: number;         // 1-10
    facialFullness: number;      // 1-10
    inflammation: number;        // 1-10 (low to high)
    jawlineDefinition: number;   // 1-10
    energy: number;              // 1-10
    sleepQuality: number;        // 1-10
    libido: number;              // 1-10
  };
}
```

### 16.4 Research Entry
```typescript
interface ResearchEntry {
  id: string;
  name: string;
  classification: string;
  overview: string;
  researchContext: string[];
  mechanism: string;
  limitations: string;
  regulatoryStatus: string;
  references: string[];
  category: 'Reparative' | 'Metabolic' | 'Cosmetic' | 'Cognitive' | 'Other';
}
```

### 16.5 App Settings
```typescript
interface AppSettings {
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
  notifications: {
    push: boolean;
    reminders: boolean;
  };
}
```

### 16.6 Profile (Supabase)
```typescript
interface Profile {
  id: string;                         // user_id
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
  notify_push: boolean;
  notify_reminders: boolean;
  onboarding_completed: boolean;
  onboarding_version: number;
  disclaimer_version: number;
  disclaimer_accepted_at: string;
  plan: 'starter' | 'pro';
  plan_expires_at?: string;
  glide_serum_recents?: string[];     // Recent microneedling serums
}
```

### 16.7 Constants
```typescript
// Protocol color options
const COLORS = [
  'bg-red-500', 'bg-rose-500', 'bg-pink-500', 'bg-fuchsia-500',
  'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-sky-500',
  'bg-teal-500', 'bg-emerald-500'
];

// Metric display labels
const METRIC_LABELS = {
  muscleFullness: 'Muscle Fullness',
  skinClarity: 'Skin Clarity',
  skinTexture: 'Skin Texture',
  facialFullness: 'Facial Fullness',
  inflammation: 'Inflammation (Low to High)',
  jawlineDefinition: 'Jawline Definition',
  energy: 'Energy',
  sleepQuality: 'Sleep Quality',
  libido: 'Libido',
};
```

---

## 17. Services & Business Logic

### 17.1 Repository (Supabase CRUD)
**Compound Operations**:
- `listCompounds()` → all user compounds (sorted by name)
- `getCompoundById(id)` → single compound
- `upsertCompound(data)` → create or update
- `deleteCompoundById(id)` → hard delete (cascades logs)
- `unarchiveCompoundById(id)` → sets isArchived=false

**Injection Log Operations**:
- `insertInjectionLog(data)` → create new log
- `updateInjectionLog(id, data)` → update existing
- `deleteInjectionLog(id)` → hard delete
- `listInjectionLogs()` → all user logs (sorted by timestamp desc)
- `getInjectionLogById(id)` → single log with signed photo URL
- `getLatestInjectionForCompound(compoundId)` → most recent log

**Check-In Operations**:
- `upsertCheckIn(data)` → create or update (one per date)
- `getCheckInByDate(date)` → single check-in
- `deleteCheckInByDate(date)` → hard delete
- `listCheckIns()` → all check-ins (sorted by date desc)

**Photo Operations**:
- `uploadInjectionPhoto(userId, logId, base64)` → uploads to private bucket
- Returns storage path (not URL)
- Photo URLs are signed with 60-minute expiry

**Data Management**:
- `exportUserData()` → JSON with compounds, logs, check-ins
- `importUserData(json)` → restores from export file
- `seedDemoData()` → creates sample data (dev only)
- `clearUserData()` → deletes all user data (keeps profile)

### 17.2 Date Utilities
- `toDateOnly(date)` → "YYYY-MM-DD" string
- `fromDateOnly(dateStr)` → Date object at midnight local

### 17.3 Unit Conversion
- `lbToKg(lbs)` → kilograms (÷ 2.20462)
- `kgToLb(kg)` → pounds (× 2.20462)
- `formatWeight(kg, unit)` → display string with unit
- `displayWeightValue(kg, unit)` → number in user's unit
- `parseWeightInput(value, unit)` → kg (for storage)

### 17.4 Image Compression
- `compressImage(dataUrl)` → compressed base64 JPEG
- Max dimension: 1200px
- Max file size: 500KB
- Iteratively reduces quality (0.8 → 0.1)
- Uses HTML Canvas API

### 17.5 Push Subscription
- `isPushSupported()` → boolean (checks service worker + Notification API)
- `getPushUnsupportedReason()` → human-readable string
- `subscribeToPush()` → registers push subscription with VAPID key
- `unsubscribeFromPush()` → removes subscription
- `isIOS()` / `isStandalone()` → platform detection

---

## 18. Scheduling Logic

### 18.1 Core Functions
```
isCompoundDueOnDate(compound, date) → boolean
```
- If `frequencyType === 'specific_days'`: checks if day name matches
- If `frequencyType === 'interval'`: calculates days since startDate, checks modulo

```
getScheduledCompounds(compounds, date) → Compound[]
```
- Filters active (non-archived) compounds due on given date

```
getLogsOnDate(logs, date) → InjectionLog[]
```
- Returns logs with timestamps falling within the given date (00:00-23:59)

```
getNextScheduledDose(compounds, fromDate, logs) → { date, compound } | null
```
- For specific_days: finds next matching day after fromDate
- For interval: calculates from last log (or start date if no logs)
- Returns the earliest upcoming dose across all compounds

### 18.2 Frequency Types
1. **Specific Days**: Mon, Tue, Wed, Thu, Fri, Sat, Sun (multi-select)
   - Compound is due on selected days regardless of start date
2. **Interval**: Every N days (number)
   - Calculated from start date: `(currentDate - startDate) % N === 0`

---

## 19. State Management (Contexts)

### 19.1 AuthContext
- **Provides**: `user`, `session`, `loading`
- **Source**: Supabase `onAuthStateChange` listener
- Handles auth state changes (sign in, sign out, password recovery)

### 19.2 ProfileContext
- **Provides**: `profile`, `loading`, `error`, `refresh()`, `update(partial)`
- **Source**: Supabase profiles table
- Auto-creates default profile if missing
- Updates trigger re-render across app

### 19.3 ToastContext
- **Provides**: `toast(message, type, options?)`
- **Types**: success (green), error (red), warning (yellow), info (blue)
- Auto-dismiss: 4-8 seconds
- Supports retry action button
- Fixed position: top-center of viewport

### 19.4 ConfirmContext
- **Provides**: `confirm(options) → Promise<boolean>`
- **Options**: title, message, confirmLabel, destructive
- Modal overlay with Cancel + Confirm buttons
- Destructive mode: red confirm button

---

## 20. Theme & Styling

### 20.1 Color Palette
**Primary**: Stone palette (warm gray)
- stone-50 (#FAFAF9) through stone-950 (#0C0A09)

**Pastel Accents**:
- Blue: #CBE4F9
- Green: #C5EBC3
- Yellow: #FDF4C4
- Purple: #D5CCEC
- Pink: #F4C6D0

### 20.2 Typography
- Font: Plus Jakarta Sans (Google Fonts)
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

### 20.3 Dark Mode
- Background: stone-950 (#0C0A09)
- Card: stone-900 (#1C1917)
- Border: stone-800 (#292524)
- Text primary: stone-100 (#F5F5F4)
- Text muted: stone-500 (#78716C)

### 20.4 Light Mode
- Background: #F8F9FB (slightly blue-gray)
- Card: white (#FFFFFF)
- Border: stone-50 (#FAFAF9)
- Text primary: stone-900 (#1C1917)
- Text muted: stone-500 (#78716C)

### 20.5 Component Patterns
- **Cards**: rounded-[32px], border, shadow-sm
- **Buttons**: rounded-2xl, font-bold, press-scale animation
- **Input fields**: rounded-2xl, border, bg-stone-50/dark:bg-stone-900
- **Badges/Chips**: rounded-lg, small text, uppercase tracking
- **Icons**: Lucide React (web) → FontAwesome (native equivalent)

### 20.6 Animations (CSS)
- `press-scale`: scale(0.97) on active
- `press-scale-sm`: scale(0.98) on active
- `spring-up`: translateY(60px) → 0 with spring ease
- `spring-scale`: scale(0.9) → 1.0 with spring ease
- `animate-fade-in`: opacity 0 → 1

---

## 21. Pro Plan & Limits

### 21.1 Free Tier (Starter)
- 5 active protocols max
- 30-day log history access
- 3 photos per log max
- Basic push notifications
- No scheduled reminders

### 21.2 Pro Tier
- Unlimited active protocols
- Full history access
- Unlimited photos
- Scheduled reminders
- Priority support

### 21.3 Enforcement
- `usePlan()` hook returns: `{ isPro, plan, limits }`
- Limits checked at:
  - Protocol creation (count check)
  - Photo upload (count check)
  - History viewing (date cutoff)
  - Reminder toggle (feature gate)

---

## 22. Routing Map

| Route                     | Page              | Auth | Onboarding | Tab  |
|---------------------------|-------------------|------|------------|------|
| `/auth`                   | Auth              | No   | No         | —    |
| `/onboarding`             | Onboarding        | Yes  | No         | —    |
| `/`                       | Dashboard         | Yes  | Yes        | Home |
| `/compounds`              | Protocols         | Yes  | Yes        | Protocols |
| `/compounds/new`          | CompoundForm      | Yes  | Yes        | —    |
| `/compounds/edit/:id`     | CompoundForm      | Yes  | Yes        | —    |
| `/log-injection`          | LogInjection      | Yes  | Yes        | FAB  |
| `/check-in`               | CheckIn           | Yes  | Yes        | —    |
| `/trends`                 | Trends            | Yes  | Yes        | Trends |
| `/calendar`               | Calendar          | Yes  | Yes        | —    |
| `/settings`               | Settings          | Yes  | Yes        | Settings |
| `/settings/faq`           | FAQ               | Yes  | Yes        | —    |
| `/tools/peptide-calculator` | PeptideCalculator | Yes  | Yes       | —    |
| `/tools/unit-converter`   | UnitConverter     | Yes  | Yes        | —    |
| `/research`               | Research          | Yes  | Yes        | —    |
| `/research/:id`           | ResearchDetail    | Yes  | Yes        | —    |
| `/legal/:type`            | Legal             | Yes  | Yes        | —    |

**Route Guards**:
- `RequireAuth`: Redirects unauthenticated → `/auth`
- `RequireOnboarding`: Redirects incomplete onboarding → `/onboarding`
- `DisclaimerModal`: Blocks until disclaimer accepted (version check)

---

## Appendix A: Category-Specific Configuration Reference

### Relaxant Target Areas
Glabella (11s), Forehead, Crow's Feet, Masseter, Bunny Lines, Chin (Mentalis), DAO, Lip Flip, Platysma, Traps, Full Face

### Booster Sub-Categories
Dermal Filler, Body Filler, Polynucleotide, PLLA (Sculptra), PDO Threads, Hair/Scalp Booster, Other

### Booster Target Areas
Full Face, Under Eyes, Cheeks, Lips, Jawline, Neck, Décolletage, Hands, Scalp, Body

### Microneedling Areas
Face, Neck, Scalp, Hands, Body (Stretch Marks), Scars

### Dose Units by Category
- **Peptide**: mg, mcg, IU, ml
- **Relaxant**: units (IU)
- **Booster**: ml
- **Microneedling**: mm (needle depth)

### Dose Presets
- **mcg**: 100, 250, 500, 750, 1000
- **mg**: 2.5, 5, 10, 20, 50
- **IU**: 5, 10, 20, 30, 50, 100
- **ml**: 0.5, 1, 2, 2.5

---

## Appendix B: Database Schema (Supabase)

### Tables
1. **profiles** — User settings and preferences
2. **compounds** — Protocol definitions
3. **injection_logs** — Individual dose entries
4. **aesthetic_check_ins** — Daily subjective metrics
5. **push_subscriptions** — Web push notification endpoints

### Row Level Security
All tables enforce: `auth.uid() = user_id`
Users can only read/write their own data.

### Key Constraints
- Check-ins: UNIQUE on (user_id, date)
- Metrics: CHECK constraint 1-10 range
- Dose units: CHECK constraint on valid values
- Frequency: CHECK constraint on valid types

---

## Appendix C: Feature Parity Checklist (Native App)

Use this to track which web app features have been implemented in the native app:

- [x] Auth (Sign In / Sign Up / Forgot Password)
- [x] Onboarding (multi-step)
- [x] Disclaimer Modal
- [x] Dashboard (Today's Protocol, week view)
- [x] Protocol List (Active / History)
- [x] Protocol Form (Create / Edit / Delete)
- [x] Log Injection (with dose presets, photo, category-specific fields)
- [x] Check-In (9 metrics + weight)
- [x] Trends (charts)
- [x] Calendar (month view + day details)
- [x] Settings (units, theme, notifications, data management)
- [x] FAQ / Help Center
- [x] Research Vault (list + detail)
- [ ] Peptide Calculator
- [ ] Unit Converter
- [x] Terms of Use
- [x] Privacy Policy
- [ ] Data Export / Import
- [ ] Push Notifications
- [ ] Invite a Friend (share)
- [ ] Offline Banner
- [ ] Pro Plan enforcement

---

*This document was auto-generated from the Dosebase web app codebase for use as a native app development reference.*
