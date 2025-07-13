import { useThemeStore } from '@/stores/themeStore';
import { DimensionValue, KeyboardTypeOptions, StyleSheet, TextInput, TextStyle } from 'react-native';

interface CustomInputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    style?: TextStyle;
    width?: DimensionValue;
    maxLength?: number;
    keyboardType?: KeyboardTypeOptions;
    multiline?: boolean;
    numberOfLines?: number;
    onSubmitEditing?: () => void;
    returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
    editable?: boolean;
    textAlign?: 'left' | 'right' | 'center';
    secureTextEntry?: boolean;
    placeholderTextColor?: string;
}

const CustomInput = ({placeholder, value, onChangeText, style, width, maxLength, keyboardType, multiline, numberOfLines, onSubmitEditing, returnKeyType, editable, textAlign, secureTextEntry, placeholderTextColor}:CustomInputProps) => {
  const {colors} = useThemeStore();
  return (
    <TextInput
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    style={[styles.input, style, 
      { width: width || '100%' },
      {color: colors.text},
      {borderColor: colors.border},
      {backgroundColor: colors.background}
    ]}
    placeholderTextColor={placeholderTextColor || colors.text + '60'}
    maxLength={maxLength}
    keyboardType={keyboardType}
    multiline={multiline}
    numberOfLines={numberOfLines}
    onSubmitEditing={onSubmitEditing}
    returnKeyType={returnKeyType}
    editable={editable}
    textAlign={textAlign}
    secureTextEntry={secureTextEntry}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
});

export default CustomInput;