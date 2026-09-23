# freecbt

一個以認知行為治療（CBT, Cognitive Behavioral Therapy）為核心的開源自助工具。

本專案 fork 自 [`erosson/freecbt`](https://github.com/erosson/freecbt)，並在原始專案的基礎上進行功能調整與開發。

## ✨ 專案特色

除了保留原始 freecbt 的核心功能之外，本專案目前也包含以下修改：

* 🔐 **App Lock**

  * 支援應用程式鎖定功能
  * 解鎖後可以繼續原本尚未完成的內容

* 📝 **表單狀態保存**

  * 在填寫 CBT Thought Record 的過程中，即使 App 被鎖定，也能保留目前正在編輯的內容
  * 解鎖後可以繼續編輯，而不需要重新開始

* 💭 **Thought Draft**

  * 保存尚未完成的 Thought Record
  * 避免因 App Lock 或其他操作造成輸入內容遺失

* 🌏 **繁體中文支援**

  * 加入 Traditional Chinese（繁體中文）介面翻譯
  * 持續改善中文介面的使用體驗

* 🧪 **測試**

  * 為部分新增功能加入單元測試
  * 包含 lock state、thought draft 等功能

## 📱 CBT Thought Record

本專案主要提供 Thought Record（思考紀錄）工具，協助使用者記錄：

1. 發生了什麼事情
2. 當下產生了哪些想法
3. 當時的情緒與強度
4. 對想法進行重新檢視
5. 建立較平衡的替代想法

這是一個自助工具，不能取代心理師、醫師或其他專業心理健康服務。

## 🛠️ 開發

本專案使用 Expo / React Native 進行開發。

### 安裝

```bash
git clone https://github.com/furkiwi/freecbt.git
cd freecbt
npm install
```

### 啟動開發環境

```bash
npx expo start
```

接著可以使用 Expo Go、Android Emulator 或 iOS Simulator 進行測試。

## 📂 專案來源

本專案的 Git 歷史來源：

```text
Flaque/quirk
      ↓
erosson/freecbt
      ↓
furkiwi/freecbt
```

原始專案：

https://github.com/erosson/freecbt

本專案：

https://github.com/furkiwi/freecbt

## 🔀 本專案的修改

目前相較於 upstream，主要開發方向包含：

* App Lock / Unlock 行為調整
* Lock 狀態下保留表單內容
* Thought Draft 儲存
* CBT 表單狀態管理
* Traditional Chinese（繁體中文）翻譯
* Intensity Picker
* Thought Record Mode
* 相關測試與程式碼整理

## 🤝 貢獻

如果你發現 Bug、想改善翻譯，或有新的功能想法，歡迎建立 Issue 或 Pull Request。

## 📄 License

本專案的授權方式請參考原始專案及 repository 中的 LICENSE 文件。
