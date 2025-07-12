# Clarity - Video Quality Tracking App

## Overview
Clarity is a React Native app that gamifies video consumption by tracking content quality and awarding XP based on educational value. Built with Expo and designed to encourage mindful media consumption.

## Key Features

### 🎯 XP Leveling System
- **6 Levels (0-5)**: Requiring 5→10→20→35→50→75 XP (200 total)
- **Daily Decay**: Lose 2 videos worth of progress daily if inactive
- **Smart XP Awards**: 1-3 XP for quality content, negative XP for brain rot

### 🔍 Enhanced Video Analysis
The app features an advanced video analysis system that goes beyond simple URL parsing:

#### YouTube Web Scraping
- **Real-time Content Analysis**: Scrapes YouTube pages for comprehensive metadata
- **Hashtag Extraction**: Identifies and weighs hashtags for better categorization
- **Description Analysis**: Analyzes video descriptions for content keywords
- **Channel Recognition**: Recognizes educational channels (Khan Academy, TED, etc.)
- **Duration Scoring**: Longer content typically receives higher quality scores
- **View Count Analysis**: High views with low educational value may indicate brain rot

#### Advanced Categorization
- **Educational Content**: Tutorials, courses, academic content (+3 XP)
- **Productivity Content**: Tips, business advice, self-improvement (+2 XP)
- **Entertainment**: Movies, music, general entertainment (0 XP)
- **Gaming Content**: Gameplay, streams, gaming videos (-2 XP)
- **Brain Rot**: Reaction videos, memes, mindless content (-3 XP)

#### Keyword Analysis
The system uses extensive keyword libraries with weighted scoring:
- **Educational Keywords**: tutorial, learn, education, programming, science, etc.
- **Productivity Keywords**: productivity, tips, business, finance, goals, etc.
- **Brain Rot Keywords**: reaction, meme, viral, cringe, drama, clickbait, etc.
- **Gaming Keywords**: gaming, gameplay, stream, esports, specific game names
- **Entertainment Keywords**: movie, music, comedy, show, review, etc.

#### Fallback System
- **CORS Proxy**: Uses `api.allorigins.win` for cross-origin requests
- **Graceful Degradation**: Falls back to URL-based analysis if scraping fails
- **Mock Data Generation**: Provides realistic test data for development

### 🎮 Gamification Features
- **Level-up Celebrations**: Confetti animations and achievement modals
- **XP Feedback**: Real-time feedback when adding videos
- **Quality Scoring**: 0-100% quality score for each video
- **Progress Tracking**: Visual progress bars and statistics

### 👥 Social Features
- **Friends System**: Add friends, view leaderboards, send requests
- **Real-time Status**: Online/offline status and last active tracking
- **Competitive Element**: Compare XP and levels with friends
- **Friend Requests**: Send, accept, and reject friend requests

### 🔐 Authentication
- **Google OAuth**: Real Google Sign-In with expo-auth-session
- **Apple Sign-In**: Native Apple authentication for iOS
- **Secure Storage**: Credentials stored with expo-secure-store
- **Persistent Sessions**: Automatic login on app restart

### 🎨 Modern UI/UX
- **Theme Support**: Light and dark mode with smooth transitions
- **Animated Navigation**: Modern bottom tab bar with smooth animations
- **Pull-to-Refresh**: Refresh data with native pull gestures
- **Keyboard Handling**: Proper keyboard avoidance and input management
- **Responsive Design**: Works on various screen sizes

## Technical Implementation

### Video Analysis Architecture
```typescript
// Enhanced analysis flow
const videoData = await generateEnhancedVideoAnalysis(url);

// Scraping process
1. Extract YouTube video ID from URL
2. Fetch page content via CORS proxy
3. Parse HTML for metadata (title, description, hashtags, etc.)
4. Analyze content with weighted keyword scoring
5. Apply channel reputation and duration bonuses
6. Generate final category and XP award
```

### Keyword Scoring System
```typescript
// Weighted scoring example
EDUCATIONAL_KEYWORDS.forEach(keyword => {
  if (content.includes(keyword)) {
    educationalScore += scrapedData?.hashtags?.some(tag => 
      tag.toLowerCase().includes(keyword)) ? 3 : 1;
  }
});
```

### Additional Factors
- **Channel Reputation**: Educational channels get +5 score boost
- **Duration Bonus**: 10+ minute videos get +1 educational/productivity score
- **Short Content Penalty**: <1 minute videos get +2 brain rot score
- **Viral Content Detection**: High views + low educational value = brain rot

## Setup Instructions

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator

### Installation
```bash
npm install
npx expo start
```

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your bundle ID and update `app.config.js`

### Environment Configuration
Update `app.config.js` with your OAuth credentials:
```javascript
expo: {
  plugins: [
    [
      "expo-auth-session",
      {
        scheme: "your-app-scheme"
      }
    ]
  ]
}
```

## Testing Video Analysis

The app includes a built-in test screen to demonstrate the enhanced video analysis:

1. Navigate to the "Test" tab in the bottom navigation
2. Click "Run Analysis Test" to test with sample YouTube URLs
3. View results showing scraped data, categorization, and XP awards
4. Check console logs for detailed analysis information

### Test Categories
- **Educational**: Khan Academy, programming tutorials, academic content
- **Productivity**: Business tips, time management, self-improvement
- **Gaming**: Gameplay videos, streams, gaming content
- **Brain Rot**: Reaction videos, meme compilations, viral content

## Architecture

### State Management
- **Zustand**: Lightweight state management with persistence
- **AsyncStorage**: For app data persistence
- **SecureStore**: For sensitive authentication data

### Navigation
- **Custom Tab Navigation**: Animated bottom tabs with smooth transitions
- **Screen Management**: Centralized view state management

### Data Flow
```
URL Input → Enhanced Analysis → Content Categorization → XP Award → State Update → UI Feedback
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test video analysis with various YouTube URLs
4. Submit pull request with analysis results

## License

MIT License - see LICENSE file for details.

---

**Note**: The web scraping functionality requires network access and may be subject to YouTube's terms of service. The app includes fallback mechanisms for offline use and when scraping fails.
