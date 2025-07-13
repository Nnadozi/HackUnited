import { useTheme } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface PageProps {
  children:React.ReactNode
  style?: ViewStyle,
}

const Page = ({style, children}:PageProps) => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  return (  
    <SafeAreaView style={[styles.con, style, {
      paddingTop: insets.top * 0.5,
      paddingBottom: insets.bottom * 0.5,
      paddingLeft: insets.top * 0.5,
      paddingRight: insets.top * 0.5,
      backgroundColor: colors.background,
    }]}>
      {children}
    </SafeAreaView>
  )
}

export default Page

const styles = StyleSheet.create({
    con:{
        flex:1,
        backgroundColor:"white"
    }
})