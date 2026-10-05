# 肥胖衛教 Chatbot｜GitHub Pages 版

這是一個純前端的病人衛教 Chatbot。

主要資料來源：
- 衛生福利部國民健康署 2024《一起聊聊肥胖症：你該問的100+件事》
- 減重藥物資訊：依台灣核准藥品資訊、相關臨床指引及本網站醫療專業整理；實際用藥以 TFDA 核准仿單及醫師評估為準

## 專案結構

```text
obesity-chatbot/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── chatbot.js
├── data/
│   ├── obesity_139.json
│   └── medications.json
├── offline_single_file.html
├── README.md
└── .nojekyll
```

### 各檔案用途

- `index.html`：網站首頁
- `css/style.css`：版面與視覺樣式
- `js/chatbot.js`：搜尋、對話、BMI 計算、題意路由
- `data/obesity_139.json`：國健署 Q1–Q139 知識庫
- `data/medications.json`：台灣核准長期體重控制藥物資料
- `offline_single_file.html`：不需伺服器即可直接開啟的單檔備份
- `.nojekyll`：讓 GitHub Pages 直接發布靜態檔案

## 發布到 GitHub Pages

1. 在 GitHub 建立新的 repository，例如 `obesity-chatbot`
2. 將這個資料夾內的所有檔案上傳到 repository 根目錄
3. 進入 repository：
   `Settings → Pages`
4. `Build and deployment` 選：
   - Source：`Deploy from a branch`
   - Branch：`main`
   - Folder：`/ (root)`
5. 儲存後等待 GitHub Pages 完成部署

網址通常會是：

```text
https://你的GitHub帳號.github.io/obesity-chatbot/
```

## 在電腦上預覽

因為正式版會用 `fetch()` 讀取 JSON，所以不建議直接雙擊 `index.html`。

如果電腦有 Python，可在此資料夾開啟終端機：

```bash
python -m http.server 8000
```

然後瀏覽器開：

```text
http://localhost:8000
```

若只想直接雙擊測試，可開啟：

`offline_single_file.html`

## 日後怎麼更新

### 更新國健署題庫
修改：

`data/obesity_139.json`

每一題為一個獨立 JSON object。

### 更新減重藥物
修改：

`data/medications.json`

### 修改對話或搜尋規則
修改：

`js/chatbot.js`

### 修改畫面
修改：

`css/style.css`

## 醫療與隱私注意事項

目前為純前端靜態網站，不需要後端資料庫，也不會主動將對話傳送到伺服器。

若未來加入：
- 病人姓名、病歷號或其他個人資料
- 院內病歷系統
- AI API
- 登入功能
- 對話紀錄儲存

就不應只使用公開 GitHub Pages，需另外規劃後端、權限、個資與院內資安機制。

本工具為一般衛教用途，不取代醫師診斷或個別化治療。


## 減重藥物內容說明

減重藥物資料由本網站依台灣核准藥品資訊、相關臨床指引及醫療專業內容整理，不直接轉載特定醫院電子報內容。

目前網站列出的台灣核准長期體重控制藥物為：
- Orlistat
- Naltrexone/Bupropion
- Liraglutide
- Semaglutide
- Tirzepatide

Phentermine（芬特明／芬他命）目前在台灣沒有核准的減重適應症，因此不列入上述核准減重藥物清單。

實際適應症、禁忌症、劑量、用法及最新核准狀態仍以 TFDA 核准仿單與醫師評估為準。


### 青少年核准減重藥物

依台灣目前核准仿單整理，青少年可考慮的減重藥物包括：

- **Orlistat**：肥胖青少年在至少 6 個月以上、符合年齡的均衡飲食與行為／運動治療仍失敗後才考慮。12 歲以下缺乏臨床研究。若治療約 12 週仍沒有體重下降，應回診評估是否繼續。
- **Liraglutide**：12 歲以上、肥胖且體重 >60 kg。每天 3.0 mg 或最高耐受劑量治療 12 週後，若 BMI 或 BMI 標準分數未下降至少 4%，應停藥並重新評估。
- **Semaglutide**：12 歲以上、肥胖且體重 >60 kg。2.4 mg 或最高耐受劑量治療 12 週後，若 BMI 未下降至少 5%，應停藥並重新評估。

目前 **Naltrexone/Bupropion** 與 **Tirzepatide** 的台灣體重控制適應症仍以成人為主，不能直接套用於青少年。

以上資訊以 TFDA 最新核准仿單為準。
