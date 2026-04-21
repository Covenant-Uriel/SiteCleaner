// 頁面載入後，先取得當前網址顯示給使用者看
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const url = new URL(tabs[0].url);
  document.getElementById('siteName').innerText = "當前網站: " + url.hostname;
});

document.getElementById('cleanBtn').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url) return;

  const origin = new URL(tab.url).origin;

  // 執行清理動作
  chrome.browsingData.remove({
    "origins": [origin]
  }, {
    "cache": true,
    "history": true,
    "localStorage": true
  }, () => {
    // 清理完畢後重整分頁，這會迫使瀏覽器重新分配記憶體
    document.getElementById('cleanBtn').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url) return;

  const origin = new URL(tab.url).origin;

  // 1. 先清理資料
  chrome.browsingData.remove({
    "origins": [origin]
  }, {
    "cache": true,
    "history": true,
    "localStorage": true
  }, async () => {
    // 2. 強制丟棄 (Discard) 該分頁以真正釋放資源
    // 注意：discard 後頁面會變暗，點擊後才會重新載入
    await chrome.tabs.discard(tab.id);
    
    alert(`已清理 ${origin} 的緩存並強制釋放記憶體資源！\n(分頁已進入休眠狀態)`);
    window.close();
  });
});
