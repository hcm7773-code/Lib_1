# 📚 世界童書數位圖書館 (World Children's Digital Library)

專為各國孩童與親子共讀打造的多語言數位繪本圖書館，提供智慧語音朗讀、雙語對照、生字學習、AI 故事伴讀問答與繪本創作工坊。

---

## 🚀 部署至 GitHub Pages (自動化部署)

本專案已配置 **GitHub Actions 自動化工作流程 (`.github/workflows/deploy.yml`)**，每次推送程式碼至 `main` 或 `master` 分支時，將自動建置並發布靜態網頁至 GitHub Pages。

### 📌 啟用 GitHub Pages 步驟：

1. **推送程式碼至 GitHub 倉庫**：
   ```bash
   git init
   git add .
   git commit -m "feat: 初次提交世界童書數位圖書館"
   git branch -M main
   git remote add origin https://github.com/<你的GitHub帳號>/<你的倉庫名稱>.git
   git push -u origin main
   ```

2. **在 GitHub 倉庫中啟用 Pages**：
   - 進入你的 GitHub 專案頁面，點選上方 **`Settings` (設定)**。
   - 點選左側選單的 **`Pages`**。
   - 在 **`Build and deployment` -> `Source`** 下拉選單中，選擇 **`GitHub Actions`**。

3. **自動部署完成**：
   - 點選上方 **`Actions`** 分頁即可查看自動部署進度。
   - 部署完成後，GitHub 會提供專屬的網址（例如：`https://<username>.github.io/<repo-name>/`），點開即可順暢使用！

---

## 🛠️ 本地開發與建置指令

```bash
# 安裝依賴套件
npm install

# 啟動本地開發伺服器 (Port 3000)
npm run dev

# 靜態打包 (GitHub Pages 適用)
npm run build:pages

# 完整打包 (包含後端服務)
npm run build
```

---

## ✨ 核心特色與技術

- 🌐 **多語言雙語對照**：支援繁體中文、英文、日文、法文、德文、西班牙文、韓文與越南文。
- 🎙️ **語音朗讀與生字卡**：點擊重點單字即時發音、注音拼音與釋義。
- 🤖 **AI 伴讀精靈**：智慧引導提問，啟發孩童思考。
- 🎨 **繪本創作工坊**：自由創作專屬繪本並生成朗讀。
- 🏆 **每日閱讀目標與成就貼紙**：動態貼紙收集、7日完成趨勢圖與徽章榮譽牆。
- 📱 **PWA 支援**：支援離線快取與響應式行動裝置佈局。
