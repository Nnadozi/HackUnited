import { ButtonGroup } from '@rneui/themed';
import React from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import CustomButton from './CustomButton';
import CustomIcon from './CustomIcon';
import CustomText from './CustomText';

const THEME_MODES = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

type ThemeMode = 'light' | 'dark' | 'system';

export default function SettingsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const mode = useThemeStore((s: any) => s.mode);
  const colors = useThemeStore((s: any) => s.colors);
  const setThemeMode = useThemeStore((s: any) => s.setThemeMode);

  const selectedIndex = THEME_MODES.findIndex(theme => theme.value === mode);

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'Are you sure you want to delete your account? This action is irreversible.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await useUserStore.getState().deleteAccount();
          setThemeMode('system');
          onClose();
        } catch (error) {
          console.error('Error deleting account:', error);
          onClose();
        }
      } },
    ]);
  };

  const handleThemeChange = (selectedIndex: number) => {
    const selectedTheme = THEME_MODES[selectedIndex];
    setThemeMode(selectedTheme.value as ThemeMode);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>  
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <CustomIcon name="x" type="feather" size={24} color={colors.text} />
          </Pressable>
          <CustomText style={{alignSelf: 'center', marginBottom: 20}} textAlign="center" fontSize="large" bold >Settings</CustomText>
          <View style={{width: '100%',marginBottom: 15}}>
            <View style={styles.headrRow}>
              <CustomIcon primary name="sun" type='feather' size={25} />
              <CustomText bold primary fontSize="normal">Appearance</CustomText>
            </View>
            <ButtonGroup
              buttons={THEME_MODES.map(theme => theme.label)}
              selectedIndex={selectedIndex}
              onPress={handleThemeChange}
              containerStyle={[styles.buttonGroupContainer, { backgroundColor: colors.card, borderWidth: 0, gap: 10 }]}
              buttonStyle={{ borderColor: colors.border, borderWidth: 1, borderRadius: 10, borderRightWidth: 1 }}
              selectedButtonStyle={{ backgroundColor: colors.primary }}
              innerBorderStyle={{ width: 0 }}
            />
          </View>
          <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15}}>
            <View style={styles.headrRow}>
              <CustomIcon primary name="versions" type='octicon' size={25} />
              <CustomText bold primary fontSize="normal">Version</CustomText>
            </View>
            <CustomText primary fontSize="normal">1.0.0</CustomText>
          </View>
          <CustomButton iconType="entypo" iconName="trash" width="80%" title="Delete Account" onPress={handleDeleteAccount} alignSelf="center"/>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    borderRadius: 32,
    padding: 28,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  buttonGroupContainer: {
    marginTop:15,
    overflow: 'hidden',
  },
  headrRow:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  }
}); 