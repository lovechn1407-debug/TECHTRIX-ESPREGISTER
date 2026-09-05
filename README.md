# TechTrix Esports - Tournament Registration Platform

A premier, responsive, light-mode Esports Tournament Player Registration Platform built with **Vite + React 18**, **Vanilla CSS**, **Firebase Realtime Database & Authentication**, **ImgBB API**, and **Free Fire Player Info Verification API**.

---

## Features Overview

### 🎮 Client Panel
- **Hero & Tournaments Showcase**: Dynamic hero with gradient aesthetic, live status tags, slot progress trackers, and deadline indicators.
- **Dynamic Registration Flow**:
  - **Solo, Duo, and Squad (4-player)** support.
  - **Free Fire Live API Verification**: Enter UID, fetch live profile (Nickname, Level, BR Rank points with tier badges, Region, Account age).
  - **Confirm vs Wrong Info Fallback**: Auto-fills on confirm; enables manual entry + profile screenshot upload on wrong info or API fallback.
  - **Validation**: Strict minimum level and rank requirements, 10-digit Indian WhatsApp format (+91), image uploads via ImgBB, anti-duplicacy checks.
  - **Celebration Feedback**: Confetti animation upon submission.
- **Status & Timeline Tracking (`/status`)**:
  - Review submitted entries.
  - **Vertical Interactive Timeline**: Visual nodes for `Submitted`, `Under Review`, `Declined` (with organizer reason), `Re-submitted`, and `Approved`.
  - **Re-edit Workflow**: Direct "Re-edit & Resubmit" action for declined submissions with pre-populated form fields.

### 🛡️ Admin Panel (`/admin`)
- **Strict Security Gate (`/admin/login`)**:
  - Email/Password authentication.
  - Verifies that the authenticated UID exists in `/admins/{uid}` in the Firebase Realtime Database.
- **Control Center Dashboard (`/admin`)**:
  - 5 Key Performance Stat Cards: Total Registrations, Free Fire Entries, Approved, Pending Review, Declined.
  - Real-time recent registrations live stream with relative timestamps.
  - Quick "Create Registration" CTA.
- **Multi-Step Tournament Wizard (`/admin/create`)**:
  - **Step 1 - Select Game**: Free Fire active, BGMI/Valorant coming soon.
  - **Step 2 - Basic Info**: Name, Short tag, Custom closing date/time vs "Until I Close", Slot capacity (Limited/Unlimited).
  - **Step 3 - Game Settings**: Mode (BR-DEFAULT / BR-CRAFTLAND), Format (Solo/Duo/Squad), Require Team Logo, Require Player Images, Verification Method (API vs Manual), Minimum Level, Minimum BR Rank, Duplicacy Check.
  - **Step 4 - Additional Info**: Tournament Date, read-only Level/Rank parameters.
  - **Step 5 - Review & Confirm**: Organized settings summary with step-editing shortcuts.
- **Tournament Forms Management (`/admin/forms`)**:
  - Live table of all tournaments with real-time search and filter.
  - Instant Open/Closed status toggle switch.
  - Deletion with safety confirmation modal.
- **Submissions Review (`/admin/forms/:formId`)**:
  - Filter tabs: `All`, `Pending`, `Approved`, `Declined`.
  - Search by player name or UID.
  - View full roster details, player stats, and hosted ImgBB screenshots.
  - One-click **Approve** and **Decline** (with mandatory reason modal recorded to timeline).

---

## Design System (Light Mode Only)

- **Color Tokens**:
  - Primary: `#6C5CE7` (Vibrant Purple)
  - Secondary: `#00CEC9` (Teal Accent)
  - Success: `#00B894`
  - Warning: `#FDCB6E`
  - Danger: `#FF7675`
  - Background: `#F8F9FE`
  - Surface: `#FFFFFF`
  - Hero Gradient: `linear-gradient(135deg, #6C5CE7, #00CEC9)`
- **Typography**:
  - Headings: `Outfit`, sans-serif (weights: 600, 700)
  - Body: `Inter`, sans-serif (weights: 400, 500)
  - Monospace: `JetBrains Mono` (for UIDs, short codes)
- **Visual Standards**:
  - Zero emojis (exclusive use of Lucide React SVG icons).
  - Glassmorphic accents, floating label inputs, elevation shadows, and micro-animations.

---

## Free Fire BR Rank Mapping

| Rank Name | Points Range |
| :--- | :--- |
| **Bronze** | 0 – 1,299 |
| **Silver** | 1,300 – 1,599 |
| **Gold** | 1,600 – 2,099 |
| **Platinum** | 2,100 – 2,749 |
| **Diamond** | 2,750 – 3,499 |
| **Heroic** | 3,500 – 4,299 |
| **Elite Heroic** | 4,300 – 7,099 |
| **Master** | 7,100 – 8,999 |
| **Elite Master** | 9,000 – 999,999 |

---

## Firebase Configuration & Security Rules

### Environment Variables (`.env`)
```env
VITE_FIREBASE_API_KEY=AIzaSyCLLVF1XwlZEqQjg_9iD3NHx3KagHbvusM
VITE_FIREBASE_AUTH_DOMAIN=techtrix-espregister.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://techtrix-espregister-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=techtrix-espregister
VITE_FIREBASE_STORAGE_BUCKET=techtrix-espregister.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=203804289655
VITE_FIREBASE_APP_ID=1:203804289655:web:e22ccd18cfc90e3886f472
VITE_FIREBASE_MEASUREMENT_ID=G-4CDRKLNSJ6
VITE_IMGBB_API_KEY=83e3f88941efd1059a89f016ff302d9e
VITE_FF_API_URL=https://siambhau69.eu.cc/freefireinfo/bhau
VITE_FF_API_KEY=techtrix:FFINFO:ROM
```

### Recommended Firebase Realtime Database Rules
In the Firebase Console under **Realtime Database > Rules**, set:
```json
{
  "rules": {
    "admins": {
      ".read": true,
      ".write": "auth != null"
    },
    "forms": {
      ".read": true,
      ".write": "auth != null"
    },
    "submissions": {
      ".read": true,
      ".write": "auth != null"
    },
    "userSubmissions": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

### Setting Up an Admin User
1. Create a user in **Firebase Console > Authentication > Users** with email & password.
2. In **Firebase Realtime Database**, create the node:
   ```json
   {
     "admins": {
       "USER_FIREBASE_UID_HERE": true
     }
   }
   ```
3. Log in at `/admin/login`.

---

## Local Development & Deployment

### Run Locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

### Production Build
```bash
npm run build
```

### Vercel Deployment
The repository includes `vercel.json` with SPA routing rules configured:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
Connect your Git repository to Vercel and it will automatically detect Vite and build to `dist/`.
