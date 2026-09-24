# freecbt

一個以 **認知行為治療（CBT, Cognitive Behavioral Therapy）** 為核心的開源自助工具。

FreeCBT 提供 Thought Record（思考紀錄）流程，讓使用者把事件、情緒、自動化想法與認知扭曲具體記錄下來，再進一步檢視證據、挑戰原本的想法，並整理出較平衡的替代想法。

> **注意**
>
> FreeCBT 是自助工具，不是醫療或心理治療服務，不能取代心理師、精神科醫師或其他專業協助。

## ✨ 目前功能

### 📝 Thought Record

支援兩種 Thought Record 模式：

- **Simple mode**：從 Automatic Thought 開始，快速完成核心思考紀錄。
- **Full mode**：完整記錄從 Situation / Emotion 開始的流程，並包含情緒強度、信念強度與事後情緒強度等欄位。

Full mode 的流程包含：

1. **Situation / Emotion** — 發生了什麼，以及當下的情緒與強度
2. **Automatic Thought** — 當下浮現的自動化想法與信念強度
3. **Cognitive Distortions** — 辨識可能存在的認知扭曲
4. **Evidence** — 檢視支持與反對原本想法的證據
5. **Alternative Thought** — 建立較平衡的替代想法，並重新評估信念與情緒

### 🔄 Simple / Full 模式切換

切換模式時會盡量保留目前所在的等價步驟：

- Simple → Full：Automatic Thought 會對應到 Full mode 的開頭 Situation / Emotion
- Challenge ↔ Evidence 會自動對應
- Full → Simple：Full mode 專有的 Situation、Evidence 會映射回 Simple mode 的對應步驟

因此切換模式不需要重新開始整份紀錄。

### 💾 Thought Draft

填寫中的 Thought Record 會持續保存為 draft。

即使尚未完成整份紀錄，也可以離開表單、進入 App Lock，再解鎖後繼續編輯，降低輸入內容遺失的風險。

### 🔐 App Lock

提供 PIN App Lock：

- 4 位數 PIN
- PIN 以 salted hash 儲存，而不是直接保存明碼
- 支援從舊版 plaintext PIN 進行一次性 migration
- 在支援的平台上使用 SecureStore 保存 PIN hash
- App Lock 啟用後可保護尚未完成的 Thought Record

### 👆 生物辨識解鎖

支援裝置上的生物辨識功能，例如：

- iOS Face ID / Touch ID
- Android 支援的生物辨識方式

當使用者啟用 biometric unlock 後，Lock Screen 會在 App 回到前景時嘗試啟動驗證；如果驗證失敗或不可用，仍可使用 PIN 解鎖。

同時會避免在 App 位於背景時啟動 biometric prompt，並處理 App foreground / background 切換時的驗證取消與重新嘗試。

### 🌏 繁體中文

目前包含 Traditional Chinese（繁體中文）介面，並持續改善 CBT 表單、情緒強度與 App Lock 相關文字。

### 🧪 測試

目前包含 Jest 單元測試，涵蓋例如：

- Simple / Full Thought Record 的起始步驟
- Simple / Full 模式切換時的頁面映射
- App Lock / draft 等相關功能

---

## 📱 支援平台

專案使用 **Expo + React Native** 開發，目前設定的平台為：

- Android
- iOS
- Web

其中生物辨識與 SecureStore 等原生功能主要適用於 Android / iOS；Web 會使用對應的 fallback 行為。

---

## 🛠️ 開發環境

### Requirements

建議使用：

- Node.js
- npm
- Expo SDK 54
- React Native 0.81
- TypeScript 5.9

### 安裝

Clone repository：

~~~bash
git clone https://github.com/furkiwi/freecbt.git
cd freecbt
npm install
~~~

### 啟動 Expo

進入 Expo app：

~~~bash
cd expo54
npx expo start
~~~

接著可以選擇：

- Android Emulator
- iOS Simulator
- Expo Go（視功能與原生模組需求而定）
- Web

也可以直接使用 Expo 的平台指令：

~~~bash
npx expo start --android
npx expo start --ios
npx expo start --web
~~~

### 執行測試

~~~bash
cd expo54
npm test
~~~

或：

~~~bash
npm run test:watch
~~~

### Lint

~~~bash
cd expo54
npm run lint
~~~

---

## 🧭 專案結構

主要 App 位於 expo54/：

~~~text
freecbt/
├── expo54/
│   ├── app/                  # Expo Router routes
│   ├── src/
│   │   └── legacy/
│   │       ├── form/         # Thought Record 表單
│   │       ├── screen/       # App screens
│   │       ├── lockstore.ts  # PIN / biometric 狀態
│   │       └── ...
│   ├── app.config.ts
│   └── package.json
├── www/
├── package.json
└── LICENSE
~~~

Thought Record 的主要流程集中在：

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

其中 record-slides.ts 負責定義 Simple / Full mode 的步驟與模式切換時的頁面映射。

---

## 🔒 資料與隱私

FreeCBT 的 App Lock 設計以「本機保存」為核心：

- Thought Record draft 儲存在裝置端
- PIN 不以明碼作為主要儲存格式
- 可用的原生平台會使用 Expo SecureStore 保存 PIN hash
- 生物辨識驗證由作業系統提供

請注意：**App Lock 不等同於完整的資料加密方案。** 如果裝置本身遭到入侵、root / jailbreak，或其他具有高權限的程式取得裝置資料，不能保證資料絕對安全。

---

## 🌱 專案來源

本專案是在既有 freecbt 專案基礎上持續開發的 fork：

~~~text
Flaque/quirk
    ↓
erosson/freecbt
    ↓
furkiwi/freecbt
~~~

Upstream：

https://github.com/erosson/freecbt

本專案：

https://github.com/furkiwi/freecbt

---

## 🔀 開發方向

目前主要開發方向包括：

- Thought Record 的 Simple / Full mode
- 表單 draft 與狀態保存
- App Lock / Unlock
- PIN hash 與 SecureStore
- Face ID / Touch ID / Android biometrics
- 繁體中文翻譯
- Emotion / Belief intensity picker
- 表單 UX 與滑動流程
- 單元測試與程式碼整理

---

## 🤝 貢獻

歡迎：

- 回報 Bug
- 提出功能建議
- 改善繁體中文翻譯
- 補充測試
- 提交 Pull Request

如果要修改 Thought Record 流程，建議同步檢查：

1. record-slides.ts 的流程定義
2. FormView.tsx 的 UI 與欄位
3. FormScreen.tsx 的 draft / state 管理
4. Simple / Full mode 切換行為
5. 對應的 Jest tests

---

## 📄 License

本專案採用 **GNU General Public License v3.0（GPL-3.0）**。

完整授權條款請參考 repository 中的 [LICENSE](./LICENSE)。
