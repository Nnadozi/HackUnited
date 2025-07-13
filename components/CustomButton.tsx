import { useTheme } from '@react-navigation/native';
import { Button } from '@rneui/base';
import { StyleSheet, ViewStyle } from 'react-native';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    disabled?: boolean;
    width?:any
    marginVertical?:any
    isLoading?: boolean;
    alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    iconName?: string;
    iconType?: string;
}

const CustomButton = ({title, onPress, style, disabled, width, marginVertical, isLoading, alignSelf = 'center', iconName, iconType}:CustomButtonProps) => {
  const {colors} = useTheme();
  return (
    <Button
    title={title}
    onPress={onPress}
    disabled={disabled}
    buttonStyle={[styles.con, style, 
      {width: width ? width : '100%', alignSelf: alignSelf},
      {marginVertical: marginVertical ? marginVertical : 0},
      {backgroundColor: colors.primary}
    ]}
    titleStyle={{fontFamily:'DMSans-Bold', fontSize:16, color: colors.background, textAlign:"center"}}
    containerStyle={{width: width ? width : '100%', alignSelf: alignSelf}}
    loading={isLoading}
    icon={iconName ? {
      name: iconName,
      type: iconType,
      size: 18,
      color: colors.background,
    } : undefined}
    />
  )
}

export default CustomButton

const styles = StyleSheet.create({
    con:{
        justifyContent:"center",
        alignItems:"center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius:20,
        backgroundColor:"black",
    }
})