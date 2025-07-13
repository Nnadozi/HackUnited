# Clarity - Video Quality Tracking App
View Submission: https://devpost.com/software/clarify-02qhgp

## Inspiration
Many people often spend their time doomscrolling or watching videos on large platforms such as Instagram and YouTube. Unfortunately, they waste large amounts of their time watching low-quality or brainrot videos that could be better spent doing productive things, such as working on their projects or even going out to touch grass. Because of that, this app is built to stop these bad habits in their tracks and incentivise users to be aware of the entertainment they watch and reduce how much content dominates their lives. 

## What it does
Clarity is an app that solves the problem at its root. Rather than simply tracking screen time, it monitors, tracks, and analyses the actual content the user watches and disincentivises them from spending too long watching unproductive content. The system is an XP-based progressive system with levels in this app. The more XP you get, the higher the level you will have. Each video is assessed on its video quality and productiveness / educational effectiveness, and through this deep analysis will be given 1-4 XP. What this essentially means is that a higher level would indicate increased content quality, as you would possess more knowledge by watching educational videos. To further incentivise the user to replace their doomscrolling or brainrot content with more productive content, Clarity removes 2 of the top XP gain videos every day, which means if you do not use the app or watch more brain rot content, your level will only decline. As a result, it is incredibly difficult to reach Level 5. Through this system, you can be more productive by watching more educational videos and reducing your consumption of negative content.

## How we built it
We built this app using React Native and Expo, ensuring cross-platform compatibility for both Android and iOS users. Our tech stack includes TypeScript for type safety, Zustand for state management, and Supabase as our backend-as-a-service solution with PostgreSQL database and edge functions.

Ideo Analysis & Web Scraping: 
To extract comprehensive metadata from YouTube, Instagram, and TikTok videos, we implemented a sophisticated web scraping system that captures:
Video Properties: Title, description, thumbnail URL, duration, and view count
Platform-Specific Data: Channel information, upload date, and engagement metrics
Content Processing: HTML entity decoding and metadata cleaning for accurate display
Our scraping engine uses targeted regex patterns to extract data from each platform:
- YouTube: Extracts lengthSeconds and viewCount from embedded JSON data
- Instagram: Parses og:video: duration and video_view_count meta tags
- TikTok: Retrieves metadata from structured data elements

AI-Powered Content Analysis: 
We integrated OpenAI's GPT-4 through Supabase Edge Functions (built with Deno) to perform comprehensive video analysis, generating:
- Quality Scores: 0-100 rating based on production value, engagement, and educational merit
- Content Categorization: Advanced classification system with XP rewards:
> Educational Content: Tutorials, courses, academic content (+3 XP)
> Productivity Content: Tips, business advice, self-improvement (+2 XP)
> Brain Rot Content: Reaction videos, memes, viral content, cringe, clickbait (+1 XP)
- Detailed Analytics: Production quality, engagement factor, information density, and practical applicability
- Mood Analysis: Overall tone, energy level, and emotional impact assessment
- Learning Insights: Key takeaways, target audience identification, complexity evaluation, and retention estimates

UI/UX Design & Implementation: 
We designed the entire user interface in Figma, focusing on modern, intuitive design principles:
- Design System: Consistent color schemes, typography (DM Sans font family), and component library
- Responsive Layout: Adaptive design using Dimensions.get('window') for optimal viewing across devices
- Visual Effects: Implemented glassmorphism effects, gradient overlays, and smooth animations
- Interactive Elements: Custom quality dial with animated pointer, XP feedback systems, and engaging onboarding flow

Technical Architecture: 
- Styling: TailwindCSS/NativeWind for rapid, consistent styling with a utility-first approach
- Navigation: Expo Router with tab-based navigation and modal overlays
- Database: Supabase PostgreSQL with optimized schema using snake_case for database entities and camelCase for JavaScript variables
- Authentication: Secure user management with Supabase Auth
- Real-time Features: Friend system with real-time updates, leaderboards, and social interactions
- Performance: Optimized video thumbnail loading, efficient state management, and smooth scrolling experiences

## Challenges we ran into
We had quite a lot of challenges, as every person within this project worked in a different time zone, which made it quite hard to collaborate effectively. We also encountered some technical issues at the start of the project, which were annoying to resolve (Problems using Expo Go and Expo SDK 53.0.0), preventing us from maximising the time we had at the start of the hackathon.
Technical Challenges:
- **Cross-Platform Video Scraping**: Different social media platforms (YouTube, Instagram, TikTok) have varying HTML structures and anti-scraping measures, requiring us to develop platform-specific extraction methods and handle frequent structure changes
- **AI Analysis Consistency**: Ensuring OpenAI's GPT-4 provided consistent and accurate content categorization across different video types and languages, requiring extensive prompt engineering and validation
- **Real-time Data Synchronization**: Managing friend requests, leaderboards, and user data updates across multiple devices while maintaining data consistency in Supabase
- **Performance Optimization**: Handling large video thumbnails and metadata without impacting app performance, especially on lower-end devices
Development Workflow Issues:
- **Asynchronous Collaboration**: Coordinating code reviews, feature integration, and debugging across multiple time zones led to delays and merge conflicts
- **Environment Setup**: Initial struggles with Expo SDK compatibility and development environment configuration consumed valuable hackathon time
- **Database Schema Evolution**: As we added new features like mood analysis and content insights, we had to carefully manage database migrations without breaking existing functionality
Design and UX Challenges:
- **Mobile-First Design**: Translating complex data visualizations (quality dials, progress bars, analytics) into intuitive mobile interfaces while maintaining visual appeal
- **Information Density**: Balancing comprehensive video analysis data with clean, non-overwhelming user interfaces
- **Onboarding Flow**: Creating an engaging first-time user experience that effectively communicates the app's value proposition

## Accomplishments that we're proud of

- **🎨 Modern UI/UX Design:** HackUnited features a beautifully crafted interface supporting both light and dark theme modes with seamless transitions. We implemented responsive design principles that adapt to different screen sizes, smooth keyboard handling for optimal text input experiences, and glassmorphism effects with gradient overlays that create visual depth. Our custom component library ensures consistency across the entire app, while animated elements like the semi-circular quality dial and XP feedback systems provide engaging user interactions.

- **🔍 Advanced Video Analysis System:** Our app goes far beyond simple URL parsing with sophisticated AI-powered content analysis. We implemented comprehensive video categorization that examines channel credibility, video duration patterns, keyword analysis, and hashtag extraction to determine educational value. The system provides detailed insights including production quality scores, engagement factors, information density metrics, mood analysis with energy levels, and learning objectives. Our intelligent XP reward system (+3 for educational, +2 for productivity, +1 for entertainment content) incentivizes users toward more meaningful content consumption.

- **👥 Comprehensive Social Features:** HackUnited transforms individual video tracking into a competitive social experience. Users can connect with friends, send and manage friend requests, view real-time leaderboards based on XP and learning levels, and compare their content consumption habits. The social layer includes friend discovery through username search, progress sharing, and collaborative learning goals that make personal development more engaging and accountable.

- **🚀 Cross-Platform Performance:** Built with React Native and Expo, our app delivers native-level performance on both iOS and Android. We optimized video thumbnail loading, implemented efficient state management with Zustand, and created smooth scrolling experiences even with large datasets. The app handles real-time updates seamlessly while maintaining responsive interactions.

- **🧠 Intelligent Content Insights:** Beyond basic metrics, we provide users with actionable insights about their viewing patterns, including target audience analysis, complexity level assessment, estimated retention rates, and personalized recommendations for content improvement. Our mood analysis feature tracks emotional impact and energy levels, helping users understand how their content choices affect their mental state.

We're especially proud of achieving this within the short timeframe of 1.5 days. 

## What's next for Clarity

Clarity represents just the start of our vision for transforming digital content consumption habits. We have plans to expand the platform with several key enhancements, ranging from more advanced video recognition and implementing computer vision for thumbnail analysis, to enhanced social features, adding weekly or monthly challenges focused on specific goals to connect users with similar interests for guidance and accountability. 
Furthermore, we might even be able to use Clarity to overhaul the existing recommendation systems of social media, using AI-powered suggestions based on friends' successful learning patterns to recommend useful videos to our users. 
Finally, a gamification expansion could be introduced to further incentivise users, including special badges, visual progression paths for different subject areas, virtual rewards, and even real-world integration, partnering with educational platforms for course discounts and certificates. 
Our ultimate goal is to create a comprehensive ecosystem that makes learning addictive and transforms how people interact with digital content, turning mindless scrolling into meaningful personal growth.

## Installation and Setup Instructions

Clone down this repository. You will need `node` and `npm` installed globally on your machine.  

Installation:

`npm install`  

To Run Test Suite:  

`npx expo start` 

To Visit App: Scan the QR from the console with the Expo Go App

