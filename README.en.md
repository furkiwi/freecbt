# freecbt

An open-source self-help tool based on **Cognitive Behavioral Therapy (CBT)**.

FreeCBT provides a Thought Record workflow that helps users record situations, emotions, automatic thoughts, and cognitive distortions, then examine evidence, reconsider the original thought, and develop a more balanced alternative thought.

> **Note**
>
> FreeCBT is a self-help tool. It is not a medical or psychotherapy service and does not replace a psychologist, psychiatrist, or other professional support.

**Languages:** [繁體中文](./README.md)

## ✨ Features

### 📝 Thought Record

Two Thought Record modes are available:

- **Simple mode**: Starts with the automatic thought and provides a faster way to complete the core Thought Record.
- **Full mode**: Starts with the situation and emotions, and records details such as emotional intensity, belief strength, and post-record emotional intensity.

Full mode includes:

1. **Situation / Emotion** — Record what happened, along with the emotions and their intensity
2. **Automatic Thought** — Record the automatic thought and belief strength
3. **Cognitive Distortions** — Identify possible cognitive distortions
4. **Evidence** — Examine evidence supporting and contradicting the original thought
5. **Alternative Thought** — Develop a more balanced alternative thought and reassess belief and emotion

### 🔄 Switching Between Simple and Full Modes

Switching modes preserves the closest corresponding step whenever possible:

- Simple → Full maps the automatic thought to the beginning of the Full mode flow
- Challenge ↔ Evidence are mapped automatically
- Full → Simple maps Full-mode-only situation and evidence content to the corresponding Simple mode steps

This means users do not need to restart the entire record when changing modes.

### 💾 Thought Record Drafts

An unfinished Thought Record is continuously saved as a draft.

Users can leave the form, enter the App Lock screen, unlock the app, and continue editing without having to start over.

### 🔐 App Lock

The app provides PIN-based App Lock:

- Four-digit PIN
- PINs are stored as salted hashes rather than plaintext
- One-time migration from the legacy plaintext PIN format
- PIN hashes are stored with `SecureStore` on supported platforms
- App Lock can protect unfinished Thought Records

### 👆 Biometric Unlock

The app supports biometric authentication provided by the device, including:

- Face and fingerprint authentication on iOS
- Supported biometric authentication methods on Android

When biometric unlock is enabled, the Lock Screen attempts authentication when the app returns to the foreground. If authentication fails or is unavailable, the user can still unlock with the PIN.

Biometric prompts are not started while the app is in the background. Foreground/background transitions also handle authentication cancellation and retry behavior.

### 🌏 Traditional Chinese

A Traditional Chinese interface is available, with ongoing improvements to Thought Record, emotion intensity, and App Lock translations.

### 🧪 Tests

The project includes unit tests covering areas such as:

- Initial steps for Simple and Full Thought Records
- Page mapping when switching between modes
- App Lock and draft-related behavior

---

## 📱 Supported Platforms

The project is built with **Expo and React Native** and is currently configured for:

- Android
- iOS
- Web

Native features such as biometric authentication and `SecureStore` primarily apply to Android and iOS. Web uses the corresponding fallback behavior.

---

## 🛠️ Development

### Requirements

Recommended:

- Node.js
- npm
- Expo SDK 54
- React Native 0.81
- TypeScript 5.9

### Installation

Clone the repository and install dependencies:

~~~bash
git clone https://github.com/furkiwi/freecbt.git
cd freecbt
npm install
~~~

### Start the development environment

Enter the application directory:

~~~bash
cd expo54
npx expo start
~~~

You can then choose:

- Android Emulator
- iOS Simulator
- Expo Go, depending on feature and native-module requirements
- Web

You can also use the platform-specific commands:

~~~bash
npx expo start --android
npx expo start --ios
npx expo start --web
~~~

### Run tests

~~~bash
cd expo54
npm test
~~~

Or:

~~~bash
npm run test:watch
~~~

### Lint

~~~bash
cd expo54
npm run lint
~~~

---

## 🧭 Project Structure

The main application is under `expo54/`:

~~~text
freecbt/
├── expo54/
│   ├── app/                  # Application routes
│   ├── src/
│   │   └── legacy/
│   │       ├── form/         # Thought Record forms
│   │       ├── screen/       # Application screens
│   │       ├── lockstore.ts  # PIN / biometric state
│   │       └── ...
│   ├── app.config.ts
│   └── package.json
├── www/
├── package.json
└── LICENSE
~~~

The main Thought Record flow is located in:

~~~text
expo54/src/legacy/form/
├── FormView.tsx
├── record-slides.ts
├── IntensityPicker.tsx
├── AutomaticThought.tsx
├── AlternativeThought.tsx
├── Challenge.tsx
└── Distortions.tsx
~~~

`record-slides.ts` defines the Simple and Full mode steps and the page mapping used when switching between modes.

---

## 🔒 Data and Privacy

FreeCBT's App Lock is designed around local storage:

- Thought Record drafts are stored on the device
- PINs are not primarily stored as plaintext
- Supported native platforms use `SecureStore` for PIN hashes
- Biometric authentication is provided by the operating system

Please note: **App Lock is not a complete data-encryption solution.** If the device itself is compromised, has elevated privileges obtained, or another highly privileged process gains access to device data, absolute data security cannot be guaranteed.

---

## 🌱 Project History

This project continues development from an existing open-source lineage:

~~~text
Flaque/quirk
    ↓
erosson/freecbt
    ↓
furkiwi/freecbt
~~~

Upstream project:

https://github.com/erosson/freecbt

This project:

https://github.com/furkiwi/freecbt

---

## 🔀 Development Focus

Current development areas include:

- Simple and Full Thought Record modes
- Form drafts and state persistence
- App Lock and unlock
- PIN hashing and `SecureStore`
- Face authentication, fingerprint authentication, and Android biometrics
- Traditional Chinese translation
- Emotion and belief intensity pickers
- Form interaction and navigation flow
- Unit tests and code cleanup

---

## 🤝 Contributing

Contributions are welcome:

- Report bugs
- Suggest features
- Improve the Traditional Chinese translation
- Add tests
- Submit pull requests

When changing the Thought Record flow, it is recommended to check:

1. The flow definitions in `record-slides.ts`
2. The UI and fields in `FormView.tsx`
3. Draft and state management in `FormScreen.tsx`
4. Simple / Full mode switching behavior
5. Related unit tests

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

See [LICENSE](./LICENSE) for the full license text.
