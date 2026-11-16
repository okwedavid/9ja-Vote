# 9ja Vote mobile (Flutter)

Status: **source complete for the demo scope, not yet compiled.** The build sandbox had no Flutter SDK, so
this code has not been run through `flutter analyze` or `flutter test`. Expect to fix small issues on first run.
Release instructions (keystore, signing, Play/App Store) are in [`docs/mobile/shipping.md`](../../docs/mobile/shipping.md).

## Screens

| File | Screen |
|---|---|
| `lib/screens/welcome_screen.dart` | Welcome / entry |
| `lib/screens/home_screen.dart` | Home: 3D Aso Rock slideshow + eight module tiles |
| `lib/screens/education_screen.dart` | Voter education list + article detail |
| `lib/screens/elections_screen.dart` | Election calendar (marked unconfirmed) |
| `lib/screens/parties_screen.dart` | Fictional parties, candidates and manifesto pledges |
| `lib/screens/results_screen.dart` | National demonstration figures, no winner declared |
| `lib/screens/polling_units_screen.dart` | Synthetic polling-unit search |
| `lib/screens/settings_screen.dart` | Alerts, large text, languages, privacy and limits |

Content lives in `lib/data/demo_content.dart` and is bundled — the app makes no network calls and collects no
personal data. The identity-verification tile is deliberately inert: no biometric or identity data is ever
collected.

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
