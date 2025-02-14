import { getRandomQuote } from './quotes/index.js';
import { ThemeManager } from './theme-manager.js';
import { moodQuestions } from './questions.js';

document.addEventListener("DOMContentLoaded", function () {
    const themeManager = new ThemeManager();
    const quoteText = document.getElementById("quote-text");
    const quoteAuthor = document.getElementById("quote-author");
    const refreshBtn = document.getElementById("refresh-btn");
    const quoteBox = document.querySelector('.quote-box');
    const quoteContent = document.getElementById('quote-content');
    const shimmerContent = document.getElementById('shimmer-content');
    const favoriteBtn = document.getElementById('favorite-btn');
    const viewFavoritesBtn = document.getElementById('view-favorites-btn');
    const favoritesModal = document.getElementById('favorites-modal');
    const closeModalBtn = document.querySelector('.close');
    const spotifyWidget = document.getElementById("spotifyWidget");
    const switchButton = document.getElementById("switchView");
    const moodQuoteSection = document.getElementById("moodQuoteSection");

    let isSpotifyView = false;
    let isFirstTimeToday = true;
    let currentMood = null;
    let favoriteQuotes = [];

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
    
            if (typeof chrome !== "undefined" && chrome.storage?.local) {
                chrome.storage.local.set({ quoteData: data });
            }
    
            hideLoading();
            hideShimmer();
        }, 500);
    }

    // handle favorite button
    function loadFavoriteQuotes() {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.get("favoriteQuotes", function(result) {
                if (result.favoriteQuotes) {
                    favoriteQuotes = result.favoriteQuotes;
                    updateFavoriteButtonUI();
                }
            });
        }
    }

    function isCurrentQuoteFavorited() {
        return favoriteQuotes.some(q => 
            q.quote === quoteText.textContent && 
            q.author === quoteAuthor.textContent.replace('- ', '')
        );
    }

    function updateFavoriteButtonUI() {
        if (isCurrentQuoteFavorited()) {
            favoriteBtn.innerHTML = '♥';
            favoriteBtn.classList.add('active');
        } else {
            favoriteBtn.innerHTML = '♡';
            favoriteBtn.classList.remove('active');
        }
    }

    function toggleFavorite() {
        const currentQuote = {
            quote: quoteText.textContent,
            author: quoteAuthor.textContent.replace('- ', ''),
            timestamp: new Date().getTime(),
            mood: currentMood
        };

        const index = favoriteQuotes.findIndex(q => 
            q.quote === currentQuote.quote && 
            q.author === currentQuote.author
        );

        if (index === -1) {
            favoriteQuotes.push(currentQuote);
        } else {
            favoriteQuotes.splice(index, 1);
        }

        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.set({ favoriteQuotes: favoriteQuotes });
        }

        updateFavoriteButtonUI();
    }

    function showFavorites() {
        const favoritesList = document.getElementById('favorites-list');
        favoritesList.innerHTML = '';

        if (favoriteQuotes.length === 0) {
            favoritesList.innerHTML = '<p style="text-align: center; color: #95a5a6;">No favorite quotes yet.</p>';
        } else {
            favoriteQuotes
                .sort((a, b) => b.timestamp - a.timestamp)
                .forEach(quote => {
                    const quoteElement = document.createElement('div');
                    quoteElement.className = 'favorite-quote';
                    quoteElement.innerHTML = `
                        <button class="remove-favorite">x</button>
                        <p class="quote-text">${quote.quote}</p>
                        <p class="quote-author">- ${quote.author}</p>
                    `;

                    quoteElement.querySelector('.remove-favorite').addEventListener('click', () => {
                        const index = favoriteQuotes.findIndex(q => 
                            q.quote === quote.quote && 
                            q.author === quote.author
                        );
                        
                        if (index !== -1) {
                            favoriteQuotes.splice(index, 1);
                            if (typeof chrome !== "undefined" && chrome.storage?.local) {
                                chrome.storage.local.set({ favoriteQuotes: favoriteQuotes });
                            }
                            quoteElement.remove();
                            updateFavoriteButtonUI();

                            if (favoriteQuotes.length === 0) {
                                favoritesList.innerHTML = '<p style="text-align: center; color: #95a5a6;">No favorite quotes yet.</p>';
                            }
                        }
                    });

                    favoritesList.appendChild(quoteElement);
                });
        }

        favoritesModal.style.display = 'block';
    }

    function fetchQuote() {
        if (isFirstTimeToday) {
            // If it's the first time today, show loading
            hideQuoteBox();
        } else if (currentMood) {
            // Else, update quote based on mood
            updateMoodQuote(currentMood);
        }
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

         // Update favorite button status
         updateFavoriteButtonUI();
    }

    // Add event listeners for favorite button and modal
     favoriteBtn.addEventListener('click', toggleFavorite);
     viewFavoritesBtn.addEventListener('click', showFavorites);
     closeModalBtn.addEventListener('click', () => {
         favoritesModal.style.display = 'none';
     });
 
     window.addEventListener('click', (event) => {
         if (event.target === favoritesModal) {
             favoritesModal.style.display = 'none';
         }
     });

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
                isFirstTimeToday = false; 
                updateMoodQuote(currentMood);
            });
        });
    }

    function checkQuoteStorage() {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.get("quoteData", function (result) {
                const now = new Date();
                if (result.quoteData && result.quoteData.date === now.toDateString()) {
                    isFirstTimeToday = false;
                    currentMood = result.quoteData.mood;
                    
                    showQuoteBox();
                    updateUI(result.quoteData);
                    
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

    function initSpotifyWidget() {
        const spotifyPlayer = document.getElementById('spotifyPlayer');
        const spotifyLoader = document.getElementById('spotifyLoader');
    
        // Load Spotify widget
        setTimeout(() => {
            spotifyPlayer.src = "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M";
            
            spotifyPlayer.onload = () => {
                spotifyLoader.style.display = 'none';
                spotifyPlayer.style.opacity = '1';
            };
        }, 100);
    }
    
    // Add toggle view function
    function toggleView() {
        isSpotifyView = !isSpotifyView;
        if (isSpotifyView) {
            moodQuoteSection.style.display = 'none';
            spotifyWidget.style.display = 'block';
            switchButton.innerHTML = '🏠 Back';
            switchButton.classList.add('spotify-active');

            if (!spotifyWidget.dataset.loaded) {
                initSpotifyWidget();
                spotifyWidget.dataset.loaded = 'true';
            }
        } else {
            moodQuoteSection.style.display = 'block';
            spotifyWidget.style.display = 'none';
            switchButton.innerHTML = '🎵 Spotify';
            switchButton.classList.remove('spotify-active');
        }
    }

    function getRandomQuestion() {
        const index = Math.floor(Math.random() * moodQuestions.length);
        return moodQuestions[index];
    }
    
    function updateMoodQuestion() {
        const moodTitle = document.querySelector('.mood-title');
        
        // Check chrome storage for today question
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.get(['lastQuestionDate', 'currentQuestion'], (result) => {
                const today = new Date().toDateString();
                
                if (result.lastQuestionDate !== today) {
                    // If it's a new day, get a new question
                    const newQuestion = getRandomQuestion();
                    moodTitle.textContent = newQuestion;
                    
                    // Save new question and today's date
                    chrome.storage.local.set({
                        lastQuestionDate: today,
                        currentQuestion: newQuestion
                    });
                } else if (result.currentQuestion) {
                    // If it's the same day, use the saved question
                    moodTitle.textContent = result.currentQuestion;
                } else {
                    // If there's no saved question, use a random one
                    moodTitle.textContent = moodQuestions[0];
                }
            });
        } else {
            // Fallback if chrome storage is not available
            moodTitle.textContent = getRandomQuestion();
        }
    }

    // Add event listener for switch button
    switchButton.addEventListener('click', toggleView);

    // Initialize view
    spotifyWidget.style.display = 'none';

    initializeMoodButtons();
    updateDate();
    updateMoodQuestion();
    
    // Lazy load few seconds after DOM content loaded
    setTimeout(() => {
        loadFavoriteQuotes();
        checkQuoteStorage();
        
        // Preload Spotify widget in the background
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.get("preferSpotify", (result) => {
                if (result.preferSpotify) {
                    initSpotifyWidget();
                }
            });
        }
    }, 0);
});