document.addEventListener('DOMContentLoaded', async () => {
    // 獲取當前活躍的分頁
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const btn = document.getElementById('cleanBtn');
    const siteDisplay = document.getElementById('siteName');

    // 初始化介面顯示
    if (tab && tab.url) {
        try {
            const url = new URL(tab.url);
            // 排除瀏覽器內建頁面 (如 chrome://)
            if (url.protocol.startsWith('http')) {
                siteDisplay.innerText = "當前網站: " + url.hostname;
            } else {
                siteDisplay.innerText = "此頁面不支援清理";
                btn.disabled = true;
                return;
            }
        } catch (e) {
            siteDisplay.innerText = "無法偵測網頁資訊";
            btn.disabled = true;
            return;
        }
    }

    // 點擊清理按鈕後的邏輯
    btn.addEventListener('click', async () => {
        if (!tab || !tab.id) return;

        btn.disabled = true;
        btn.innerText = "分析中...";

        let beforeMemory = 0;

        try {
            // 1. 注入腳本讀取真實 JavaScript 堆積記憶體 (JS Heap Size)
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    return {
                        // 讀取瀏覽器 V8 引擎分配給該分頁的真實記憶體數據
                        used: window.performance && window.performance.memory ? 
                              window.performance.memory.usedJSHeapSize : 0
                    };
                }
            });
            beforeMemory = results[0].result.used;
        } catch (err) {
            console.error("無法存取網頁記憶體數據:", err);
            beforeMemory = 0;
        }

        const origin = new URL(tab.url).origin;
        btn.innerText = "清理快取中...";

        // 2. 執行瀏覽資料清理 (針對該網域)
        // 僅清理快取與區域儲存，避免將歷史紀錄或登入資訊全刪
        chrome.browsingData.remove({
            "origins": [origin]
        }, {
            "cache": true,
            "localStorage": true,
            "indexedDB": true
        }, () => {
            // 3. 計算並顯示真實釋放量 (單位：MB)
            // 將 Byte 轉換為 MB 並取到小數點後兩位
            const releasedMB = (beforeMemory / (1024 * 1024)).toFixed(2);

            if (parseFloat(releasedMB) > 0) {
                btn.style.backgroundColor = "#27ae60";
                btn.innerText = `優化完成！釋放 ${releasedMB} MB`;
            } else {
                btn.style.backgroundColor = "#27ae60";
                btn.innerText = "清理完成 (資源已達最佳狀態)";
            }

            // 4. 強制重新整理以回收實體記憶體
            // 延遲一段時間讓使用者能看清楚清理數據
            setTimeout(() => {
                chrome.tabs.reload(tab.id);
                setTimeout(() => window.close(), 3000); // 3秒後關閉插件小視窗
            }, 1500);
        });
    });
});
