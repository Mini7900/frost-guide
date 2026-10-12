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
