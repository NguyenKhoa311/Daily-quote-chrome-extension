chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchQuote") {
        fetch("https://quotes-api-self.vercel.app/quote")
            .then(response => response.json())
            .then(data => {
                if (data && data.quote && data.author) {
                    sendResponse({ quote: data.quote, author: data.author });
                } else {
                    sendResponse({ error: "Không thể lấy dữ liệu" });
                }
            })
            .catch(error => {
                console.error("Lỗi khi lấy quote:", error);
                sendResponse({ error: "Lỗi kết nối API" });
            });
        return true; // Để đảm bảo sendResponse hoạt động bất đồng bộ
    }
});
