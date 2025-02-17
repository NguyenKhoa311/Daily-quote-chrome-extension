document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const spotifyPlayer = document.getElementById('spotifyPlayer');
    const spotifyLoader = document.getElementById('spotifyLoader');
    const customSpotifyPlayer = document.getElementById('customSpotifyPlayer');
    const customSpotifyLoader = document.getElementById('customSpotifyLoader');
    const playlistInput = document.getElementById('playlistInput');
    const updatePlaylistBtn = document.getElementById('updatePlaylist');
    const removePlaylistBtn = document.getElementById('removePlaylist');
    const customPlaylistContainer = document.querySelector('.custom-playlist-container');

    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(`${button.dataset.tab}Tab`).classList.add('active');
        });
    });

    // Extract Playlist ID from URL or ID
    function extractPlaylistId(input) {
        if (input.includes('spotify.com/playlist/')) {
            const match = input.match(/playlist\/([a-zA-Z0-9]+)/);
            return match ? match[1] : null;
        }
        if (/^[a-zA-Z0-9]+$/.test(input)) {
            return input;
        }
        return null;
    }

    // Load Custom Playlist
    function loadCustomPlaylist(playlistId) {
        customSpotifyLoader.style.display = 'block';
        customSpotifyPlayer.style.opacity = '0';
        
        const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
        customSpotifyPlayer.src = embedUrl;
        
        customSpotifyPlayer.onload = () => {
            customSpotifyLoader.style.display = 'none';
            customSpotifyPlayer.style.opacity = '1';
            removePlaylistBtn.style.display = 'inline-block';
            
            // Save to storage
            if (typeof chrome !== "undefined" && chrome.storage?.local) {
                chrome.storage.local.set({ customPlaylistId: playlistId });
            }
        };
    }

    // Handle Custom Playlist Update
    updatePlaylistBtn.addEventListener('click', () => {
        const playlistId = playlistInput.value.trim();
        if (playlistId) {
            const extractedId = extractPlaylistId(playlistId);
            if (extractedId) {
                loadCustomPlaylist(extractedId);
            } else {
                alert("Please enter a valid Spotify playlist ID or URL");
            }
        }
    });

    // Handle Remove Playlist
    removePlaylistBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to remove this playlist?')) {
            customSpotifyPlayer.src = '';
            playlistInput.value = '';
            removePlaylistBtn.style.display = 'none';
            
            if (typeof chrome !== "undefined" && chrome.storage?.local) {
                chrome.storage.local.remove("customPlaylistId");
            }
        }
    });

    // Load saved custom playlist if exists
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.get("customPlaylistId", (result) => {
            if (result.customPlaylistId) {
                playlistInput.value = result.customPlaylistId;
                loadCustomPlaylist(result.customPlaylistId);
            }
        });
    }
});