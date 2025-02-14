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
        return true;
    }
});

const HOUR = 8;  // Đổi thành giờ mong muốn (24h format)
const MINUTE = 0; // Đổi thành phút mong muốn

// Khi extension được cài đặt hoặc bật lên, đặt lịch gửi thông báo
chrome.runtime.onInstalled.addListener(() => {
    scheduleDailyNotification();
});

// Khi đến giờ hẹn, gửi thông báo
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "dailyMessage") {
        sendDailyNotification();
    }
});

// Hàm lên lịch gửi thông báo vào giờ và phút cụ thể
function scheduleDailyNotification() {
    chrome.alarms.create("dailyMessage", {
        when: getNextAlarmTime(),  // Đặt lần chạy đầu tiên
        periodInMinutes: 1440 // Lặp lại mỗi 24 giờ
    });
}

// Tính thời gian lần chạy đầu tiên
function getNextAlarmTime() {
    let now = new Date();
    let nextAlarm = new Date();
    nextAlarm.setHours(HOUR, MINUTE, 0, 0); // Đặt giờ và phút mong muốn

    // Nếu thời gian hiện tại đã qua giờ hẹn, đặt cho ngày mai
    if (now.getTime() > nextAlarm.getTime()) {
        nextAlarm.setDate(nextAlarm.getDate() + 1);
    }

    return nextAlarm.getTime();
}

// Gửi thông báo
function sendDailyNotification() {
    const messages = [
        "Chúc bạn một ngày tuyệt vời! 🌞",
        "Hãy luôn mỉm cười! 😊",
        "Hôm nay là một ngày tốt lành!",
        "Luôn tiến về phía trước! 🚀",
        "Bạn làm được mà! 💪"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon16.png",
        title: "Lời chúc hôm nay",
        message: randomMessage,
        requireInteraction: true
    });

    chrome.storage.local.set({ lastNotificationDate: new Date().toDateString() });
}


// Kiểm tra khi Chrome khởi động lại
chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get("lastNotificationDate", (data) => {
        const today = new Date().toDateString();
        
        // Nếu chưa có thông báo hôm nay, gửi ngay lập tức
        if (data.lastNotificationDate !== today) {
            sendDailyNotification();
        }
    });
});

// Kiểm tra khi extension được tải lại
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get("lastNotificationDate", (data) => {
        const today = new Date().toDateString();
        
        // Nếu chưa có thông báo hôm nay, gửi ngay lập tức
        if (data.lastNotificationDate !== today) {
            sendDailyNotification();
        }
    });
});

