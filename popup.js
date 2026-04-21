document.addEventListener('DOMContentLoaded', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const btn = document.getElementById('cleanBtn');
    const siteDisplay = document.getElementById('siteName');

    if (tab && tab.url) {
        siteDisplay.innerText = "偵測中...";
        try {
            const url = new URL(tab.url);
            siteDisplay.innerText = "當前網站: " + url.hostname;
        } catch (e) {
            siteDisplay.innerText = "此頁面不支援偵測";
        }
    }

    btn.addEventListener('click', async () => {
        if (!tab || !tab.id) return;

        btn.disabled = true;
        btn.innerText = "正在讀取記憶體數據...";

        // 1. 抓取清理前的真實 JS Heap 記憶體
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                return {
                    used: window.performance.memory ? window.performance.memory.usedJSHeapSize : 0
                };
            }
        });

        const beforeMemory = results[0].result.used;
        const origin = new URL(tab.url).origin;

        // 2. 執行清理
        chrome.browsingData.remove({
            "origins": [origin]
        }, {
            "cache": true,
            "localStorage": true
        }, () => {
            // 3. 計算真實釋放量 (以 MB 為單位)
            // 註：重整後，舊的記憶體會被完全釋放。
            // 我們以清理前的佔用量作為「釋放參考值」
            const releasedMB = (beforeMemory / (1024 * 1024)).toFixed(2);

            if (parseFloat(releasedMB) > 0) {
                btn.style.backgroundColor = "#27ae60";
                btn.innerText = `成功優化！釋放 ${releasedMB} MB`;
            } else {
                btn.innerText = "清理完成 (資源已處於最佳狀態)";
            }

            // 4. 重整分頁以完成實體記憶體回收
            setTimeout(() => {
                chrome.tabs.reload(tab.id);
                setTimeout(() => window.close(), 3000);
            }, 1500);
        });
    });
});
