# VisionFlow Migration & Upgrade Plan

A comprehensive engineering plan and ready-to-run master prompt to upgrade the legacy **VisionFlow** application (`https://vision-flow-pied.vercel.app/`) in **Google AI Studio Build** to match the new neo-brutalist Android-first system, while strictly preserving all existing patient records and database integrity.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following parameters were confirmed during interactive clarification and form the foundation of this migration specification:

- **Target Environment**: **Google AI Studio Build** — the prompt is specifically engineered with AI Studio instructions, skill triggers (`firebase-integration-rpc`, `pwa-integration`), and strict file conventions (`firebase-applet-config.json`, `firestore.rules`).
- **Data Preservation Strategy**: **Dual-Schema Backwards Compatibility** — existing records in Firestore will NOT be overwritten or broken. Legacy fields (such as combined `glass` and nested `payment` / `power`) are safely read with fallback accessors, while new entries utilize the new explicit fields (`frame`, `glass`, `drop`, `totalBill`, `receivedPayment`, `profit`).
- **Full-Stack Scope**: The prompt provides end-to-end instructions encompassing database security rules, TypeScript interfaces, real-time multi-device Firestore sync, Android camera capture, and neo-brutalist UI layout.

---

## 1. Overview & Core Concept

The legacy version of VisionFlow bundled optical details into combined fields (such as `glass` for both glass and frame) and lacked dedicated profit tracking, direct mobile camera capture, and Android-specific navigation ergonomically tuned for optical shop operations.

This upgrade delivers:
1. **13 Explicit Clinical & Financial Fields**: `date`, `patientName`, `mobileNumber`, `address`, `re`, `le`, `add`, `glass`, `frame`, `drop`, `totalBill`, `receivedPayment`, and `profit`.
2. **Zero Data Loss Guarantee**: Legacy documents created in the old app retain their exact data. The upgraded frontend gracefully reads both legacy formats (`payment.total` vs `totalBill`, `glass` as fallback for frame, etc.) and new top-level formats.
3. **Android-First Ergonomics**: Elevated bottom navigation bar with a thumb-accessible Floating Action Button (`+`), direct Android camera trigger (`capture="environment"`), and PWA standalone installability.
4. **Real-Time Cross-Device Sync**: Free Firestore cloud synchronization enabling instantaneous record updates across mobile phones, tablets, and desktop computers.

---

## 2. User Experience & Visual Design

### Design System & Theme Tokens
- **Aesthetic**: Bold Neo-Brutalism with high-contrast borders and hard drop shadows.
- **Canvas Background**: Warm creamy `#fcf9f1`.
- **Accent Highlight**: Vibrant bubblegum pink `#ff90e8`.
- **Pastel Functional Tints**:
  - `#e1fff3` (Mint — Paid status, Net Profit, Synced indicator)
  - `#e1f4ff` (Blue — Revenue stat card, CSV export, Receipt print)
  - `#ffe1e1` (Orange/Coral — Pending Due alerts, Delete warnings)
- **Shadows**: `.shadow-brutal` (`4px 4px 0px 0px #000000`) and `.shadow-brutal-sm` (`2px 2px 0px 0px #000000`).
- **Typography**: Inter (sans-serif) for high-legibility clinical labels, paired with JetBrains Mono for optical prescription powers.

### Key Mobile Flows
```
┌─────────────────────────────────────────────────────────────┐
│ Android Top App Bar: Brand Logo + [Synced] + Record Counter │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Dashboard View]                   [Patient Records View]  │
│  • Monthly / Lifetime Revenue       • Search & Month Filter │
│  • Total Collections & Pending Due  • Patient List Cards    │
│  • Net Profit Summary Card          • Bottom Sheet Details  │
│  • Recent Patients Activity Feed    • Printable Receipt     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Floating Action Button (+) ──> New Patient Form:            │
│   - Patient Name, Mobile & Address                          │
│   - Eye Power Grid (R E, L E, ADD)                          │
│   - Separate Glass, Frame & Drop Inputs                     │
│   - Direct Android Camera Slip Capture                      │
│   - Total Bill, Received Payment, Balance & Profit          │
├─────────────────────────────────────────────────────────────┤
│ Android Bottom Bar: [Home / Dashboard]      [Records List]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Trade-Offs

### A. Non-Destructive Data Strategy
- **Decision**: Avoid running destructive database batch migrations on legacy Firestore documents.
- **Rationale**: An in-place database script might corrupt historical entries if network drops occur. Instead, the UI reading layer implements an **Adapter Pattern**:
  ```ts
  const total = Number(r.totalBill ?? r.payment?.total ?? 0);
  const paid = Number(r.receivedPayment ?? r.payment?.paid ?? 0);
  const profit = Number(r.profit ?? 0);
  const re = r.re ?? r.power?.re ?? '';
  const le = r.le ?? r.power?.le ?? '';
  const add = r.add ?? r.power?.add ?? '';
  const frame = r.frame ?? '';
  const glass = r.glass ?? '';
  const drop = r.drop ?? r.eyeDrop ?? '';
  ```
- **Result**: Historical patients display accurately with past receipts and balances intact, while newly edited or added patients take advantage of the expanded 13 fields.

### B. Android Native Camera Capture
- **Decision**: Provide dual photo options: `<input type="file" accept="image/*" capture="environment" />` for instant live camera capture of prescription papers, and gallery pick for saved images.
- **Rationale**: Optical shops frequently need to photograph written hospital slips or lens packets immediately on phone.

### C. Explicit Financial Control
- **Decision**: Never automatically mutate the `profit` field behind the scenes when a user alters payments or bill amounts later.
- **Rationale**: Opticians need precise control over accounting discounts, lab costs, and margins.

---

## 4. Technical Architecture & Master Prompt Specification

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GOOGLE AI STUDIO APPLET                         │
├────────────────────────────────────────────────────────────────────────┤
│  Frontend (React SPA + Tailwind CSS + PWA)                             │
│  ├── Layout.tsx (Sidebar on Desktop, App Bar + Bottom Nav on Android)  │
│  ├── Dashboard.tsx (Metrics, Revenue, Collections, Profit)             │
│  ├── PatientForm.tsx (13 Fields + Camera + Real-time Balance)          │
│  ├── PatientRecords.tsx (Search, Month Filter, CSV Export, Drawer)     │
│  └── PrintReceiptModal.tsx (Clean Optical Invoice Print Slip)          │
├────────────────────────────────────────────────────────────────────────┤
│  Data Layer & Real-time Cloud Synchronization                          │
│  ├── firebase.ts (Firebase SDK Initialization with firestoreDatabaseId)│
│  ├── recordStorage.ts (onSnapshot listener + local offline cache)      │
│  └── types.ts (PatientRecord with legacy-compatible field types)       │
├────────────────────────────────────────────────────────────────────────┤
│  Cloud Backend (Google Cloud Firestore - Spark Free Tier)              │
│  ├── Collection: /patients/{patientId}                                 │
│  └── firestore.rules (Path & schema validation rules)                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Ready-to-Run Master Prompt for Google AI Studio

Below is the complete, self-contained prompt designed to be copied directly into the chat of the old **VisionFlow** project in Google AI Studio:

```markdown
Upgrade this optical clinic management application to match the modern, neo-brutalist, Android-optimized system with real-time multi-device cloud synchronization, while STRICTLY preserving all existing database records and backward compatibility.

### 1. EXACT CLINICAL & BILLING FIELDS TO SUPPORT
Ensure all patient records, forms, and detail views explicitly feature:
1. Date (`date`) - formatted YYYY-MM-DD with calendar picker
2. Patient Name (`patientName`)
3. Mobile Number (`mobileNumber`)
4. Address (`address`)
5. R E (`re`) - Right eye prescription power
6. L E (`le`) - Left eye prescription power
7. ADD (`add`) - Near vision reading addition
8. Glass (`glass`) - Dedicated lens specification field
9. Frame (`frame`) - Dedicated frame model/brand field (separate from glass!)
10. Drop (`drop`) - Eye drops and medications
11. Total Bill (`totalBill`) - Invoice total in INR
12. Received Payment (`receivedPayment`) - Amount paid in INR
13. Profit (`profit`) - Net clinic profit in INR
Plus companion workflow fields:
- `glassesDelivered` (boolean) & `deliveryDate` (string | null)
- `imageUrl` (string | null) for patient prescription slip
- Balance Due (`totalBill - receivedPayment`, calculated dynamically)

### 2. BACKWARDS COMPATIBILITY & DATA PRESERVATION (CRITICAL)
Do NOT delete or corrupt existing Firestore patient records! Existing records created in the old app may contain nested or legacy fields. In `recordStorage.ts` and all components, implement safe fallback parsing:
- Total Bill: `Number(doc.totalBill ?? doc.payment?.total ?? 0)`
- Received Payment: `Number(doc.receivedPayment ?? doc.payment?.paid ?? 0)`
- Profit: `Number(doc.profit ?? 0)`
- RE / LE / ADD: Read `doc.re ?? doc.power?.re ?? ''` (similarly for `le` and `add`)
- Glass & Frame: Read `doc.glass` and `doc.frame`. If `doc.frame` is absent and `doc.glass` exists on an old record, display `doc.glass` cleanly without crashing.
- Drop: Read `doc.drop ?? doc.eyeDrop ?? ''`
When saving updates or new patients, save the new clean top-level fields.

### 3. ANDROID-FIRST UI & UX OPTIMIZATIONS
- Android Bottom Navigation Bar: Fixed to the bottom with safe-area padding (`env(safe-area-inset-bottom)`), containing Dashboard (Home) and Patient Records buttons.
- Elevated Center Floating Action Button (FAB): Large 60px thumb-reachable button in accent pink (`#ff90e8`) with black border and brutalist shadow that opens the New Patient Form immediately.
- Android Camera Capture: In the photo upload section, provide a direct "Take Photo" button using `<input type="file" accept="image/*" capture="environment" />` so optometrists can photograph physical paper slips with their phone camera, alongside a gallery upload option.
- Virtual Keyboard Attributes: Set `inputMode="tel"` for mobile numbers, `inputMode="decimal"` for Total Bill, Received Payment, and Profit, and ensure minimum 48px touch targets.
- Remove any call or WhatsApp external links; render mobile numbers as clean text.
- PWA Support: Configure `vite-plugin-pwa` with `display: 'standalone'`, `orientation: 'portrait-primary'`, theme color `#fcf9f1`, and icons.

### 4. REAL-TIME MULTI-DEVICE CLOUD SYNC (FIRESTORE)
- Connect to Firestore using `onSnapshot` on the `patients` collection so changes on any device appear instantly on all other screens.
- Implement optimistic local caching in `localStorage` so records load instantly even if the phone has a spotty cellular connection.
- In `firestore.rules`, allow read/write on `/patients/{patientId}` with ID format guards (`id is string && id.size() <= 128`) and type validation for `patientName`, `totalBill`, `receivedPayment`, and `profit`.

### 5. VIEWS & COMPONENT BEHAVIOR
- Dashboard (Clinic Overview):
  - Month dropdown selector ("All Time" and dynamic past months).
  - 4 Neo-Brutalist Stat Cards: Total Revenue, Received Payment, Pending Due (highlighted alert if > 0), and Total Profit.
  - Recent Patients list with avatar, power tags, bill amount, DUE/PAID status chip, and profit indicator.
  - Clean empty state with a "+ Add First Patient" button when no records exist.
- Patient Form:
  - 2-column layout (Patient info, Power Box, Separate Glass & Frame, Drop, Photo capture, Billing & Delivery).
  - One-tap `= Full` payment helper button to auto-match received payment to total bill.
  - "~45% Margin" profit helper button.
- Patient Records View:
  - Split list/detail layout on desktop; full list with smooth bottom sheet drawer on mobile.
  - Month filter, instant text search across name, phone, lens, frame, and address.
  - Export CSV button that exports all 13 fields.
- Printable Invoice Modal:
  - Clean print slip modal triggered by "Receipt" with prescription power table, items, payment breakdown, and signature line.
```
