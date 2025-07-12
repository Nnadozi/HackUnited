import { useThemeStore } from '@/stores/themeStore';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button } from '@rneui/base';
import { useTheme } from '@react-navigation/native';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    disabled?: boolean;
    width?:any
    marginVertical?:any
    isLoading?: boolean;
}

const CustomButton = ({title, onPress, style, disabled, width, marginVertical, isLoading}:CustomButtonProps) => {
  const {colors} = useTheme();
  return (
    <Button
    title={title}
    onPress={onPress}
    disabled={disabled}
    buttonStyle={[styles.con, style, 
      {width: width ? width : '100%', alignSelf:'center'},
      {marginVertical: marginVertical ? marginVertical : 0},
      {backgroundColor: colors.primary}
    ]}
    titleStyle={{fontFamily:'DMSans-Bold', fontSize:16, color: colors.background, textAlign:"center",width:"100%"}}
    containerStyle={{width: width ? width : '100%', alignSelf:'center'}}
    loading={isLoading}
    />
  )
}

export default CustomButton

const styles = StyleSheet.create({
    con:{
        justifyContent:"center",
        alignItems:"center",
        padding:10,
        borderRadius:100,
        backgroundColor:"black",
    }
})