# Dosebase Native Motion System PRD (v1)

## 1) Context

Dosebase native (`apps/native`) already has strong UI parity work, but motion behavior is still inconsistent across screens and interactions. This PRD defines a concrete, reusable motion system that delivers iOS-like fluidity and spring response while staying maintainable.

Date: 2026-02-24  
Platform: iOS-first React Native (Expo Router + Reanimated)  
Scope: `apps/native` motion and transition behavior

## 2) Product Objective

Build a consistent motion layer that makes interactions feel premium and native to iOS:

- Immediate visual response on touch.
- Smooth spring settle for interactive controls.
- Fluid transitions for metric, list, and screen state changes.
- Respect for accessibility (`Reduce Motion`) and predictable performance.

## 3) Success Criteria

- Motion is consistent across Home, Protocols, Log, Trends, Settings, Calendar, Add Protocol, Edit Protocol.
- Touch feedback appears within 100ms on-device.
- Primary state transitions complete within 350ms.
- No janky animation in common flows on modern iPhones.
- `Reduce Motion` produces stable, non-spring fallback behavior.

## 4) Non-Goals (v1)

- Custom shared-element transitions between arbitrary screens.
- 3D transforms or highly decorative effects.
- Full gesture-driven chart scrubbing.
- Android-specific visual tuning beyond compatibility support.

## 5) Motion Design Principles

- Motion is semantic: every animation reinforces state change or hierarchy.
- One motion language: short durations, low overshoot, clean settle.
- Layered feedback: visual first, haptic optional and contextual.
- Avoid animation stacking (multiple large concurrent effects).

## 6) Technical Strategy

### 6.1 Primary Stack

- `react-native-reanimated` for component and layout motion.
- Expo Router native stack for screen navigation transitions.
- Shared motion tokens from a single source of truth.

### 6.2 Core Tokens (v1)

Use exact token values for consistency:

- Durations:
  - `instant: 90`
  - `fast: 140`
  - `normal: 220`
  - `slow: 320`
- Distances:
  - `micro: 4`
  - `small: 8`
  - `medium: 16`
  - `large: 24`
- Springs:
  - `snappy: { damping: 22, stiffness: 340, mass: 0.85 }`
  - `smooth: { damping: 26, stiffness: 240, mass: 0.95 }`
  - `gentle: { damping: 30, stiffness: 180, mass: 1.0 }`
- Press states:
  - `pressedScale: 0.97`
  - `cardPressedScale: 0.985`
  - `pressedOpacity: 0.86`

## 7) Codebase Mapping (Implementation Plan)

This section maps exact files to motion responsibilities.

### 7.1 Foundation Layer

1. **Motion tokens and helpers**
   - New files:
     - `apps/native/theme/motion.ts`
     - `apps/native/lib/motion.ts`
   - Responsibilities:
     - Export token constants.
     - Export spring/timing helper functions.
     - Export `shouldAnimate()` helper respecting reduce motion.

2. **Accessibility motion preference**
   - New file:
     - `apps/native/hooks/useReduceMotion.ts`
   - Responsibilities:
     - Normalize `reduceMotion` signal.
     - Provide single hook for all animated components.

3. **Reusable primitives**
   - New files:
     - `apps/native/components/motion/AnimatedPressable.tsx`
     - `apps/native/components/motion/AnimatedCard.tsx`
     - `apps/native/components/motion/AnimatedSegmented.tsx`
     - `apps/native/components/motion/AnimatedFadeInView.tsx`
   - Responsibilities:
     - Standardize press in/out behavior.
     - Standardize enter/exit/card settle behavior.
     - Prevent per-screen ad hoc animation logic.

### 7.2 Navigation Layer

1. **Root stack transitions**
   - File:
     - `apps/native/app/_layout.tsx`
   - Responsibilities:
     - Set default native transition style per route class:
       - Push detail pages (`calendar`, `research-detail`, `faq`, `terms`, `privacy`): iOS slide push.
       - Form-heavy pages (`compound-form`, `edit-protocol`, `check-in`): modal/sheet presentation when appropriate.
     - Keep transition settings centralized and explicit.

2. **Tab interaction animation**
   - File:
     - `apps/native/app/(tabs)/_layout.tsx`
   - Responsibilities:
     - Add active tab icon/label transitions.
     - Keep tab bar visually stable while switching routes.

### 7.3 Screen-Level Mapping

1. **Home**
   - File:
     - `apps/native/app/(tabs)/index.tsx`
   - Add:
     - Staggered card entrance.
     - Weekday selection spring.
     - Card press scale feedback for actionable rows.

2. **Protocols**
   - File:
     - `apps/native/app/(tabs)/protocols.tsx`
   - Add:
     - Segmented control active pill transition.
     - List item enter transitions on load.
     - Card press/release spring before navigation.

3. **Log**
   - File:
     - `apps/native/app/(tabs)/log.tsx`
   - Add:
     - CTA press feedback and save state transitions.
     - Chip selection spring states.
     - Inline validation shake for invalid submit.

4. **Trends**
   - File:
     - `apps/native/app/(tabs)/trends.tsx`
   - Add/Refine:
     - Smooth path morph when changing metric.
     - Value and delta crossfade/timing transitions.
     - Dot emphasis transitions without visual artifacts.

5. **Settings**
   - File:
     - `apps/native/app/(tabs)/settings.tsx`
   - Add:
     - Toggle thumb and row press transitions.
     - Section card entrance on first mount.

6. **Calendar**
   - File:
     - `apps/native/app/calendar.tsx`
   - Add:
     - Month change transition (crossfade + horizontal shift).
     - Day cell selection spring.
     - Sheet open/close refinement for detail panel.

7. **Protocol Forms**
   - Files:
     - `apps/native/app/compound-form.tsx`
     - `apps/native/app/edit-protocol.tsx`
     - `apps/native/components/ProtocolFormScreen.tsx`
   - Add:
     - Frequency segment motion.
     - Weekday chip spring selection.
     - Save button loading/success motion.
     - Keep Edit identity block mostly static and restrained.

### 7.4 Secondary Screens

- `apps/native/app/research.tsx`
- `apps/native/app/research-detail.tsx`
- `apps/native/app/check-in.tsx`
- `apps/native/app/faq.tsx`
- `apps/native/app/terms.tsx`
- `apps/native/app/privacy.tsx`

Apply shared primitives only (press + entrance). No custom bespoke motion in v1.

## 8) Detailed Functional Requirements

### 8.1 Press Feedback

- All primary `Pressable` controls must use `AnimatedPressable`.
- Press down:
  - scale to token value (`0.97` default, `0.985` for cards).
  - opacity to `0.86` when visually appropriate.
- Release:
  - spring back using `snappy`.

### 8.2 Component Transitions

- Segment toggles:
  - active background or indicator slides/expands with `smooth` spring.
- Chips:
  - selected state receives slight scale bump (`~1.03`) and settle.
- Save flows:
  - idle -> loading -> success visual states with deterministic timing.

### 8.3 Screen Transitions

- Route pushes use native iOS transition.
- Modal forms use sheet presentation where it improves task flow.
- No custom transition should break back-swipe gesture.

### 8.4 Data State Transitions

- Loading -> content transitions use fade + small translate.
- Empty states should fade in (not pop in).
- Error messaging transitions should be subtle but visible.

### 8.5 Accessibility

- If `reduceMotion` is true:
  - Replace springs with short opacity/timing transitions.
  - Disable bouncy transforms.
  - Keep interaction feedback visible without movement-heavy effects.

## 9) Performance Requirements

- Animation code should run on UI thread where possible (Reanimated worklets).
- Avoid expensive calculations during animation frames.
- Cap staggered list entrance to first visible chunk where needed.
- Do not animate layout of full long lists on every state update.

## 10) QA and Validation Plan

### 10.1 Manual QA Matrix

- Devices:
  - iPhone 17 Pro
  - iPhone 17 Pro Max
  - one smaller-height iPhone simulator profile
- Flows:
  - Tab switch loop (all tabs).
  - Add Protocol save and return.
  - Edit Protocol save/delete.
  - Trends metric switching repeatedly.
  - Calendar month navigation and day select.
  - Log submit success and validation failure.

### 10.2 Accessibility QA

- Enable iOS Reduce Motion and verify fallback behavior in all above flows.
- Ensure no control loses feedback when motion is reduced.

### 10.3 Engineering Validation

- `cd apps/native && npx tsc --noEmit`
- Verify no regressions in route behavior and navigation stack.

### 10.4 Reduce Motion QA Checklist (Phase C Screens)

Use iOS **Settings → Accessibility → Motion → Reduce Motion** set to ON, then OFF.

#### Log (`apps/native/app/(tabs)/log.tsx`)

- Opening compound selector: no spring bounce; feedback remains visible via opacity change.
- Dose preset taps and +/- stepper: immediate state change with no overshoot/jitter.
- Save/update flow: button state transition remains clear; success/error feedback still visible.
- Recent log row navigation: no abrupt jump or delayed touch acknowledgement.

#### Settings (`apps/native/app/(tabs)/settings.tsx`)

- Segment switches (units/theme): no bounce, selected state remains obvious.
- Toggle rows: state change remains clear without movement-heavy thumb animation.
- Legal/support/data-control row taps: touch response remains immediate and consistent.
- Sign-out/invite actions: pressed feedback still visible under reduced motion.

#### Calendar (`apps/native/app/calendar.tsx`)

- Month previous/next action: grid fade remains subtle; no directional spring effect.
- Day cell select: selected-day update is immediate and stable.
- Day details modal open/close: fade remains readable and not abrupt.
- Scheduled/log/check-in row taps inside modal remain deterministic.

#### Protocol Form (`apps/native/components/ProtocolFormScreen.tsx`)

- Category and frequency segmented actions: state transitions remain legible, no bounce.
- Weekday chips and interval-unit chips: selected-state changes are immediate.
- Color label selection: selected swatch state is clear without animated overshoot.
- Save/delete buttons: loading/success/error state transitions are still obvious.

### 10.5 Spring Tuning Notes (Phase C)

- Small dense controls (weekday chips, interval chips, stepper controls) should prefer `smooth` spring feel over aggressive bounce.
- Primary CTA buttons keep stronger press response, but still settle within the `normal` duration envelope.
- Card entrance motion remains restrained (`AnimatedCard` + small translate) to avoid stacking motion fatigue.
- If any outlier still feels jumpy, reduce `pressedScale` toward `0.985` and move from `snappy` to `smooth`.

## 11) Rollout Phases

### Phase A: Foundation

- Add motion tokens, helper utilities, and shared animated primitives.
- Wire accessibility hook and fallback logic.

### Phase B: High-Impact Screens

- Implement Home, Protocols, Trends first.
- Validate frame smoothness and interaction quality.

### Phase C: Form and Utility Screens

- Apply to Log, Add/Edit Protocol, Calendar, Settings.

### Phase D: Secondary Screens + Polish

- Apply shared primitives to research/legal/support screens.
- Standardize edge cases and remove ad hoc animation code.

## 12) Risks and Mitigations

- Risk: Over-animated UI feels noisy.
  - Mitigation: constrain to token system and semantic triggers only.
- Risk: Performance dips on low-end devices.
  - Mitigation: UI-thread animations + reduced concurrent motion.
- Risk: Inconsistent behavior from ad hoc per-screen logic.
  - Mitigation: enforce shared primitives and centralized tokens.

## 13) Deliverables

- Motion token module and helper APIs.
- Reusable motion components.
- Updated navigation transition definitions.
- Screen-level motion integration across `apps/native`.
- QA checklist execution and regression notes.

## 14) Definition of Done

- All mapped screens use shared motion primitives or documented exceptions.
- Interaction feedback is consistent with token presets.
- Reduce Motion compliance is verified.
- Typecheck passes and no navigation regressions are introduced.
