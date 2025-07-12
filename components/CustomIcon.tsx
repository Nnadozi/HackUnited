import { useThemeStore } from '@/stores/themeStore';
import { Icon } from '@rneui/base';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

interface CustomIconProps {
  name: string;
  type?: 'antdesign' | 'entypo' | 'evilicon' | 'feather' | 'font-awesome' | 'font-awesome-5' | 'fontisto' | 'foundation' | 'ionicon' | 'material' | 'material-community' | 'octicon' | 'simple-line-icon' | 'zocial';
  size?: number;
  color?: string;
  style?: ViewStyle;
  onPress?: () => void;
  primary?: boolean;
  opposite?: boolean;
}

const CustomIcon = ({ color, size = 30, name, type, onPress, style, primary, opposite }: CustomIconProps) => {
  const {colors} = useThemeStore();
  return (
    <Icon
      color={color ? color : primary ? colors.primary : opposite ? colors.background : colors.text}
      name={name}
      type={type}
      size={size} 
      onPress={onPress}
      containerStyle={style}
    />
  );
};

export default CustomIcon;
const styles = StyleSheet.create({});