import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VideoAnalysisRequest {
  url: string;
  title?: string;
  description?: string;
  channel_name?: string;
  hashtags?: string[];
  platform?: 'youtube' | 'instagram' | 'tiktok' | 'other';
  user_level?: number;
}

export interface VideoAnalysisResponse {
  xp_awarded: number;
  quality_score: number;
  category: 'educational' | 'entertainment' | 'gaming' | 'productivity' | 'brain_rot' | 'other';
  analysis_reason: string;
  tags: string[];
  detailed_analysis: {
    educational_value: number; // 0-100
    productivity_value: number; // 0-100
    entertainment_value: number; // 0-100
    time_waste_potential: number; // 0-100
    skill_development: number; // 0-100
    knowledge_gain: number; // 0-100
    motivation_impact: number; // -100 to 100 (negative = demotivating)
    stress_relief: number; // 0-100
    social_value: number; // 0-100
    creativity_stimulation: number; // 0-100
    production_quality: number; // 0-100
    engagement_factor: number; // 0-100
    information_density: number; // 0-100
    practical_applicability: number; // 0-100
  };
  recommendations: {
    watch_duration: 'full' | 'partial' | 'skip' | 'moderate';
    best_time_to_watch: 'morning' | 'afternoon' | 'evening' | 'anytime' | 'avoid';
    frequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';
    alternatives: string[];
  };
  content_warnings?: string[];
  learning_objectives?: string[];
  mood_analysis?: {
    overall_tone: 'positive' | 'negative' | 'neutral' | 'mixed';
    energy_level: 'high' | 'medium' | 'low';
    emotional_impact: string;
  };
  content_insights?: {
    key_takeaways: string[];
    target_audience: string;
    complexity_level: 'beginner' | 'intermediate' | 'advanced';
    estimated_retention: number; // 0-100
  };
}

// Advanced XP system – same rules as client
function adjustXP(baseXP: number, level: number): number {
  if (level < 5) {
    if (baseXP >= 3) return 4;
    if (baseXP >= 2) return 3;
    if (baseXP >= 1) return 2;
    // anything else gives minimum +1
    return 1;
  }
  // level 5+
  if (baseXP >= 3) return 2;
  if (baseXP >= 1) return 1;
  if (baseXP === 0) return -1;
  return -2;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, title, description, channel_name, hashtags, platform, user_level = 1 }: VideoAnalysisRequest = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare content for analysis
    const contentForAnalysis = [
      title || '',
      description || '',
      channel_name || '',
      ...(hashtags || []),
      url
    ].filter(Boolean).join(' ')

    // If no description provided, try to scrape YouTube data server-side
    let enhancedDescription = description || '';
    let enhancedTitle = title || '';
    let enhancedChannelName = channel_name || '';
    let enhancedHashtags = hashtags || [];

    if (platform === 'youtube' && (!description || !title)) {
      try {
        console.log('Attempting server-side YouTube scraping...');
        
        // Extract video ID from URL
        const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
        if (videoIdMatch) {
          const videoId = videoIdMatch[1];
          
          // Try multiple approaches to get video data
          const approaches = [
            // Approach 1: Direct YouTube page fetch with explicit English headers
            async () => {
              const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                  'Accept-Language': 'en-US,en;q=0.9,en-GB;q=0.8',
                  'Accept-Encoding': 'gzip, deflate, br',
                  'Connection': 'keep-alive',
                  'Upgrade-Insecure-Requests': '1',
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache',
                  'DNT': '1',
                  'Sec-Fetch-Dest': 'document',
                  'Sec-Fetch-Mode': 'navigate',
                  'Sec-Fetch-Site': 'none',
                  'Sec-Fetch-User': '?1',
                  'Cookie': 'PREF=hl=en&gl=US; YSC=dQw4w9WgXcQ; VISITOR_INFO1_LIVE=abcdefghijk'
                }
              });
              
              if (!response.ok) throw new Error('Failed to fetch YouTube page');
              
              const html = await response.text();
              
              // Extract title from various possible locations
              const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                               html.match(/"title":"([^"]+)"/i) ||
                               html.match(/property="og:title" content="([^"]+)"/i);
              
              // Extract description from various possible locations
              const descMatch = html.match(/property="og:description" content="([^"]+)"/i) ||
                              html.match(/"description":"([^"]+)"/i) ||
                              html.match(/name="description" content="([^"]+)"/i);
              
              // Extract channel name
              const channelMatch = html.match(/"ownerChannelName":"([^"]+)"/i) ||
                                 html.match(/"author":"([^"]+)"/i) ||
                                 html.match(/property="og:site_name" content="([^"]+)"/i);
              
              // Extract view count with multiple patterns
              const viewsMatch = html.match(/"viewCount":"(\d+)"/i) ||
                               html.match(/"views":{"runs":\[{"text":"([^"]+)"/i) ||
                               html.match(/(\d+(?:,\d+)*)\s*views/i) ||
                               html.match(/"videoViewCountRenderer":{"viewCount":{"runs":\[{"text":"([^"]+)"/i);
              
              // Extract duration with multiple patterns
              const durationMatch = html.match(/"lengthSeconds":"(\d+)"/i) ||
                                   html.match(/"duration":"PT(\d+)M(\d+)S"/i) ||
                                   html.match(/"approxDurationMs":"(\d+)"/i) ||
                                   html.match(/"videoDuration":"([^"]+)"/i);
              
              // Extract likes count
              const likesMatch = html.match(/"likeCount":"(\d+)"/i) ||
                               html.match(/"defaultText":"(\d+(?:,\d+)*)"[^}]*"accessibility"[^}]*"like"/i);
              
              // Extract upload date
              const uploadMatch = html.match(/"uploadDate":"([^"]+)"/i) ||
                                html.match(/"publishDate":"([^"]+)"/i);
              
              // Parse view count
              let views = 0;
              if (viewsMatch) {
                const viewStr = viewsMatch[1];
                if (viewStr.includes(',')) {
                  views = parseInt(viewStr.replace(/,/g, ''));
                } else if (viewStr.includes('K')) {
                  views = Math.floor(parseFloat(viewStr) * 1000);
                } else if (viewStr.includes('M')) {
                  views = Math.floor(parseFloat(viewStr) * 1000000);
                } else if (viewStr.includes('B')) {
                  views = Math.floor(parseFloat(viewStr) * 1000000000);
                } else {
                  views = parseInt(viewStr) || 0;
                }
              }
              
              // Parse duration
              let duration = 0;
              if (durationMatch) {
                const durationStr = durationMatch[1];
                if (durationMatch[0].includes('PT')) {
                  // ISO 8601 format PT1M30S
                  const minutes = parseInt(durationMatch[1]) || 0;
                  const seconds = parseInt(durationMatch[2]) || 0;
                  duration = minutes * 60 + seconds;
                } else if (durationMatch[0].includes('approxDurationMs')) {
                  // Milliseconds format
                  duration = Math.floor(parseInt(durationStr) / 1000);
                } else {
                  // Seconds format
                  duration = parseInt(durationStr) || 0;
                }
              }
              
              // Parse likes
              let likes = 0;
              if (likesMatch) {
                const likeStr = likesMatch[1];
                if (likeStr.includes(',')) {
                  likes = parseInt(likeStr.replace(/,/g, ''));
                } else {
                  likes = parseInt(likeStr) || 0;
                }
              }
              
              if (titleMatch) {
                const title = titleMatch[1]
                  .replace(/&quot;/g, '"')
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&#39;/g, "'")
                  .replace(/&apos;/g, "'")
                  .replace(/ - YouTube$/, '')
                  .trim();
                
                const description = descMatch ? descMatch[1]
                  .replace(/&quot;/g, '"')
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&#39;/g, "'")
                  .replace(/&apos;/g, "'")
                  .trim() : '';
                
                const channel = channelMatch ? channelMatch[1]
                  .replace(/&quot;/g, '"')
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&#39;/g, "'")
                  .replace(/&apos;/g, "'")
                  .trim() : '';
                
                return { 
                  title, 
                  description, 
                  channel, 
                  views, 
                  duration, 
                  likes,
                  uploadDate: uploadMatch ? uploadMatch[1] : null
                };
              }
              
              throw new Error('Could not extract video data from YouTube page');
            },

            // Approach 2: YouTube oEmbed API (always returns English)
            async () => {
              const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
                headers: {
                  'Accept-Language': 'en-US,en;q=0.9',
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
              });
              
              if (!response.ok) throw new Error('oEmbed API failed');
              
              const data = await response.json();
              return {
                title: data.title || '',
                description: '',
                channel: data.author_name || '',
                views: 0,
                duration: 0,
                likes: 0,
                uploadDate: null
              };
            },

            // Approach 3: Alternative proxy with English headers
            async () => {
              const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}&hl=en&gl=US`)}`, {
                headers: {
                  'Accept-Language': 'en-US,en;q=0.9',
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
              });
              
              if (!response.ok) throw new Error('Proxy fetch failed');
              
              const data = await response.json();
              const html = data.contents;
              
              const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
              const descMatch = html.match(/property="og:description" content="([^"]+)"/i);
              const channelMatch = html.match(/"ownerChannelName":"([^"]+)"/i);
              const viewsMatch = html.match(/"viewCount":"(\d+)"/i);
              const durationMatch = html.match(/"lengthSeconds":"(\d+)"/i);
              
              if (titleMatch) {
                return {
                  title: titleMatch[1].replace(/ - YouTube$/, '').trim(),
                  description: descMatch ? descMatch[1].trim() : '',
                  channel: channelMatch ? channelMatch[1].trim() : '',
                  views: viewsMatch ? parseInt(viewsMatch[1]) : 0,
                  duration: durationMatch ? parseInt(durationMatch[1]) : 0,
                  likes: 0,
                  uploadDate: null
                };
              }
              
              throw new Error('Could not extract data from proxy response');
            }
          ];

          // Try each approach until one succeeds
          for (const approach of approaches) {
            try {
              const result = await approach();
              if (result.title) {
                enhancedTitle = result.title;
                enhancedDescription = result.description || enhancedDescription;
                enhancedChannelName = result.channel || enhancedChannelName;
                
                // Store additional metadata for database
                console.log(`Successfully extracted: Title: ${result.title}, Views: ${result.views}, Duration: ${result.duration}s`);
                break;
              }
            } catch (error) {
              console.log(`Approach failed: ${error.message}`);
              continue;
            }
          }
        }
      } catch (error) {
        console.log('Server-side scraping failed:', error.message);
      }
    }

    // Update content for analysis with enhanced data
    const finalContentForAnalysis = [
      enhancedTitle,
      enhancedDescription,
      enhancedChannelName,
      ...enhancedHashtags,
      url
    ].filter(Boolean).join(' ')

    // Enhanced AI prompt with explicit English instructions
    const prompt = `
You are a video content analyzer. Analyze this video content and provide a JSON response with the following structure. 

**IMPORTANT: All your responses must be in English only. Do not use any other language.**

Video Information:
- Title: ${enhancedTitle}
- Description: ${enhancedDescription}
- Channel: ${enhancedChannelName}
- Platform: ${platform}
- URL: ${url}
- Hashtags: ${enhancedHashtags.join(', ')}

**CRITICAL GAMING CONTENT RULES:**
- Gaming videos (gameplay, gaming tutorials, gaming reviews, etc.) should ALWAYS have:
  - Educational value: 5-20 (LOW)
  - Time waste potential: 70-90 (HIGH)
  - Category: "gaming"
  - XP awarded: -2 (negative)
  - Tags should include "gaming" and specific game genre tags

**EDUCATIONAL CONTENT RULES:**
- Educational videos (tutorials, courses, documentaries) should have:
  - Educational value: 70-95 (HIGH)
  - Time waste potential: 5-30 (LOW)
  - Category: "educational"
  - XP awarded: +3 (positive)
  - Tags should include "educational", "learning", and subject-specific tags

**ENTERTAINMENT CONTENT RULES:**
- Pure entertainment (comedy, vlogs, reaction videos) should have:
  - Educational value: 10-40 (LOW-MEDIUM)
  - Time waste potential: 60-85 (HIGH)
  - Category: "entertainment"
  - XP awarded: 0 to +1
  - Tags should include "entertainment" and content-specific tags

Provide your analysis in this exact JSON format (no additional text):

{
  "xp_awarded": number, // -5 to +5 based on educational/productivity value
  "quality_score": number, // 0-100 overall quality score
  "category": "educational" | "entertainment" | "gaming" | "productivity" | "brain_rot" | "other",
  "analysis_reason": "string", // Brief explanation in English
  "tags": ["string"], // 3-8 relevant tags in English (e.g., "educational", "coding", "tutorial", "gaming", "entertainment")
  "detailed_analysis": {
    "educational_value": number, // 0-100
    "productivity_value": number, // 0-100
    "entertainment_value": number, // 0-100
    "time_waste_potential": number, // 0-100
    "skill_development": number, // 0-100
    "knowledge_gain": number, // 0-100
    "motivation_impact": number, // -100 to 100
    "stress_relief": number, // 0-100
    "social_value": number, // 0-100
    "creativity_stimulation": number, // 0-100
    "production_quality": number, // 0-100 (video/audio quality, editing, presentation)
    "engagement_factor": number, // 0-100 (how engaging/captivating the content is)
    "information_density": number, // 0-100 (amount of useful information per minute)
    "practical_applicability": number // 0-100 (how applicable the content is to real life)
  },
  "recommendations": {
    "watch_duration": "full" | "partial" | "skip" | "moderate",
    "best_time_to_watch": "morning" | "afternoon" | "evening" | "anytime" | "avoid",
    "frequency": "daily" | "weekly" | "monthly" | "rarely" | "never",
    "alternatives": ["string"] // Suggest better alternatives in English
  },
  "content_warnings": ["string"], // Any warnings in English
  "learning_objectives": ["string"], // What can be learned, in English
  "mood_analysis": {
    "overall_tone": "positive" | "negative" | "neutral" | "mixed",
    "energy_level": "high" | "medium" | "low",
    "emotional_impact": "string" // Brief description of emotional impact
  },
  "content_insights": {
    "key_takeaways": ["string"], // Main points or lessons (max 3)
    "target_audience": "string", // Who this content is best for
    "complexity_level": "beginner" | "intermediate" | "advanced",
    "estimated_retention": number // 0-100, how much viewers will remember
  }
}

**Remember: Respond ONLY in English. All text fields must be in English.**
`;

    // OpenAI API call for detailed analysis
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: `Analyze this video content: "${finalContentForAnalysis}"

Platform: ${platform || 'unknown'}
User Level: ${user_level}

Provide detailed analysis with specific scores and recommendations.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const aiContent = openaiData.choices?.[0]?.message?.content

    if (!aiContent) {
      throw new Error('No response from OpenAI')
    }

    // Parse AI response
    let analysis: VideoAnalysisResponse
    try {
      // Extract JSON from AI response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in AI response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent)
      throw new Error('Failed to parse AI analysis')
    }

    // Apply unified XP adjustment so server matches client
    analysis.xp_awarded = adjustXP(analysis.xp_awarded, user_level);

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in video analysis:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze video',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 