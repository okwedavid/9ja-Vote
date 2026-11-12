# 9ja Vote mobile (Flutter)

Status: **source scaffold, not yet compiled.** The build sandbox had no Flutter SDK, so this code has
not been run through `flutter analyze` or `flutter test`. Expect to fix small issues on first run.

## Android Studio setup

1. Install Flutter 3.27 or newer (stable) and Android Studio with the Flutter and Dart plugins.
2. Run `flutter doctor` and resolve anything it flags (Android SDK, licences, an emulator).
3. Generate the platform folders once (they are intentionally not committed yet):

   ```bash
   cd apps/mobile
   flutter create . --platforms android,ios --project-name nine_ja_vote --org ng.ninejavote
   flutter pub get
   flutter analyze
   flutter test
   flutter run
   ```

4. In Android Studio choose **Open** and select `apps/mobile`.

iOS builds and signing need a Mac with Xcode.

## Notes

- `lib/widgets/demo_banner.dart` appears on every screen. Do not remove it.
- No secrets belong in this app. It will talk only to the public API over HTTPS.
- Device biometrics (planned, `local_auth`) will only unlock the app. They do not prove voter eligibility.
