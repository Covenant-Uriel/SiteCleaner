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
    chrome.tabs.reload(tab.id);
    window.close(); // 關閉小視窗
  });
});
