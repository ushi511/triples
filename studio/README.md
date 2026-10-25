# tripleS 生涯表產生器

以原站簡單白底、黑色表格與紅色 PNG 下載按鈕為基礎，提供 1.0、2.0、3.0、3.5 四種版本，以及「空白自訂」表格。1.0／3.0／3.5 有 12 格，2.0 有 15 格；1.0～3.0 保留原始表格排列、文字與線條，3.5 保留既有改版項目。四個版本的表頭與項目名稱均使用同一字型重新繪製。

## 空白自訂

版本列最後的「空白自訂」可設定 1～60 格、每列 1～6 格，列數自動計算，最後一列可以不填滿。所有項目名稱預設留白，可使用既有項目或自行輸入，並可填入照片、歌曲、小分隊及 Objekt。畫面上的「點此填寫項目」只是操作提示，不會出現在 PNG。

調整格數與每列格數後按「套用格數」。內容按原本順序保留；減少格數會移除最後幾格，可用「復原上一步」還原格數、排列與內容。清空只清除內容及項目名稱，保留目前格數。空白自訂草稿分開保存，重新開啟會還原格數與排列。

## 自訂表格標題

五種表格都可點擊圖內的「tripleS 生涯表」標題，輸入最多 40 字，自動縮放或換成兩行。留白可隱藏標題文字，Logo 與原本的版本標示保留。標題分版本保存，支援取消、恢復原始標題、復原及 PNG 匯出；空白自訂調整格數時也會保留標題。舊版草稿自動沿用原始標題。

## 填寫及保存

點擊格子，可切換照片／成員、歌曲、小分隊或 Objekt 小卡。預設歌曲及小卡格會直接開啟對應選單。

點擊每格下方的項目名稱，或內容選單中的「更換項目名稱」，可從四個版本的既有項目挑選，也能輸入最多 40 字的自訂名稱。留白可隱藏名稱；長文字會自動縮放與換行。可指定空白格預設開啟照片、歌曲、小分隊或小卡選單。更名會保留已填內容，支援恢復原始項目、復原與 PNG 匯出；各版本的項目設定分別保存，舊草稿會自動遷移。

- 照片支援選擇成員、搜尋公開照片、拖放檔案、點擊選檔及 Ctrl／Cmd＋V 貼上圖片；可直接拖曳裁切位置及縮放。成員「無」位於名單最後。
- 歌曲可搜尋歌名／專輯或依封面挑選，表格顯示置中的封面與歌名。
- 小分隊可依名稱、縮寫或成員搜尋，共 17 個選項，包含以 tripleS 顯示的 OT24 全員選項。
- Objekt 可依成員、Season 與卡款編號搜尋，點選後顯示完整卡面與名稱。卡款編號如 101Z，並非個別持有卡片的流水號。

各版本草稿分開保存在目前網站來源的 IndexedDB，切換版本不會覆蓋其他版本。舊版 3.5 草稿會沿用。清空及復原只作用於目前版本，包含內容、自訂項目及表格標題。清除網站資料、無痕模式或換裝置不保證保留，完成後請下載 PNG 備份。照片與選取的小卡會於瀏覽器內轉換並保存，不會上傳個人圖片。

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

名稱、成員及圖片來源記錄在 units.json。包含 tripleS 全員、Acid Angel from Asia、+(KR)ystal Eyes、ACID EYES、LOVElution、EVOLution、NXT、Aria、Glow、Vision@ry Vision、∞!、Alphie、msnz、moon、sun、neptune、zenith、Aura。

18 個選項中，16 個使用對應成員合照或含完整隊伍的官方宣傳圖，保留完整構圖、不裁掉成員，JPEG 長邊最多 1400px。msnz 使用使用者提供的 DNA／地球圖案（msnz-logo.png），保留原圖尺寸與構圖。Aura 暫時使用簡單名稱字標（非官方 Logo），並在選項註明。tripleS 使用 LOVE&POP pt.1 官方團體照，Alphie 使用含正確 8 位成員的巡演宣傳照。資料來源與原始圖片連結保留在 units.json，選單也可點擊圖片來源。已填入草稿的舊 Logo 會依 unit-images.js 對應到目前設定的合照或字標，保留原本的格子名稱與其他內容。

目前未使用的 msnz-group.jpg 為 Beyond Beauty 記者會全 24 人合照，來源：https://commons.wikimedia.org/wiki/File:251124_-_tripleS_at_the_Beyond_Beauty_album_showcase.png 。作者為 K-POPIT 케이팝잇（原 TV Ten），原影片：https://www.youtube.com/watch?v=QsnyhLXs6Ww ，授權 CC BY 4.0：https://creativecommons.org/licenses/by/4.0/ 。圖片已縮小並轉為 JPEG，未裁切；目前選單及匯出已改用使用者提供的圖案；舊圖片的來源與署名保留於此。

## Objekt 資料

objekt-catalog.json 為 2026-10-25（台灣時間）建立的公開卡款目錄快照：24 位成員、8 個 Season、11,528 種個人卡面。公開來源：https://apollo.cafe/ 。搜尋在瀏覽器內進行，不需 COSMO 登入、錢包、API 金鑰或訂閱；未查詢個人持有資料。

Season：Atom01、Binary01、Cream01、Divine01、Ever01、Atom02、Binary02、Cream02。新卡不會即時加入，需重新整理目錄。動態卡使用靜態正面圖，不提供動畫。此目錄不包含多人或小分隊卡款。

卡面依賴原始圖片服務；部分 resources.cosmo.fans 圖片透過公開 wsrv.nl 圖片快取載入，以支援瀏覽器跨來源匯出。原始圖片與卡面來源保留在目錄。任何圖片服務或快取不可用時，仍可改用上傳或貼上圖片。

## 字型及素材權利

頁面、表單控制項、四個版本的表頭與項目名稱、自訂文字及動態 Canvas 文字均使用同一套 Noto Sans TC。使用完整可變字型 WOFF2（常用繁中及拉丁字元），避免新輸入的中文字落回不同的系統字型；原有子集字型檔保留以相容快取頁面。字型來源：https://github.com/google/fonts/tree/main/ofl/notosanstc 。字型授權見 assets/fonts/OFL.txt。原始表格圖片由使用者提供，既有素材來自 https://ushi511.github.io/triples/ 。非官方粉絲工具，表格、人物照片、卡面、Logo、封面及其他素材權利屬各權利人。

## Joojoo Stories 照片選集

成員照片預設顯示 Joojoo Stories 的近期公開照片選集，每位最多 6 張，只收錄靜態圖片。資料記錄於 story-photos.json，圖片存於 assets/stories，保留各成員原站頁面連結；縮小及 JPEG 壓縮以加快載入。來源：https://itsjoo.xyz/stories?artist=tripleS 。原站未提供跨來源讀取，因此目前為 2026-10-26 整理的靜態選集，非即時同步；更新需重新整理資料並發佈。其他 Wiki 搜尋來源仍可使用。
