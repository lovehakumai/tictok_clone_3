import { ConfigContext, ExpoConfig } from "expo/config";


const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  console.log("IS_DEV" , IS_DEV);
  console.log("IS_PREVIEW", IS_PREVIEW);
  
  if (IS_DEV) {
    console.log("getUniqueIdentifier / IS_DEV");
    return 'com.pogimasa.tictok.dev';
  }

  if (IS_PREVIEW) {
    return 'com.pogimasa.tictok.preview';
  }

  return 'com.pogimasa.tictok';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'tictok (Dev)';
  }
  if (IS_PREVIEW) {
    return 'tictok (Preview)';
  }
  return 'tictok: clone of tiktok';
};

export default ({config}: ConfigContext): ExpoConfig=>({
    ...config,
    "name": getAppName(),
    "slug": "tictok",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": getUniqueIdentifier(),
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": getUniqueIdentifier(),
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you share them with your friends."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
          "recordAudioAndroid": true
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "c2f30144-62d5-447f-94aa-9e54d110fda8"
      }
    },

    "updates": {
      "url": "https://u.expo.dev/c2f30144-62d5-447f-94aa-9e54d110fda8"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    },
    
    "owner": "masaharu_ura"
  })