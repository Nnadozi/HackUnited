import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { generateEnhancedVideoAnalysis, VideoAnalysisResult } from '../utils/videoAnalysis';
import CustomText from './CustomText';

interface VideoAnalysisTestProps {
  onClose: () => void;
}

export default function VideoAnalysisTest({ onClose }: VideoAnalysisTestProps) {
  const { colors } = useThemeStore();
  const theme = colors;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<VideoAnalysisResult[]>([]);

  const testUrls = [
    {
      url: 'https://www.youtube.com/watch?v=8jLOx1hD3_o',
      description: 'Khan Academy - Educational Content',
      expectedCategory: 'educational'
    },
    {
      url: 'https://www.youtube.com/watch?v=tTb3d5cjSFI',
      description: 'Productivity Tips Video',
      expectedCategory: 'productivity'
    },
    {
      url: 'https://www.youtube.com/watch?v=jZOywn1qArI',
      description: 'Gaming Content',
      expectedCategory: 'gaming'
    },
    {
      url: 'https://www.youtube.com/watch?v=ZZ5LpwO-An4',
      description: 'Reaction/Meme Video',
      expectedCategory: 'brain_rot'
    }
  ];

  const testVideoAnalysis = async () => {
    setIsAnalyzing(true);
    setResults([]);
    
    try {
      const analysisResults: VideoAnalysisResult[] = [];
      
      for (const testCase of testUrls) {
        try {
          console.log(`🔍 Analyzing: ${testCase.url}`);
          const result = await generateEnhancedVideoAnalysis(testCase.url);
          analysisResults.push(result);
          console.log(`✅ Analysis complete for ${testCase.description}`);
        } catch (error) {
          console.error(`❌ Error analyzing ${testCase.description}:`, error);
          // Create a fallback result for display
          analysisResults.push({
            url: testCase.url,
            title: `Failed to analyze: ${testCase.description}`,
            platform: 'youtube',
            category: 'other',
            xp_awarded: 0,
            quality_score: 0,
            analysis: {
              is_educational: false,
              is_brain_rot: false,
              content_quality: 'low',
              reason: 'Analysis failed - network or parsing error'
            }
          });
        }
      }
      
      setResults(analysisResults);
      Alert.alert('Analysis Complete', `Analyzed ${analysisResults.length} videos successfully!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete video analysis test');
      console.error('Test error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'educational': return '#4CAF50';
      case 'productivity': return '#2196F3';
      case 'gaming': return '#F44336';
      case 'brain_rot': return '#FF5722';
      case 'entertainment': return '#FF9800';
      default: return theme.border;
    }
  };

  const getXPColor = (xp: number) => {
    if (xp > 0) return '#4CAF50';
    if (xp < 0) return '#F44336';
    return theme.text;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 24, 
        paddingVertical: 20,
        backgroundColor: theme.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.border + '40'
      }}>
        <Pressable 
          onPress={onClose} 
          style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 22,
            backgroundColor: theme.card,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16
          }}
        >
          <Ionicons name="close" size={20} color={theme.text} />
        </Pressable>
        <CustomText style={{ 
          fontSize: 24, 
          fontWeight: '800', 
          color: theme.text, 
          flex: 1 
        }}>
          Video Analysis Test
        </CustomText>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        {/* Test Description */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: theme.border + '40'
        }}>
          <CustomText style={{ 
            fontSize: 18, 
            fontWeight: '700', 
            color: theme.text,
            marginBottom: 12
          }}>
            Enhanced Video Analysis Test
          </CustomText>
          <CustomText style={{ 
            fontSize: 14, 
            color: theme.text, 
            opacity: 0.7,
            lineHeight: 20,
            marginBottom: 16
          }}>
            This test demonstrates the enhanced video analysis system that scrapes YouTube content for hashtags, descriptions, and metadata to improve content categorization.
          </CustomText>
          
          <Pressable
            onPress={testVideoAnalysis}
            disabled={isAnalyzing}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isAnalyzing ? 0.6 : 1
            }}
          >
            {isAnalyzing ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <CustomText style={{ 
                  fontSize: 16, 
                  fontWeight: '700', 
                  color: 'white',
                  marginLeft: 12
                }}>
                  Analyzing Videos...
                </CustomText>
              </>
            ) : (
              <>
                <Ionicons name="play-circle-outline" size={20} color="white" />
                <CustomText style={{ 
                  fontSize: 16, 
                  fontWeight: '700', 
                  color: 'white',
                  marginLeft: 12
                }}>
                  Run Analysis Test
                </CustomText>
              </>
            )}
          </Pressable>
        </View>

        {/* Test URLs */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: theme.border + '40'
        }}>
          <CustomText style={{ 
            fontSize: 16, 
            fontWeight: '700', 
            color: theme.text,
            marginBottom: 16
          }}>
            Test URLs
          </CustomText>
          {testUrls.map((testCase, index) => (
            <View key={index} style={{ marginBottom: 12 }}>
              <CustomText style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: theme.text,
                marginBottom: 4
              }}>
                {testCase.description}
              </CustomText>
              <CustomText style={{ 
                fontSize: 12, 
                color: theme.text, 
                opacity: 0.6,
                fontFamily: 'monospace'
              }}>
                {testCase.url}
              </CustomText>
            </View>
          ))}
        </View>

        {/* Results */}
        {results.length > 0 && (
          <View style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.border + '40'
          }}>
            <CustomText style={{ 
              fontSize: 16, 
              fontWeight: '700', 
              color: theme.text,
              marginBottom: 16
            }}>
              Analysis Results
            </CustomText>
            
            {results.map((result, index) => (
              <View key={index} style={{ 
                marginBottom: 20,
                padding: 16,
                backgroundColor: theme.background,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.border + '20'
              }}>
                <CustomText style={{ 
                  fontSize: 14, 
                  fontWeight: '700', 
                  color: theme.text,
                  marginBottom: 8
                }}>
                  {result.title}
                </CustomText>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <View style={{ 
                    backgroundColor: getCategoryColor(result.category), 
                    paddingHorizontal: 12, 
                    paddingVertical: 4, 
                    borderRadius: 12 
                  }}>
                    <CustomText style={{ 
                      fontSize: 10, 
                      fontWeight: '700', 
                      color: 'white' 
                    }}>
                      {result.category.toUpperCase()}
                    </CustomText>
                  </View>
                  <View style={{
                    backgroundColor: getXPColor(result.xp_awarded) + '20',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12
                  }}>
                    <CustomText style={{ 
                      fontSize: 10, 
                      fontWeight: '700', 
                      color: getXPColor(result.xp_awarded) 
                    }}>
                      {result.xp_awarded > 0 ? '+' : ''}{result.xp_awarded} XP
                    </CustomText>
                  </View>
                  <CustomText style={{ 
                    fontSize: 12, 
                    color: theme.text, 
                    opacity: 0.6
                  }}>
                    {result.quality_score}% Quality
                  </CustomText>
                </View>

                {result.scraped_data && (
                  <View style={{ marginTop: 12 }}>
                    <CustomText style={{ 
                      fontSize: 12, 
                      fontWeight: '600', 
                      color: theme.text,
                      marginBottom: 8
                    }}>
                      Scraped Data:
                    </CustomText>
                    
                    {result.scraped_data.channel_name && (
                      <CustomText style={{ 
                        fontSize: 11, 
                        color: theme.text, 
                        opacity: 0.7,
                        marginBottom: 4
                      }}>
                        Channel: {result.scraped_data.channel_name}
                      </CustomText>
                    )}
                    
                    {result.scraped_data.hashtags && result.scraped_data.hashtags.length > 0 && (
                      <CustomText style={{ 
                        fontSize: 11, 
                        color: theme.text, 
                        opacity: 0.7,
                        marginBottom: 4
                      }}>
                        Hashtags: {result.scraped_data.hashtags.slice(0, 3).join(', ')}
                      </CustomText>
                    )}
                    
                    {result.scraped_data.description && (
                      <CustomText style={{ 
                        fontSize: 11, 
                        color: theme.text, 
                        opacity: 0.7,
                        marginBottom: 4
                      }}>
                        Description: {result.scraped_data.description.substring(0, 100)}...
                      </CustomText>
                    )}
                  </View>
                )}

                <CustomText style={{ 
                  fontSize: 11, 
                  color: theme.text, 
                  opacity: 0.6,
                  marginTop: 8,
                  fontStyle: 'italic'
                }}>
                  {result.analysis.reason}
                </CustomText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
} 