document.addEventListener("DOMContentLoaded", function () {
    const quoteText = document.getElementById("quote-text");
    const quoteAuthor = document.getElementById("quote-author");
    const refreshBtn = document.getElementById("refresh-btn");
    const quoteBox = document.querySelector('.quote-box');
    const quoteContent = document.getElementById('quote-content');
    const shimmerContent = document.getElementById('shimmer-content');

    function showLoading() {
        quoteBox.classList.add('loading');
        refreshBtn.disabled = true;
    }

    function hideLoading() {
        quoteBox.classList.remove('loading');
        refreshBtn.disabled = false;
    }

    function showShimmer() {
        quoteContent.style.display = 'none';
        shimmerContent.style.display = 'block';
    }

    function hideShimmer() {
        shimmerContent.style.display = 'none';
        quoteContent.style.display = 'block';
    }

    function fetchQuote() {
        showLoading();
        showShimmer();

        chrome.runtime.sendMessage({ action: "fetchQuote" }, function (response) {
            if (response.error) {
                quoteText.textContent = "Không thể tải quote.";
                quoteAuthor.textContent = "";
            } else {
                const now = new Date();
                const quoteData = {
                    quote: response.quote,
                    author: response.author,
                    timestamp: now.getTime(),
                    date: now.toDateString()
                };
                chrome.storage.local.set({ quoteData });
                updateUI(quoteData);
            }
            
            setTimeout(() => {
                hideLoading();
                hideShimmer();
            }, 500); // Thêm hiệu ứng chuyển mượt mà
        });
    }

    function updateUI(quoteData) {
        quoteText.textContent = `"${quoteData.quote}"`;
        quoteAuthor.textContent = `- ${quoteData.author}`;
    }

    function updateDate() {
        const dateElement = document.getElementById('current-date');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date().toLocaleDateString('en-EN', options);
        dateElement.textContent = date;
    }

    // Kiểm tra xem quote của ngày hôm nay đã lưu chưa
    chrome.storage.local.get("quoteData", function (result) {
        const now = new Date();
        if (result.quoteData && result.quoteData.date === now.toDateString()) {
            // Nếu quote đã được lưu hôm nay, chỉ hiển thị ngay, không cần hiệu ứng loading
            updateUI(result.quoteData);
            hideShimmer();
        } else {
            // Nếu chưa có quote hôm nay, hiển thị hiệu ứng loading rồi fetch quote mới
            fetchQuote();
        }
    });

    refreshBtn.addEventListener("click", fetchQuote);
    updateDate();
});
