// 當彈出視窗載入完成後執行
document.addEventListener('DOMContentLoaded', async () => {
    // 1. 取得當前分頁資訊並顯示網址
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url) {
        try {
            const url = new URL(tab.url);
            document.getElementById('siteName').innerText = "當前網站: " + url.hostname;
        } catch (e) {
            document.getElementById('siteName').innerText = "無法偵測此頁面";
        }
    }

    // 2. 點擊按鈕後的清理邏輯
    document.getElementById('cleanBtn').addEventListener('click', async () => {
        if (!tab || !tab.url) return;

        const origin = new URL(tab.url).origin;

        // 執行清理資料
        chrome.browsingData.remove({
            "origins": [origin]
        }, {
            "cache": true,
            "history": true,
            "localStorage": true
        }, async () => {
            // 清理完成後，將按鈕文字改為已完成
            document.getElementById('cleanBtn').innerText = "清理完成！";
            
            // 延遲一小段時間後重整或釋放記憶體
            setTimeout(() => {
                chrome.tabs.reload(tab.id);
                window.close();
            }, 500);
        });
    });
});
