# tripleS 生涯表 3.0 產生器・改良版

以原站版面及原始表格為基礎的小幅改良。

保留：白底、原始 12 格生涯表、點格子選照片、紅色 PNG 下載按鈕。
改善：成員縮圖與姓名搜尋、直接拖曳照片調整位置及縮放、單格清除、復原、瀏覽器草稿保存、圖片載入的目標格子保護。

執行方式：將 studio 設為靜態 HTTP 伺服器的根目錄。例如已安裝 Python 時：

    python -m http.server 8080 --directory studio

開啟 http://localhost:8080 。JavaScript 使用模組，請以 HTTP 開啟，勿直接雙擊 HTML。

照片於瀏覽器內處理，草稿保存在目前網站來源的 IndexedDB。清除網站資料、無痕模式或換裝置不保證保留，完成後可下載 PNG 備份。

原版及照片素材：https://ushi511.github.io/triples/
原始碼：https://github.com/ushi511/triples
成員名稱：https://www.triples-official.jp/

非官方粉絲工具。原始表格與人物照片的相關權利屬各自權利人。

## 歌曲選擇

最後兩格為「最愛的一首歌」與「最被低估的一首歌」，支援歌名／專輯搜尋及封面挑選，匯出含專輯封面與歌曲名稱。

曲庫核對日期：2026-10-24。包含 35 張發行、183 首曲目（含伴奏、語言及不同專輯版本）。
曲目資料：Apple Music / iTunes tripleS 藝人目錄；Touch+ 及發行完整性對照 tripleS 官方網站。
https://music.apple.com/tw/artist/triples/1651595986
https://www.triples-official.jp/discography/
https://triples.lnk.to/kS7g0e

專輯封面保存在本網站資產中，避免匯出 PNG 時跨來源污染畫布。原始資料與相關圖像權利歸各權利人。

## 文字排版

頁面與 Canvas 使用同一套 Noto Sans TC 字型，表頭與 12 格標題均重新繪製。歌曲封面與放大的歌名依內容長度整組垂直置中。字型為 Google Fonts 提供的開源子集，授權檔位於 assets/fonts/OFL.txt。

## GitHub Pages

此目錄可放在儲存庫根目錄的 studio/，既有原版首頁保留。
GitHub Pages 以 main 分支根目錄發佈時，新版網址為 https://ushi511.github.io/triples/studio/ 。
