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
}

const CustomInput = ({placeholder, value, onChangeText, style, width, maxLength, keyboardType, multiline, numberOfLines, onSubmitEditing, returnKeyType, editable, textAlign}:CustomInputProps) => {
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
      {textAlign: textAlign || 'left'}
    ]}
    placeholderTextColor={"darkgray"}
    maxLength={maxLength ?? 100}
    cursorColor={colors.text}
    keyboardType={keyboardType}
    multiline={multiline}
    numberOfLines={multiline ? (numberOfLines || 3) : undefined}
    textAlignVertical={multiline ? "top" : "center"}
    onSubmitEditing={onSubmitEditing}
    returnKeyType={returnKeyType}
    editable={editable}
    />
  )
}

export default CustomInput

const styles = StyleSheet.create({
    input:{
        borderWidth: 1,
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
    }
})