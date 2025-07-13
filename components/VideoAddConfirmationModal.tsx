import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import CustomButton from './CustomButton';
import CustomText from './CustomText';

interface VideoAddConfirmationModalProps {
  visible: boolean;
  xpGiven: number | null;
  xpReason: string;
  onClose: () => void;
}

const XP_COLORS = ['#F44336', '#FF9800', '#FFEB3B', '#20B2AA'];

const VideoAddConfirmationModal = ({ visible, xpGiven, xpReason, onClose }: VideoAddConfirmationModalProps) => {
  const { colors } = useThemeStore();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent,{backgroundColor: colors.card, borderColor: colors.border}]}> 
          <CustomText opacity={0.75} fontSize="large" bold>Video Added</CustomText>
          {/* XP Scale */}
          <View style={styles.xpScaleRow}>
            {[1,2,3,4].map((num, idx) => (
              <View
                key={num}
                style={[
                  styles.xpCircle,
                  { backgroundColor: XP_COLORS[idx], borderColor: num === xpGiven ? colors.primary : 'transparent', borderWidth: num === xpGiven ? 3 : 0 },
                ]}
              >
                <CustomText fontSize="small" bold style={{ color: num === 3 ? '#222' : '#fff' }}>{num}</CustomText>
              </View>
            ))}
          </View>
          <CustomText primary textAlign='center' style={{marginTop: 2, marginBottom: 2}} fontSize="small" opacity={0.7}>
            1 = most brainrot, 4 = highest quality
          </CustomText>
          {xpGiven !== null && (
            <CustomText bold primary fontSize='small'>XP Awarded: {xpGiven}</CustomText>
          )}
          {xpReason && (
            <CustomText textAlign='center' style={{marginTop: 5}} fontSize="small" opacity={0.8}>{xpReason}</CustomText>
          )}
          <CustomButton title="Close" onPress={onClose} style={{marginTop: 12}} />
        </View>   
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { borderRadius: 20, padding: 24, alignItems: 'center', width: 280, borderWidth: 1 },
  modalBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10, minWidth: 80, alignItems: 'center' },
  xpScaleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, marginBottom: 2 },
  xpCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoAddConfirmationModal; 