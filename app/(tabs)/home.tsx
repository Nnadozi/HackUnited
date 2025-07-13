import CustomButton from '@/components/CustomButton';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import CustomIcon from '../../components/CustomIcon';
import CustomText from '../../components/CustomText';
import Page from '../../components/Page';
import SettingsModal from '../../components/SettingsModal';
import VideoPreview from '../../components/VideoPreview';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';

const LEVEL_ICONS = [
  { name: 'emoji-sad', type: 'entypo' },      // Level 0
  { name: 'emoji-neutral', type: 'entypo' },     // Level 1
  { name: 'emoji-happy', type: 'entypo' },      // Level 2
  { name: 'emoji-flirt', type: 'entypo' },     // Level 3
  { name: 'emoji-emotions', type: 'material' },       // Level 4
  { name: 'emoji-emotions', type: 'material' },    // Level 5
];

// Face icons based on recent video quality
const QUALITY_FACE_ICONS = {
  excellent: { name: 'emoji-emotions', type: 'material' },    // 80-100% quality
  happy: { name: 'emoji-happy', type: 'entypo' },            // 60-79% quality
  neutral: { name: 'emoji-neutral', type: 'entypo' },        // 40-59% quality
  concerned: { name: 'emoji-flirt', type: 'entypo' },        // 20-39% quality (concerned face)
  sad: { name: 'emoji-sad', type: 'entypo' },                // 0-19% quality
};

const XP_REQUIREMENTS = [5, 10, 20, 35, 50, 75];

export default function HomeScreen() {
  const { colors } = useThemeStore();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const videos = useUserStore((s) => s.videos);
  const user = useUserStore((s) => s.user);
  const currentLevel = useUserStore((s) => s.currentLevel);
  const currentXP = useUserStore((s) => s.currentXP);
  const router = useRouter();
  const recentVideos = [...videos].slice(0, 2);
  const removeVideo = useUserStore((s) => s.removeVideo);

  const nextLevelXP = XP_REQUIREMENTS[currentLevel] || 0;
  const progress = nextLevelXP > 0 ? currentXP / nextLevelXP : 1;
  const xpRemaining = nextLevelXP - currentXP;

  // Calculate face icon based on recent video quality
  const getQualityBasedFaceIcon = () => {
    const recentVideosForAnalysis = videos.slice(0, 5); // Last 5 videos
    
    if (recentVideosForAnalysis.length === 0) {
      return LEVEL_ICONS[currentLevel] || QUALITY_FACE_ICONS.neutral;
    }
    
    const avgQuality = recentVideosForAnalysis.reduce((sum, video) => 
      sum + (video.quality_score || 50), 0) / recentVideosForAnalysis.length;
    
    if (avgQuality >= 80) return QUALITY_FACE_ICONS.excellent;
    if (avgQuality >= 60) return QUALITY_FACE_ICONS.happy;
    if (avgQuality >= 40) return QUALITY_FACE_ICONS.neutral;
    if (avgQuality >= 20) return QUALITY_FACE_ICONS.concerned;
    return QUALITY_FACE_ICONS.sad;
  };

  const currentFaceIcon = getQualityBasedFaceIcon();

  return (
    <Page style={{justifyContent: 'flex-start', alignItems: 'center'}}>
      <CustomText style={{marginBottom: 15}} fontSize="large" opacity={0.5} bold>Hi, {user?.name}</CustomText>
      <Pressable style={styles.settingsBtn} onPress={() => setSettingsVisible(true)}>
        <CustomIcon primary name="settings" type="feather" size={30}/>
      </Pressable>
      <View style={[styles.faceCon,{backgroundColor: colors.card, borderColor: colors.border}]}> 
        <CustomIcon
          name={currentFaceIcon?.name || 'emoji-sad'}
          type={currentFaceIcon?.type as any}
          size={90}
          primary
          style={{ alignSelf: 'center' }}
        />
      </View>
      <View style={[styles.progressCon,{backgroundColor: colors.card, borderColor: colors.border}]}> 
        <CustomText style={{marginBottom: 8, color: colors.text}} fontSize="small" bold>
          <CustomText primary fontSize="small" bold>LEVEL {currentLevel}</CustomText> - ({xpRemaining > 0 ? `${xpRemaining} XP to next level` : 'Max level'})
        </CustomText>
        <View style={[styles.progressBarBg,{backgroundColor: colors.border}]}>
          <View style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: colors.primary }]} />
        </View>
      </View>
      <View style={[styles.card,{backgroundColor: colors.card, borderColor: colors.border}]}> 
        <CustomText style={{marginBottom: 5, alignSelf: 'flex-start'}} opacity={0.5} bold>Recent Videos</CustomText>
        <View style={{flex: 1, width: '100%'}}>
          <ScrollView style={{flexGrow: 0,  width: '100%'}} contentContainerStyle={{paddingBottom: 8}}>
            {recentVideos.length === 0 ? (
              <CustomText opacity={0.3}>No videos yet - add some!</CustomText>
            ) : (
              recentVideos.map((video) => (
                <VideoPreview
                  key={video.id}
                  video={video}
                  onDelete={() => removeVideo(video.id)}
                />
              ))
            )}
            {recentVideos.length > 0 && (
              <CustomButton title="See More" onPress={() => router.push('/(tabs)/videos')} />
            )}
          </ScrollView>
        </View>
      </View>
      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
    </Page>
  );
}

const styles = StyleSheet.create({
  settingsBtn: {
    position: 'absolute',
    top:45,
    left: 15,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  topRowL:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  card:{
    width: '100%',
    height: '40%',
    borderWidth: 1,
    shadowColor: '#000', 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 1, 
    borderRadius: 20,
    padding: 20,
  },
  progressCon:{
    width: '100%',
    // height: '5%',
    minHeight: 70,
    borderWidth: 1,
    shadowColor: '#000', 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 1, 
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    justifyContent: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 9,
  },
  faceCon:{
    borderWidth: 1,
    shadowColor: '#000', 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 1, 
    padding: 35,
    marginBottom: 20,
    borderRadius: 1000,
  },
}); 