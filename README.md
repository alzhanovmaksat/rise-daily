# Rise Daily - Updated App

## What's New (v1.1.0)

### ⭐ New Features
- **Daily Streak Tracking** - Track consecutive days of app usage with animated badge
- **Category Filtering** - Filter affirmations by: All, Faith, Confidence, Gratitude, Peace, Strength, Hope
- **Favorites Screen** - New dedicated tab to view and manage saved affirmations
- **Enhanced Settings** - Visual streak stats, default category preference

### 🎨 New Branding
- New "Rise Daily" name (more distinctive than "Daily Affirmations")
- New sunrise icon design
- Orange/sunrise color theme

## Installation

### Option A: Replace Entire Project (Easiest)
1. Backup your current project folder
2. Delete contents of your project folder (keep the folder itself)
3. Copy ALL files from this zip into your project folder
4. Run:
   ```bash
   npm install
   npx expo start -c
   ```

### Option B: Update Existing Project
Copy these files/folders to your project, replacing existing ones:
- `App.js` → root folder
- `app.json` → root folder  
- `screens/` → replace entire folder
- `utils/storage.js` → replace file
- `data/affirmationsHelper.js` → add new file
- `assets/` → replace icon.png, splash.png, adaptive-icon.png

Then run:
```bash
npx expo start -c
```

## File Structure
```
rise-daily/
├── App.js                    # Main app with tab navigation
├── app.json                  # App configuration (new branding)
├── package.json              # Dependencies
├── assets/
│   ├── icon.png              # New sunrise icon
│   ├── adaptive-icon.png     # Android adaptive icon
│   ├── favicon.png           # Web favicon
│   └── splash.png            # New splash screen
├── components/
│   └── AffirmationCard.js    # Affirmation display card
├── data/
│   ├── affirmations.js       # 300 affirmations data
│   └── affirmationsHelper.js # NEW: Category system
├── screens/
│   ├── HomeScreen.js         # Updated with streak & categories
│   ├── FavoritesScreen.js    # NEW: Favorites tab
│   └── SettingsScreen.js     # Updated with stats
├── services/
│   └── notificationService.js # Push notifications
└── utils/
    └── storage.js            # Updated with streak tracking
```

## Features Detail

### Daily Streak
- Opens app daily → streak increases
- Miss a day → streak resets to 1
- Longest streak is recorded
- Animated flame badge on home screen

### Categories
- **All** - Show all affirmations
- **Faith** - Bible verses, spiritual content
- **Confidence** - Self-belief, courage
- **Gratitude** - Thankfulness, blessings
- **Peace** - Calm, rest, comfort
- **Strength** - Perseverance, overcoming
- **Hope** - Future, new beginnings

### Favorites
- Tap heart on any affirmation to save
- View all favorites in dedicated tab
- Filter favorites by category
- Share directly from favorites

## For App Store Resubmission

Emphasize these unique features:
1. "Daily streak system encourages consistent spiritual practice"
2. "7 category filters for personalized inspiration"
3. "Dedicated favorites management"
4. "300+ hand-curated Bible verses and motivational quotes"

Good luck with your resubmission! 🚀
