// theme-manager.js

export class ThemeManager {
    constructor() {
        this.themes = [
            {
                name: 'default',
                background: 'theme-gradient-blue',
                animation: 'snowflakes',
                quoteBox: 'quote-box-solid'
            },
            {
                name: 'purple-bubbles',
                background: 'theme-gradient-purple',
                animation: 'bubbles',
                quoteBox: 'quote-box-glass'
            },
            {
                name: 'sunset-sparkles',
                background: 'theme-gradient-sunset',
                animation: 'sparkles',
                quoteBox: 'quote-box-minimal'
            },
            { 
                name: 'valentine', 
                background: 'theme-gradient-valentine', 
                animation: 'hearts', 
                quoteBox: 'quote-box-romantic' 
            }
        ];
        
        // Keep track of animation interval
        this.animationInterval = null;
        this.currentTheme = null;
        this.initializeThemeSelector();
    }

    initializeThemeSelector() {
        // Load saved theme preference
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.get("selectedTheme", (result) => {
                if (result.selectedTheme) {
                    this.currentTheme = this.themes.find(t => t.name === result.selectedTheme);
                    // this.applyTheme();
                } else {
                    // If no saved preference (first install), set valentine theme
                    this.currentTheme = this.themes.find(t => t.name === 'valentine');
                    // Save valentine as the default theme
                    chrome.storage.local.set({ selectedTheme: 'valentine' });
                }
                this.applyTheme();
            });
        } else {
            // Fallback for when chrome.storage is not available
            this.currentTheme = this.themes.find(t => t.name === 'valentine');
            this.applyTheme();
        }

        // Theme toggle button functionality
        const themeToggle = document.getElementById('theme-toggle');
        const themeMenu = document.getElementById('theme-menu');

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                themeMenu.classList.toggle('active');
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!themeToggle.contains(e.target) && !themeMenu.contains(e.target)) {
                themeMenu.classList.remove('active');
            }
        });

        // Theme option selection
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const themeName = option.dataset.theme;
                this.setTheme(themeName);
                themeMenu.classList.remove('active');
            });
        });
    }

    setTheme(themeName) {
        const theme = this.themes.find(t => t.name === themeName);
        if (theme) {
            this.currentTheme = theme;
            // Save theme preference
            if (typeof chrome !== "undefined" && chrome.storage?.local) {
                chrome.storage.local.set({ selectedTheme: themeName });
            }
            this.applyTheme();
        }
    }

    applyTheme() {
        const theme = this.getThemeForDate();
        const body = document.body;
        const quoteBox = document.querySelector('.quote-box');
        const container = document.getElementById('animation-container');
        
        // Clear existing theme classes
        body.className = '';
        if (quoteBox) quoteBox.className = 'quote-box';
        
        // Apply new theme classes
        body.classList.add(theme.background);
        if (quoteBox) quoteBox.classList.add(theme.quoteBox);
        
        // Clear existing animations
        this.clearAnimations();
        
        // Apply new animation
        if (container) {
            container.className = ''; // Clear existing classes
            switch (theme.animation) {
                case 'bubbles':
                    container.className = 'theme-bubbles';
                    this.createBubbles(container);
                    break;
                case 'sparkles':
                    container.className = 'theme-sparkles';
                    this.createSparkles(container);
                    break;
                case 'snowflakes':
                    container.className = 'theme-snowflakes';
                    this.createSnowflakes(container);
                    break;
                case 'hearts':
                    container.className = 'theme-hearts';
                    this.createHearts(container);
                    break;
            }
        }
    }

    getThemeForDate() {
        if (this.currentTheme) {
            return this.currentTheme;
        }

        const date = new Date();
        const dateString = date.toDateString();
        
        let hash = 0;
        for (let i = 0; i < dateString.length; i++) {
            hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
            hash = hash & hash;
        }
        
        const themeIndex = Math.abs(hash) % this.themes.length;
        return this.themes[themeIndex];
    }

    clearAnimations() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        
        const container = document.getElementById('animation-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    createHearts(container) {
        const createHeart = () => {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.animationDuration = `${Math.random() * 5 + 3}s`;
            heart.style.fontSize = `${Math.random() * 30 + 10}px`;
            heart.innerHTML = '♥';
            container.appendChild(heart);

            heart.addEventListener('animationend', () => {
                heart.remove();
            });
        };

        // Initial hearts
        for (let i = 0; i < 30; i++) {
            createHeart();
        }

        // Continuously create new hearts
        this.animationInterval = setInterval(createHeart, 8000);
    }

    createBubbles(container) {
        const createBubble = () => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.style.left = `${Math.random() * 100}%`;
            bubble.style.width = bubble.style.height = `${Math.random() * 30 + 10}px`;
            bubble.style.animationDuration = `${Math.random() * 8 + 4}s`;
            container.appendChild(bubble);

            bubble.addEventListener('animationend', () => {
                bubble.remove();
            });
        };

        // Initial bubbles
        for (let i = 0; i < 30; i++) {
            createBubble();
        }

        // Continuously create new bubbles
        this.animationInterval = setInterval(createBubble, 5000);
    }

    createSparkles(container) {
        const createSparkle = () => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 100}%`;
            sparkle.style.animationDuration = `${Math.random() * 1.5 + 0.5}s`;
            container.appendChild(sparkle);

            sparkle.addEventListener('animationend', () => {
                sparkle.remove();
            });
        };

        // Initial sparkles
        for (let i = 0; i < 30; i++) {
            createSparkle();
        }

        // Continuously create new sparkles
        this.animationInterval = setInterval(createSparkle, 300);
    }

    createSnowflakes(container) {
        const createSnowflake = () => {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.style.left = `${Math.random() * 100}%`;
            snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;
            snowflake.style.opacity = Math.random() * 0.6 + 0.4;
            container.appendChild(snowflake);

            snowflake.addEventListener('animationend', () => {
                snowflake.remove();
            });
        };

        // Initial snowflakes
        for (let i = 0; i < 30; i++) {
            createSnowflake();
        }

        // Continuously create new snowflakes
        this.animationInterval = setInterval(createSnowflake, 10000);
    }
}