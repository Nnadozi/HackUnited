import { generateEnhancedVideoAnalysis } from './videoAnalysis';

// Test URLs for different categories
export const testUrls = {
  educational: [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Educational programming tutorial
    'https://www.youtube.com/watch?v=abc123def456', // Khan Academy math lesson
    'https://www.youtube.com/watch?v=learn123code', // Coding bootcamp lesson
  ],
  productivity: [
    'https://www.youtube.com/watch?v=productivity123', // Time management tips
    'https://www.youtube.com/watch?v=habits456success', // Building better habits
    'https://www.youtube.com/watch?v=business789tips', // Business advice
  ],
  gaming: [
    'https://www.youtube.com/watch?v=gaming123stream', // Gaming livestream
    'https://www.youtube.com/watch?v=minecraft456build', // Minecraft gameplay
    'https://www.youtube.com/watch?v=valorant789plays', // Valorant highlights
  ],
  brain_rot: [
    'https://www.youtube.com/watch?v=reaction123cringe', // Reaction video
    'https://www.youtube.com/watch?v=meme456compilation', // Meme compilation
    'https://www.youtube.com/watch?v=tiktok789fails', // TikTok fails
  ],
  entertainment: [
    'https://www.youtube.com/watch?v=movie123review', // Movie review
    'https://www.youtube.com/watch?v=music456concert', // Music concert
    'https://www.youtube.com/watch?v=comedy789show', // Comedy show
  ]
};

export async function testVideoAnalysis() {
  console.log('🧪 Testing Enhanced Video Analysis...\n');
  
  for (const [category, urls] of Object.entries(testUrls)) {
    console.log(`📂 Testing ${category.toUpperCase()} videos:`);
    
    for (const url of urls) {
      try {
        const result = await generateEnhancedVideoAnalysis(url);
        console.log(`  ✅ ${url}`);
        console.log(`     Title: ${result.title}`);
        console.log(`     Category: ${result.category}`);
        console.log(`     XP: ${result.xp_awarded}`);
        console.log(`     Quality: ${result.quality_score}%`);
        console.log(`     Platform: ${result.platform}`);
        
        if (result.scraped_data) {
          console.log(`     🔍 Scraped Data:`);
          if (result.scraped_data.channel_name) {
            console.log(`       Channel: ${result.scraped_data.channel_name}`);
          }
          if (result.scraped_data.hashtags && result.scraped_data.hashtags.length > 0) {
            console.log(`       Hashtags: ${result.scraped_data.hashtags.slice(0, 3).join(', ')}`);
          }
          if (result.scraped_data.description) {
            console.log(`       Description: ${result.scraped_data.description.substring(0, 100)}...`);
          }
        }
        
        console.log(`     Reason: ${result.analysis.reason}\n`);
      } catch (error) {
        console.log(`  ❌ ${url} - Error: ${error}\n`);
      }
    }
  }
  
  console.log('🎉 Video Analysis Testing Complete!');
}

// Test with real YouTube URLs (these will actually attempt to scrape)
export const realYouTubeUrls = {
  educational: [
    'https://www.youtube.com/watch?v=8jLOx1hD3_o', // Khan Academy
    'https://www.youtube.com/watch?v=rfscVS0vtbw', // Learn Python
    'https://www.youtube.com/watch?v=PkZNo7MFNFg', // JavaScript Tutorial
  ],
  productivity: [
    'https://www.youtube.com/watch?v=tTb3d5cjSFI', // Productivity tips
    'https://www.youtube.com/watch?v=BHY0FxzoKZE', // Time management
    'https://www.youtube.com/watch?v=UNP03fDSj1U', // Goal setting
  ],
  gaming: [
    'https://www.youtube.com/watch?v=jZOywn1qArI', // Gaming content
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Gaming stream
  ],
  brain_rot: [
    'https://www.youtube.com/watch?v=ZZ5LpwO-An4', // Reaction video
    'https://www.youtube.com/watch?v=fC7oUOUEEi4', // Meme compilation
  ]
};

export async function testRealYouTubeAnalysis() {
  console.log('🌐 Testing Real YouTube Video Analysis...\n');
  
  // Test one URL from each category
  const testCases = [
    { url: realYouTubeUrls.educational[0], expectedCategory: 'educational' },
    { url: realYouTubeUrls.productivity[0], expectedCategory: 'productivity' },
    { url: realYouTubeUrls.gaming[0], expectedCategory: 'gaming' },
    { url: realYouTubeUrls.brain_rot[0], expectedCategory: 'brain_rot' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`🔍 Analyzing: ${testCase.url}`);
      const result = await generateEnhancedVideoAnalysis(testCase.url);
      
      console.log(`  Title: ${result.title}`);
      console.log(`  Detected Category: ${result.category}`);
      console.log(`  Expected Category: ${testCase.expectedCategory}`);
      console.log(`  Match: ${result.category === testCase.expectedCategory ? '✅' : '❌'}`);
      console.log(`  XP Awarded: ${result.xp_awarded}`);
      console.log(`  Quality Score: ${result.quality_score}%`);
      
      if (result.scraped_data) {
        console.log(`  📊 Scraped Successfully:`);
        console.log(`    Channel: ${result.scraped_data.channel_name || 'N/A'}`);
        console.log(`    Hashtags: ${result.scraped_data.hashtags?.length || 0} found`);
        console.log(`    Description Length: ${result.scraped_data.description?.length || 0} chars`);
        console.log(`    Keywords: ${result.scraped_data.keywords?.length || 0} found`);
      } else {
        console.log(`  📊 No scraped data (using fallback analysis)`);
      }
      
      console.log(`  Analysis: ${result.analysis.reason}\n`);
    } catch (error) {
      console.log(`  ❌ Error analyzing ${testCase.url}: ${error}\n`);
    }
  }
  
  console.log('🎉 Real YouTube Analysis Testing Complete!');
} 