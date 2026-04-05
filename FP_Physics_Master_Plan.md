# FP Physics (第一性原理物理實驗室) - 專案總體規劃書

**專案負責人:** Gregory Hong (BlueSoul2003) | UTM Physics
**核心目標:** 1. 打造一個高學術價值的互動物理引擎 (MIT 研究所申請 Portfolio)。
2. 透過開源軟體帶動實體 3D 列印教具的銷售 (硬體變現/被動收入)。
3. 建立個人教育科技品牌與 YouTube 頻道 (Gregory Physics)。

---

## ✅ Phase 0: 基礎建設與模組化 (已完成)
*我們已經成功運用「第一性原理」將複雜的系統解耦，打下了專業級的軟體架構。*

- [x] **高精度物理引擎 (`sim_pendulum.js`)**: 實作 RK4 (四階龍格-庫塔法) 演算法，確保大角度與能量守恆的準確性。
- [x] **全端模組化架構**: 將單一 HTML 拆解為 `app.js`, `core_rpg.js`, `core_inventory.js`, `tool_daq.js` 等高內聚模組。
- [x] **數據採集系統 (DAQ)**: 實作 60Hz 即時狀態監控，支援將動能、勢能等數據匯出為 CSV。
- [x] **遊戲化學習系統 (Gamification)**: 建立 EXP 等級系統與 LaTeX 方程式圖鑑收集系統。
- [x] **無痕多國語言支援 (Headless Translation)**: 整合 Google NMT，透過自訂下拉選單支援繁中、英文、馬來文。
- [x] **SaaS 級官方登陸頁 (`index.html`)**: 結合毛玻璃特效與科技網格背景，完美展示核心技術與商業轉化區塊。

---

## 🚀 Phase 1: 雲端化與品牌曝光 (預計 1-2 週)
*目標：讓世界看到這個作品，並解決「跨裝置進度遺失」的問題。*

- [ ] **1.1 GitHub Pages 部署 (優先度：極高)**
    - 將目前的程式碼推播至 GitHub 儲存庫 (Repository)。
    - 開啟 GitHub Pages 獲得免費的對外網址 (e.g., `bluesoul2003.github.io/fp-physics`)。
- [ ] **1.2 錄製第一支 YouTube 展示影片 (優先度：高)**
    - **內容腳本**: "Why most Physics engines are wrong: Building a real RK4 Pendulum from scratch."
    - **目的**: 建立權威性，將流量引導至 Landing Page。
- [ ] **1.3 Firebase Auth 登入系統 (優先度：中)**
    - 替換掉脆弱的 `LocalStorage`，實作 Google 帳號一鍵登入。
    - 讓學生在手機和電腦上都能同步他們的 RPG 等級與方程式圖鑑。

---

## ⚡ Phase 2: 學科深化與橫向擴充 (預計 1-2 個月)
*目標：發揮在 UTM 專攻電子學 (Electronics) 與量子物理的優勢。*

- [ ] **2.1 RLC 交流電路模擬器 (`sim_rlc.js`)**
    - **技術點**: 數值求解二階線性常微分方程式。
    - **UI 設計**: 新增「虛擬示波器 (Oscilloscope)」視圖。
    - **商業價值**: 大學物理實驗必考題，需求極大。
- [ ] **2.2 量子勢阱模擬器 (`sim_quantum.js`)**
    - **技術點**: 一維薛丁格方程式的矩陣特徵值求解。
    - **UI 設計**: 視覺化波函數與機率密度，展現量子穿隧效應。
- [ ] **2.3 內容行銷持續輸出**
    - 發布 "How to code an RLC Circuit Simulator" 教學影片。

---

## 🛠️ Phase 3: 虛實整合與硬體變現 (預計 3-6 個月)
*目標：結合 Bambu Lab A1 3D 列印業務，創造被動收入護城河。*

- [ ] **3.1 設計 3D 列印實體教具**
    - 設計低摩擦力的單擺支架，使用 Bambu Lab A1 進行原型打樣與批量生產優化。
- [ ] **3.2 開發 Web Serial API 橋接模組**
    - 將 Arduino/ESP32 結合旋轉編碼器裝在實體單擺上。
    - 讓瀏覽器透過 USB/藍牙直接讀取實體單擺的角度數據，並在網頁的 DAQ 系統中即時繪圖。*(MIT 招生官最愛的 "Hardware-in-the-Loop" 專案！)*
- [ ] **3.3 商業發布與銷售**
    - 在 Landing Page 的「實體教具」區塊正式上架商品。
    - 針對馬來西亞 (特別是柔佛區) 的中學發送 Email，提供「數位平台免費 + 實體教具收費」的教育解決方案。

---

## 🧠 核心開發哲學 (First Principles Checklist)
在寫任何一行 code 之前，請先問自己：
1. **模組化了嗎？** 這個新功能可以獨立成一個 `.js` 檔嗎？
2. **效能最優嗎？** 物理運算是否高效？DOM 操作是否降到最低？
3. **有 Gamification 嗎？** 使用者做完這一步，會不會得到正面反饋 (EXP/成就)？