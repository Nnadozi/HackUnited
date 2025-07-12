const IS_DEV = process.env.APP_VARIANT === 'development';

import appJson from './app.json';

export default {
  ...appJson,
  expo: {
    ...appJson.expo,
    name: IS_DEV ? 'hackapp (Dev)' : 'hackapp',
    extra: {
      ...appJson.expo?.extra,
      router: {}
    }
  }
}; 