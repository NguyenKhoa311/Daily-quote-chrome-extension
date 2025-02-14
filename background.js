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

const HOUR = 8;  
const MINUTE = 0;

// Set up daily notification when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    scheduleDailyNotification();
});

// Send daily notification when the alarm fires
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "dailyMessage") {
        sendDailyNotification();
    }
});

function scheduleDailyNotification() {
    chrome.alarms.create("dailyMessage", {
        when: getNextAlarmTime(),  // First run time
        periodInMinutes: 1440 // Repeat every 24 hours
    });
}

// Calculate the next alarm time
function getNextAlarmTime() {
    let now = new Date();
    let nextAlarm = new Date();
    nextAlarm.setHours(HOUR, MINUTE, 0, 0);

    // If the alarm time has already passed, set it for the next day
    if (now.getTime() > nextAlarm.getTime()) {
        nextAlarm.setDate(nextAlarm.getDate() + 1);
    }

    return nextAlarm.getTime();
}

// Send a daily notification with a random message
function sendDailyNotification() {
    const messages = [
        "Wishing you a day as amazing as you are! 🌟",
        "Keep shining, you're doing great! ✨",
        "No matter what, always believe in yourself! 💖",
        "You're capable of amazing things! 💪",
        "Today is a fresh start, make it wonderful! 🌈",
        "Smile, because you’re the reason someone’s day is brighter! 😊",
        "Dream big, work hard, and make it happen! 🚀",
        "You’ve got this! Never forget how incredible you are! 💕",
        "Wishing you a day as beautiful as your smile! 😊",
        "You are stronger than you think—keep going! 💪",
        "No matter what happens today, you’ve got this! 🌟",
        "Believe in yourself the way I believe in you! 💖",
        "Every challenge is an opportunity to grow. You’re doing great! 🌱",
        "You light up every room you walk into! ✨",
        "Keep chasing your dreams, and never stop believing in yourself! 🚀",
        "One small positive thought in the morning can change your whole day! 🌞",
        "You are capable of amazing things—never doubt that! 💕",
        "The world is lucky to have someone like you in it! 🌎",
        "Your kindness and strength inspire me every day! 💖",
        "Don’t forget to take a deep breath and enjoy the moment! 🌿",
        "Everything you need to succeed is already inside you! 🌟",
        "You bring so much joy wherever you go! Keep being you! 😍",
        "Today is a fresh start—make the most of it! 🌈",
        "Even on tough days, remember how incredible you are! 💖",
        "You are loved, appreciated, and stronger than you know! 💫",
        "No storm lasts forever—keep shining!  ☔️🌈",
        "Your dreams are valid, and I know you’ll achieve them! 🚀",
        "Keep smiling because your happiness is contagious! 😊",
        "You make the world a better place just by being in it! 🌎💖",
        "Success is built on small daily steps—keep going! 👣",
        "The universe has amazing things in store for you! ✨",
        "You’re already enough, just as you are! 💖",
        "Your hard work will pay off—just wait and see! 💪",
        "The best is yet to come, so keep your head up! 🌟",
        "I hope today brings you as much happiness as you bring to others! 😊",
        "Never forget: You are brave, strong, and absolutely amazing! 💕",
        "Even on cloudy days, your light shines through! ☁️✨",
        "You are someone’s reason to smile today—never forget that! 😊"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon16.png",
        title: "From Tangerine 🍊",
        message: randomMessage,
        requireInteraction: true
    });

    chrome.storage.local.set({ lastNotificationDate: new Date().toDateString() });
}


// Check when the extension is started
chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get("lastNotificationDate", (data) => {
        const today = new Date().toDateString();
        
        // If there is no notification for today, send one immediately
        if (data.lastNotificationDate !== today) {
            sendDailyNotification();
        }
    });
});

// Check when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get("lastNotificationDate", (data) => {
        const today = new Date().toDateString();
        
        // If there is no notification for today, send one immediately
        if (data.lastNotificationDate !== today) {
            sendDailyNotification();
        }
    });
});

