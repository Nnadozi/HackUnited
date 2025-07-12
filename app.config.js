const IS_DEV = process.env.APP_VARIANT === 'development';

import appJson from './app.json';

export default {
  ...appJson,
  expo: {
    ...appJson.expo,
    name: IS_DEV ? 'Clarity (Dev)' : 'Clarity',
    plugins: [
      ...(appJson.expo?.plugins || []),
      'expo-secure-store',
      'expo-apple-authentication',
      'expo-web-browser'
    ],
    android: {
      package: IS_DEV ? 'com.nnadozi.clarity.dev' : 'com.nnadozi.clarity',
    },
    ios: {
      bundleIdentifier: IS_DEV ? 'com.nnadozi.clarity.dev' : 'com.nnadozi.clarity',
    },
    extra: {
      ...appJson.expo?.extra,
      router: {}
    }
  }
}; 