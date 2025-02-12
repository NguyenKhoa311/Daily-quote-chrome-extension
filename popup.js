import { getRandomQuote } from './quotes/index.js';

document.addEventListener("DOMContentLoaded", function () {
    const quoteText = document.getElementById("quote-text");
    const quoteAuthor = document.getElementById("quote-author");
    const refreshBtn = document.getElementById("refresh-btn");
    const quoteBox = document.querySelector('.quote-box');
    const quoteContent = document.getElementById('quote-content');
    const shimmerContent = document.getElementById('shimmer-content');

    let isFirstTimeToday = true;
    let currentMood = null;

    function createSnowflakes() {
        const container = document.getElementById('snowflakes');
        const snowflakeCount = 50;

        for (let i = 0; i < snowflakeCount; i++) {
            createOneSnowflake();
        }
    }

    function createOneSnowflake() {
        const container = document.getElementById('snowflakes');
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';

        const startPosition = Math.random() * 100;
        const size = Math.random() * 4 + 2;
        const animationDuration = Math.random() * 3 + 2;
        const opacity = Math.random() * 0.6 + 0.4;

        snowflake.style.left = `${startPosition}%`;
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.opacity = opacity;
        snowflake.style.animationDuration = `${animationDuration}s`;

        container.appendChild(snowflake);

        snowflake.addEventListener('animationend', () => {
            snowflake.remove();
            createOneSnowflake();
        });
    }

    function showLoading() {
        if (!isFirstTimeToday) {
            quoteBox.classList.add('loading');
            refreshBtn.disabled = true;
        }
    }

    function hideLoading() {
        quoteBox.classList.remove('loading');
        refreshBtn.disabled = false;
    }

    function showQuoteBox() {
        quoteBox.style.display = 'block';
        refreshBtn.style.display = 'block';
    }

    function hideQuoteBox() {
        quoteBox.style.display = 'none';
        refreshBtn.style.display = 'none';
    }

    function showShimmer() {
        if (!isFirstTimeToday) {
            quoteContent.style.display = 'none';
            shimmerContent.style.display = 'block';
        }
    }

    function hideShimmer() {
        shimmerContent.style.display = 'none';
        quoteContent.style.display = 'block';
    }

    function updateMoodQuote(mood) {
        showQuoteBox();
        showLoading();
        showShimmer();
    
        setTimeout(() => {
            const quoteData = getRandomQuote(mood);
            const data = {
                quote: quoteData.quote,
                author: quoteData.author,
                timestamp: new Date().getTime(),
                date: new Date().toDateString(),
                mood: mood,
                isFirstTimeToday: false
            };
            
            updateUI(data);
    
            // Lưu toàn bộ thông tin vào storage
            if (typeof chrome !== "undefined" && chrome.storage?.local) {
                chrome.storage.local.set({ quoteData: data });
            }
    
            hideLoading();
            hideShimmer();
        }, 500);
    }

    function fetchQuote() {
        if (isFirstTimeToday) {
            // Nếu là lần đầu mở trong ngày, chỉ hiện câu hỏi
            hideQuoteBox();
        } else if (currentMood) {
            // Nếu không phải lần đầu và đã có mood, hiện quote tương ứng
            updateMoodQuote(currentMood);
        }
    }

    function setMockQuote(quote, author) {
        const now = new Date();
        const mockData = {
            quote: quote,
            author: author,
            timestamp: now.getTime(),
            date: now.toDateString(),
            isFirstTimeToday: isFirstTimeToday
        };
        updateUI(mockData);
    }

    function updateUI(quoteData) {
        quoteText.textContent = quoteData.quote;
        quoteAuthor.textContent = quoteData.author ? `- ${quoteData.author}` : '';
        
        // Add animation classes
        quoteText.classList.add('new-quote');
        quoteAuthor.classList.add('new-quote');
        
        // Remove animation classes after animation completes
        setTimeout(() => {
            quoteText.classList.remove('new-quote');
            quoteAuthor.classList.remove('new-quote');
        }, 500);

        // Update status for isFirstTimeToday
        if (quoteData.hasOwnProperty('isFirstTimeToday')) {
            isFirstTimeToday = quoteData.isFirstTimeToday;
        }
    }

    function updateDate() {
        const dateElement = document.getElementById('current-date');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('en-EN', options);
    }

    function initializeMoodButtons() {
        document.querySelectorAll('.mood-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.mood-button').forEach(btn => {
                    btn.classList.remove('selected-mood');
                });
                button.classList.add('selected-mood');
                currentMood = button.dataset.mood;
                isFirstTimeToday = false; // Sau khi chọn mood, không còn là lần đầu nữa
                updateMoodQuote(currentMood);
            });
        });
    }

    function checkQuoteStorage() {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.get("quoteData", function (result) {
                const now = new Date();
                if (result.quoteData && result.quoteData.date === now.toDateString()) {
                    // Nếu đã có dữ liệu của ngày hôm nay
                    isFirstTimeToday = false;
                    currentMood = result.quoteData.mood;
                    
                    // Hiển thị quote đã lưu
                    showQuoteBox();
                    updateUI(result.quoteData);
                    
                    // Khôi phục trạng thái mood button
                    if (currentMood) {
                        document.querySelectorAll('.mood-button').forEach(btn => {
                            btn.classList.remove('selected-mood');
                        });
                        const moodButton = document.querySelector(`[data-mood="${currentMood}"]`);
                        if (moodButton) {
                            moodButton.classList.add('selected-mood');
                        }
                    }
                    
                    hideShimmer();
                } else {
                    // Nếu chưa có dữ liệu của ngày hôm nay
                    isFirstTimeToday = true;
                    currentMood = null;
                    hideQuoteBox();
                    fetchQuote();
                }
            });
        } else {
            isFirstTimeToday = true;
            currentMood = null;
            hideQuoteBox();
            fetchQuote();
        }
    }

    refreshBtn.addEventListener("click", () => {
        if (!isFirstTimeToday && currentMood) {
            fetchQuote();
        }
    });
    
    initializeMoodButtons();
    updateDate();
    checkQuoteStorage();
    createSnowflakes();
});