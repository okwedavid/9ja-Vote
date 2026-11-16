# Shipping the 9ja Vote mobile app

The Flutter source in `apps/mobile` is complete for the demonstration scope but has **never been compiled**
(the build sandbox had no Flutter SDK). Treat the first local build as a debugging session, not a formality.

> **Before any store submission:** the legal checklist must be signed off, the store listing must say
> "demonstration, not affiliated with INEC", and the app must contain no real voter or party data.

---

## 1. One-time setup

```bash
# Flutter 3.27+ stable and Android Studio with the Flutter/Dart plugins
flutter doctor                     # resolve every red item
cd apps/mobile
flutter create . --platforms android,ios --project-name nine_ja_vote --org ng.ninejavote
flutter pub get
flutter analyze
flutter test
flutter run
```

`flutter create .` only fills in the generated `android/` and `ios/` folders; it must not overwrite `lib/`.
Commit the generated platform folders once you are happy with them (they are currently not committed).

**Bundle identifier:** `ng.ninejavote.nine_ja_vote` (from `--org ng.ninejavote` plus the project name).
Change it now if you own a different domain — changing it after release means a new store listing.

---

## 2. Versioning

`apps/mobile/pubspec.yaml`:

```yaml
version: 1.0.0+1     # <semver>+<build number>
```

Every upload to Google Play or App Store Connect needs a **higher build number**, even for internal testing.
Tag the repository to match (`v1.0.0`).

---

## 3. Android release build

### 3.1 Create an upload keystore (once, then back it up twice)

```bash
keytool -genkey -v \
  -keystore ~/keys/ninejavote-upload.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload
```

Losing this file or its password means you can never update the app under the same listing. Store it in a
password manager and an encrypted offline backup. **Never commit it.**

### 3.2 Wire signing into Gradle

`apps/mobile/android/key.properties` (git-ignored, never committed):

```properties
storePassword=…
keyPassword=…
keyAlias=upload
storeFile=/absolute/path/to/ninejavote-upload.jks
```

`apps/mobile/android/app/build.gradle.kts` — load the file and use it for `release`:

```kotlin
import java.util.Properties
import java.io.FileInputStream

val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["keyPassword"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["storePassword"] as String
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true
            isShrinkResources = true
        }
    }
}
```

Add to `.gitignore`: `android/key.properties`, `**/*.jks`, `**/*.keystore`.

### 3.3 Build

```bash
flutter build appbundle --release       # build/app/outputs/bundle/release/app-release.aab  ← upload this
flutter build apk --release             # build/app/outputs/flutter-apk/app-release.apk    ← sideload/test only
```

Play requires an **AAB**, not an APK. Use Play App Signing (recommended): upload the AAB, let Google hold the
app signing key, keep the upload keystore for your own uploads.

---

## 4. Google Play submission

1. Play Console → **Create app** → name "9ja Vote (Demonstration)", category *Government* or *Education*,
   free, no ads.
2. **App content** declarations:
   - *Not a government app.* Say plainly: independent project, not affiliated with INEC.
   - Data safety: **no data collected, no data shared**. This build has no accounts, analytics or ads.
   - No ads; no in-app purchases.
   - Content rating questionnaire: no user-generated content, no voting functionality.
   - Target audience: 18+ (civic information), not directed at children.
3. **Store listing**: short description, full description, at least 2 phone screenshots, a 512×512 icon, and a
   1024×500 feature graphic. Every screenshot must show the demonstration banner.
4. **Testing track first** — internal testing (up to 100 testers), then closed testing, then production.
   Google requires a closed test with real testers before production for new personal accounts.
5. Review usually takes a few days. Expect questions about election content; answer with the disclaimer text.

Suggested short description:

> Civic information for Nigerian elections. Demonstration only — not an INEC app and not a voting app.

---

## 5. iOS (needs a Mac with Xcode)

```bash
cd apps/mobile
flutter build ios --release            # then archive in Xcode
open ios/Runner.xcworkspace
```

1. Set the bundle identifier `ng.ninejavote.nineJaVote` (no underscores allowed in iOS bundle IDs).
2. Signing & Capabilities → your team, automatic signing.
3. Xcode → Product → Archive → Distribute App → App Store Connect.
4. App Store Connect: create the app record, fill **App Privacy** ("Data Not Collected"), and answer the
   export-compliance question (the app uses no custom encryption).
5. TestFlight first, then submit for review. Election-related apps get extra scrutiny — keep the disclaimer
   in the first screenshot and in the description.

---

## 6. Signing, secrets and compliance

- No API keys, tokens or provider credentials belong in the mobile app. Anyone can extract them from a binary.
- The app currently reads only bundled demo content, so it needs no network permission at all. Keep it that
  way until an API integration is designed with certificate pinning considered.
- Remove `REAL_VOTING_ENABLED` style flags from the mobile app entirely — the mobile app has no voting feature.
- Keep the `DemoBanner` on every screen (`apps/mobile/lib/widgets/demo_banner.dart`).
- The emblem is provisional and is not the Nigerian Coat of Arms. Do not add it without written permission.

---

## 7. Release checklist

- [ ] `flutter analyze` clean, `flutter test` passing
- [ ] Version and build number bumped in `pubspec.yaml`
- [ ] Release build signed, installed on a real low-end Android device, tested on a slow network
- [ ] TalkBack pass on the home screen and one module screen
- [ ] Large-text mode and reduced motion checked
- [ ] No secrets in the repo or the binary (`grep -r "sk_\|apiKey" android ios lib`)
- [ ] Legal sign-off recorded in `docs/legal/approval-checklist.md`
- [ ] Screenshots show the demonstration banner
- [ ] Store listing states "not affiliated with INEC" and "no voting"
- [ ] Crash reporting decision made (none today — do not add analytics silently)
