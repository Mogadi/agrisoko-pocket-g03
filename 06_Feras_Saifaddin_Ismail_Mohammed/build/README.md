# Android APK

`AgriSokoPocket_G03.apk` is the local release build from 23 October 2026.

Package: `rw.ines.agrisoko.pocket.g03`  
Version: 1.0.0 (versionCode 1)  
ABIs: `arm64-v8a`, `armeabi-v7a`  
Signed with the Android debug certificate, so it installs for testing. It is not a Play Store upload key.

Built from `mobile/android` after `npx expo prebuild --platform android`:

```bash
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a
```

An EAS preview build is the alternative when an Expo account is available:

```bash
npx eas-cli build -p android --profile preview
```
