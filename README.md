# 寒霜攻略

《寒霜啟示錄》的 JSON 驅動靜態攻略網站。使用原生 HTML、CSS 與 JavaScript，不需安裝套件、不需建置，也不需要 API 金鑰。

## 本機啟動

```sh
cd /workspace/frost-guide
python3 -m http.server 8000 --bind 0.0.0.0
```

透過 HTTP 開啟網站；不要直接以 `file://` 開啟，因為網站需要 fetch JSON。

## 修改內容

所有攻略內容位於 `data/content.json`：

- `site`：站名、首頁標題、介紹與網站說明。
- `categories`：分類的唯一 `id` 與 `name`。
- `guides`：攻略陣列。每篇包含 `id`、`category`、`title`、`summary`、`tags`、`icon`、`art`、`minutes`、`updated` 與 `sections`。
- `sections`：每節的 `heading` 與純文字 `body`；換行使用 JSON 的 `\n`。
- `art`：可用 `ice`、`forest`、`gold`、`purple`。

攻略的 `category` 必須對應既有分類。新增一篇 JSON 記錄就會自動顯示於網站，不需要修改頁面。搜尋涵蓋標題、摘要、標籤及內文，並可搭配分類。內容使用 textContent 呈現，不執行 JSON 中的 HTML。

目前六篇攻略為通用示範內容，並非已核實的正式遊戲攻略。上線前請用可靠遊戲資料替換，尤其是數值、英雄排名、活動規則及版本資訊。

## 部署

將 `index.html`、`styles.css`、`app.js` 與 `data/` 一起部署至任意靜態網站主機（例如 GitHub Pages）。網站使用相對路徑，可放在子目錄。无需後端、資料庫或外部字型服務。

## 驗證

```sh
python3 -m json.tool data/content.json > /dev/null
node --check app.js
```

啟動後檢查首頁、分類、搜尋、空結果，以及攻略閱讀視窗的開啟、關閉與 Escape 操作。手機與桌面版皆有響應式排版。

## 中英文語系

頁首語言選單可切換繁體中文與英文；選擇會儲存在瀏覽器 localStorage，重新載入後保留。預設繁體中文，儲存功能不可用時仍可切換。

- `data/content.json`：繁體中文。
- `data/content.en.json`：英文。
- 各檔案的 `ui` 提供導覽、按鈕、搜尋提示、統計與閱讀視窗等介面文字。
- 兩份資料需維持相同攻略 `id`、分類 `id` 及結構；新增攻略時請同步提供翻譯。
- `ui` 的 `{count}` 與 `{date}` 是執行時代入的佔位文字，翻譯時請保留。

切换語系會保留目前分類與搜尋字串；搜尋針對所選語言內容。攻略閱讀視窗若開啟中，也會切換成同篇攻略的翻譯。

## 更新與快取

每次開啟或一般重新載入頁面，入口會自動產生新的載入版本，並以同一個 `?v=` 版本載入 JavaScript、CSS 與兩份攻略 JSON。JSON 請求另使用 `cache: 'no-store'`，不重用瀏覽器的資料快取。新增或更新檔案後推送即可，不需手動修改版本號，也不要求訪客清除快取。

這是每次載入的版本，不是發行版本；目前檔案很小，因此優先確保更新可見，代價是每次載入都重新下載資源。已開啟的頁面不會自動強制刷新；下一次開啟或一般重新整理會取得更新。GitHub Pages 部署完成及 CDN 傳播仍需時間，網站無法立即清除部署前已存在的舊入口快取。
