# tripleS 生涯表產生器

以原站簡單白底、黑色表格與紅色 PNG 下載按鈕為基礎，提供 1.0、2.0、3.0、3.5 四種版本。1.0／3.0／3.5 有 12 格，2.0 有 15 格；1.0～3.0 保留原始表格排列、文字與線條，3.5 保留既有改版項目。四個版本的表頭與項目名稱均使用同一字型重新繪製。

## 填寫及保存

點擊格子，可切換照片／成員、歌曲、小分隊或 Objekt 小卡。預設歌曲及小卡格會直接開啟對應選單。

點擊每格下方的項目名稱，或內容選單中的「更換項目名稱」，可從四個版本的既有項目挑選，也能輸入最多 40 字的自訂名稱。留白可隱藏名稱；長文字會自動縮放與換行。可指定空白格預設開啟照片、歌曲、小分隊或小卡選單。更名會保留已填內容，支援恢復原始項目、復原與 PNG 匯出；各版本的項目設定分別保存，舊草稿會自動遷移。

- 照片支援選擇成員、搜尋公開照片、拖放檔案、點擊選檔及 Ctrl／Cmd＋V 貼上圖片；可直接拖曳裁切位置及縮放。成員「無」位於名單最後。
- 歌曲可搜尋歌名／專輯或依封面挑選，表格顯示置中的封面與歌名。
- 小分隊可依名稱、縮寫或成員搜尋，共 17 個選項，包含以 tripleS 顯示的 OT24 全員選項。
- Objekt 可依成員、Season 與卡款編號搜尋，點選後顯示完整卡面與名稱。卡款編號如 101Z，並非個別持有卡片的流水號。

各版本草稿分開保存在目前網站來源的 IndexedDB，切換版本不會覆蓋其他版本。舊版 3.5 草稿會沿用。清空及復原只作用於目前版本，包含內容與自訂項目。清除網站資料、無痕模式或換裝置不保證保留，完成後請下載 PNG 備份。照片與選取的小卡會於瀏覽器內轉換並保存，不會上傳個人圖片。

## 本機執行與 GitHub Pages

以靜態 HTTP 伺服器開啟，例如：

    python -m http.server 8080

開啟 http://localhost:8080 。JavaScript 使用模組，請勿直接雙擊 HTML。

GitHub Pages 使用 main 分支根目錄發佈，正式網址為 https://ushi511.github.io/triples/ 。新版已取代原版首頁；舊 /studio/ 連結會保留查詢參數與錨點並導向首頁。瀏覽器草稿使用相同來源的 IndexedDB，因此路徑調整不會搬移或清除既有草稿。

主要頁面為根目錄 index.html；JavaScript、樣式及素材保留在 studio/。首頁以 base 指向 ./studio/，所有既有相對素材路徑維持有效。編輯頁面文字請修改根目錄 index.html；studio/index.html 僅作舊網址轉址。
原始碼：https://github.com/ushi511/triples

## 成員網路照片

透過 tripleS Wiki 與 Kpop Wiki 公開 MediaWiki API 即時搜尋，可切換來源、搜尋關鍵字及載入更多。優先排列自拍、SNS 與日常照，依標題排除明顯合照、簽名與 Logo，依 SHA-1 排除完全相同圖片。此篩選仍可能包含非個人照。原本成員照片固定為第一個選項。來源連結附於各縮圖；失敗時可重試或使用本機圖片。

目前未直接連接 COSMO Room 帳號或私人內容。

## 歌曲資料

核對日期：2026-10-24。包含 35 張發行、183 首曲目，含伴奏、語言及不同專輯版本。封面為本機資產以支援 PNG 匯出。

- https://music.apple.com/tw/artist/triples/1651595986
- https://www.triples-official.jp/discography/
- https://triples.lnk.to/kS7g0e

## 小分隊資料

名稱、成員及圖片來源記錄在 units.json。包含 tripleS 全員、Acid Angel from Asia、+(KR)ystal Eyes、ACID EYES、LOVElution、EVOLution、NXT、Aria、Glow、Vision@ry Vision、∞!、Alphie、msnz、moon、sun、neptune、zenith。

一般使用小分隊 Logo；tripleS 使用 LOVE&POP pt.1 官方團體宣傳照，msnz 使用專輯封面並於選項註明。資料來源包含 tripleS 官方網站、日本官方網站、Melon 官方專輯介紹與 tripleS Wiki；各圖片原始來源保留在 units.json。

## Objekt 資料

objekt-catalog.json 為 2026-10-25（台灣時間）建立的公開卡款目錄快照：24 位成員、8 個 Season、11,528 種個人卡面。公開來源：https://apollo.cafe/ 。搜尋在瀏覽器內進行，不需 COSMO 登入、錢包、API 金鑰或訂閱；未查詢個人持有資料。

Season：Atom01、Binary01、Cream01、Divine01、Ever01、Atom02、Binary02、Cream02。新卡不會即時加入，需重新整理目錄。動態卡使用靜態正面圖，不提供動畫。此目錄不包含多人或小分隊卡款。

卡面依賴原始圖片服務；部分 resources.cosmo.fans 圖片透過公開 wsrv.nl 圖片快取載入，以支援瀏覽器跨來源匯出。原始圖片與卡款來源保留在目錄。任何圖片服務或快取不可用時，仍可改用上傳或貼上圖片。

## 字型及素材權利

頁面、表單控制項、四個版本的表頭與項目名稱、自訂文字及動態 Canvas 文字均使用同一套 Noto Sans TC。使用完整可變字型 WOFF2（常用繁中及拉丁字元），避免新輸入的中文字落回不同的系統字型；原有子集字型檔保留以相容快取頁面。字型來源：https://github.com/google/fonts/tree/main/ofl/notosanstc 。字型授權見 assets/fonts/OFL.txt。原始表格圖片由使用者提供，既有素材來自 https://ushi511.github.io/triples/ 。非官方粉絲工具，表格、人物照片、卡面、Logo、封面及其他素材權利屬各權利人。
