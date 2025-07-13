import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import CustomIcon from './CustomIcon';
import CustomText from './CustomText';

interface VideoPreviewProps {
  title: string;
  xp: number;
  onDelete: () => void;
  thumbnailUrl?: string;
}

const VideoPreview = ({ title, xp, onDelete, thumbnailUrl }: VideoPreviewProps) => {
  const { colors } = useThemeStore();
  return (
    <View style={[styles.card,{backgroundColor: colors.primary, borderColor: colors.border}]}>
            <View style={styles.thumbWrap}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={styles.thumb} />
        )}
      </View>
      <CustomText style={{marginTop: 5}} opposite fontSize="small" numberOfLines={2} >{title}</CustomText>
      <View style={styles.bottomRow}>
        <CustomText  bold opposite >{xp} XP</CustomText>
        <CustomIcon onPress={onDelete} name="delete"  opposite size={20} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    alignSelf: 'center',
  },
  thumbWrap: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumb: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  deleteBtn: {
    backgroundColor: '#F44336',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  xpBadge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 8,
    minWidth: 48,
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 5
  },
});

export default VideoPreview;