// 第1行：開始監聽頁面載入
document.addEventListener('DOMContentLoaded', async () => {
    
    // 取得當前分頁資訊
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url) {
        try {
            const url = new URL(tab.url);
            document.getElementById('siteName').innerText = "當前網站: " + url.hostname;
        } catch (e) {
            document.getElementById('siteName').innerText = "無法偵測此頁面";
        }
    }

    // 監聽按鈕點擊
    document.getElementById('cleanBtn').addEventListener('click', async () => {
        if (!tab || !tab.url) return;

        const origin = new URL(tab.url).origin;
        const btn = document.getElementById('cleanBtn');
        
        btn.innerText = "清理中...";
        btn.disabled = true;

        // 執行清理動作
        chrome.browsingData.remove({
            "origins": [origin]
        }, {
            "cache": true,
            "history": true,
            "localStorage": true
        }, () => {
            // 清理完成後的回呼函式
            btn.innerText = "完成！正在重整...";
            
            setTimeout(() => {
                chrome.tabs.reload(tab.id);
                window.close();
            }, 800);
        }); // 這是 browsingData.remove 的結束
    }); // 這是 addEventListener('click') 的結束

}); 
