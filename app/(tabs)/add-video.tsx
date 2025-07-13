import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import CustomText from '../../components/CustomText';
import Page from '../../components/Page';
import VideoAddConfirmationModal from '../../components/VideoAddConfirmationModal';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';

const key = process.env.EXPO_PUBLIC_OPENAI_KEY;

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function AddVideoScreen() {
  const { colors } = useThemeStore();
  const theme = colors;
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [title, setTitle] = useState('');
  const [xpGiven, setXpGiven] = useState<number | null>(null);
  const [xpReason, setXpReason] = useState<string>('');
  const addVideo = useUserStore((s) => s.addVideo);

  const youTubeId = getYouTubeId(url);
  const thumbnail = youTubeId ? `https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg` : undefined;

  // Optionally fetch the video title from YouTube oEmbed
  const fetchTitle = async (videoUrl: string) => {
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);
      if (!res.ok) return '';
      const data = await res.json();
      return data.title || '';
    } catch {
      return '';
    }
  };

  const handleUrlChange = async (val: string) => {
    setUrl(val);
    setError('');
    if (getYouTubeId(val)) {
      const fetchedTitle = await fetchTitle(val);
      setTitle(fetchedTitle);
    } else {
      setTitle('');
    }
  };

  const validateUrl = (val: string) => !!getYouTubeId(val);

  const handleAdd = async () => {
    if (!validateUrl(url)) {
      Alert.alert('Invalid URL', 'Please enter a valid YouTube URL.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Use OpenAI API to judge video quality (1-4 XP, 1=brainrot, 4=best)
      let xp_awarded = 2;
      let reason = '';
      if (key) {
        const prompt = `Rate the following YouTube video title for productivity and educational value. Reply ONLY with a JSON object: {"xp": 1-4, "reason": "..."} where 1 is most brainrot and 4 is most productive/educational. Title: ${title || url}`;
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a productivity assistant.' },
              { role: 'user', content: prompt },
            ],
            max_tokens: 60,
            temperature: 0.2,
          }),
        });
        const data = await response.json();
        let aiReply = data.choices?.[0]?.message?.content || '';
        try {
          // Try to parse JSON from AI reply
          const match = aiReply.match(/\{[\s\S]*\}/);
          if (match) aiReply = match[0];
          const parsed = JSON.parse(aiReply);
          if (typeof parsed.xp === 'number' && parsed.xp >= 1 && parsed.xp <= 4) xp_awarded = parsed.xp;
          if (typeof parsed.reason === 'string') reason = parsed.reason;
        } catch {
          reason = aiReply;
        }
      }
      addVideo({
        title: title || url,
        xp_awarded,
        url,
        thumbnailUrl: thumbnail,
      });
      setXpGiven(xp_awarded);
      setXpReason(reason);
      setUrl('');
      setTitle('');
      setSuccess(true);
    } catch (e) {
      Alert.alert('Failed to add video', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSuccess(false);
    setXpGiven(null);
    setXpReason('');
  };

  return (
    <Page style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>  
      <CustomText style={{alignSelf: 'center'}} fontSize="large" bold opacity={0.75}>Add Video</CustomText>
      <View style={[styles.card,{backgroundColor: colors.card, borderColor: colors.border}]}> 
        <CustomText opacity={0.5}  style={{marginBottom: 10, alignSelf: 'center'}}>Video Preview</CustomText>
        <View style={[styles.previewThumb,{backgroundColor: colors.border}]}> 
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={{ width: '100%', height: 100, borderRadius: 10 }} resizeMode="cover" />
          ) : (
            <CustomText fontSize="small" opacity={0.5}>Thumbnail</CustomText>
          )}
        </View>
        {title && (
          <CustomText primary fontSize='small' bold numberOfLines={2} textAlign='center' opacity={0.75}>{title || 'Video Title Here...'}</CustomText>
        )}
      </View>
      <CustomInput
        placeholder="Video URL"
        value={url}
        onChangeText={handleUrlChange}
        style={{marginTop: 15}}
      />
      <CustomButton
        title="Add"
        onPress={handleAdd}
        disabled={loading}
        isLoading={loading}
        style={{marginTop: 10}}
      />
      <CustomText primary bold fontSize="small" opacity={0.75} style={{marginTop: 10,marginLeft: 10}}>Let's see what you've got!</CustomText>
      <VideoAddConfirmationModal
        visible={success}
        xpGiven={xpGiven}
        xpReason={xpReason}
        onClose={closeModal}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  previewCard: { width: '90%', backgroundColor: '#2EC4F1', borderRadius: 16, padding: 20, marginTop: 8, alignItems: 'center' },
  videoThumb: { width: '100%', height: 100, borderRadius: 8, backgroundColor: '#fff', marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  videoTitle: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, width: '100%', marginTop: 8 },
  urlLabel: { marginTop: 32, marginBottom: 8, alignSelf: 'center' },
  urlInput: { width: '90%', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, marginBottom: 24 },
  addBtn: { width: '90%', backgroundColor: '#2EC4F1', borderRadius: 16, paddingVertical: 18, alignItems: 'center', position: 'absolute', bottom: 200, alignSelf: 'center' },
  card: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 20, 
    padding:15, 
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 2, 
    borderWidth: 1,
  },
  previewThumb: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', width: 280 },
  modalBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10, minWidth: 80, alignItems: 'center' },
}); 