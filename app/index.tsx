import { useThemeStore } from "@/stores/themeStore";
import CustomText from "@/components/CustomText";
import Page from "@/components/Page";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { useState } from "react";
import CustomIcon from "@/components/CustomIcon";
import { useTheme } from "@react-navigation/native";

export default function Index() {
  const { mode, setThemeMode, isDark} = useThemeStore();
  const {colors} = useTheme(); // USE THIS TO GET THE COLORS, NOT THE USERSTORE
  const [email, setEmail] = useState('');
  return (
    <Page>
      <CustomText>Custom Text Component {mode}</CustomText>
      <CustomButton
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
      />
      <CustomInput
        placeholder="Custom Input"
        value={email}
        onChangeText={setEmail}
      />
      <CustomIcon
        name="user"
        type="font-awesome"
        size={30}
      />
    </Page>
  );
}
