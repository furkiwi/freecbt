import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: "FreeCBT",
  slug: "freecbt",
  version: "2.5.0-rc.2",
  owner: "furkiwi",
  githubUrl: "https://github.com/furkiwi/freecbt",
  platforms: ["android", "ios", "web"],
  orientation: "portrait",
  icon: "./assets/ios.png",
  scheme: "freecbt",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  primaryColor: "#F8A5C2",
  ios: {
    bundleIdentifier: "org.furkiwi.freecbt",
    supportsTablet: true,
    icon: "./assets/ios.png",
    // apple doesn't like my prerelease version tag ("2.5.0-rc.1"). remove this apple-specific override once we're done with prerelease versions.
    version: "2.5.0",
    config: {
      // this silences a warning during `eas build -p ios`:
      // `app.config.ts is missing ios.infoPlist.ITSAppUsesNonExemptEncryption boolean. Manual configuration is required in App Store Connect before the app can be tested.`
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      NSFaceIDUsageDescription:
        "Unlock FreeCBT with Face ID so you can return to a thought without typing your PIN.",
    },
  },
  android: {
    package: "org.erosson.freecbt",
    permissions: [],
    blockedPermissions: [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
    ],
    icon: "./assets/android.png",
    adaptiveIcon: {
      foregroundImage: "./assets/android-adaptive.png",
      backgroundColor: "#FFFFFF",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/ios.png",
  },
  notification: {
    icon: "./assets/quirk-bw.png",
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/7845bb40-8f27-47c5-a347-ab468c88e6ab",
  },
  extra: {
    eas: {
      projectId: "7845bb40-8f27-47c5-a347-ab468c88e6ab",
    },
  },
  runtimeVersion: {
    policy: "sdkVersion",
  },
  plugins: [
    "expo-router",
    "expo-localization",
    [
      "expo-splash-screen",
      {
        image: "./assets/android.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#F8A5C2",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-web-browser",
    "expo-secure-store",
    [
      "expo-local-authentication",
      {
        faceIDPermission:
          "Unlock FreeCBT with Face ID so you can return to a thought without typing your PIN.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
    baseUrl: "/webapp",
  },
});
