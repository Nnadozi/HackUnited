import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import CustomText from '../../components/CustomText';
import Page from '../../components/Page';
import VideoPreview from '../../components/VideoPreview';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';

export default function VideosScreen() {
  const { colors } = useThemeStore();
  const videos = useUserStore((s) => s.videos);
  const removeVideo = useUserStore((s) => s.removeVideo);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeVideo(id) },
      ]
    );
  };

  return (
    <Page style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>  
      <CustomText style={{alignSelf: 'center'}} fontSize="large" bold opacity={0.75}>Videos Library</CustomText>
      <View style={[styles.card,{backgroundColor: colors.card, borderColor: colors.border}]}> 
        {videos.length === 0 ? (
          <CustomText opacity={0.3}>No videos yet - add some!</CustomText>
        ) : (
          <ScrollView style={{ width: '100%' }}>
            {videos.map((video) => (
              <VideoPreview
                key={video.id}
                title={video.title}
                xp={video.xp_awarded}
                thumbnailUrl={video.thumbnailUrl}
                onDelete={() => handleDelete(video.id)}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { 
    width: '100%', 
    borderRadius: 20, 
    paddingVertical: 20, 
    paddingHorizontal: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 1, 
    alignSelf: 'center', 
    marginTop: 10,
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
}); 