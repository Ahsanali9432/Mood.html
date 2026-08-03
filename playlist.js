// ===== SONG ROW SELECT (highlight active row) =====
var songs = document.querySelectorAll(".song");

songs.forEach(function(song) {
    song.addEventListener("click", function() {
        songs.forEach(function(item) {
            item.classList.remove("active");
        });
        song.classList.add("active");
    });
});

// ===== USERNAME IN NAV =====
window.addEventListener('DOMContentLoaded', function() {
    var name = localStorage.getItem('mv_currentUser') || '';
    var hour = new Date().getHours();
    var greet = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    var el = document.getElementById('nav-username');
    if (el) el.textContent = name ? greet + ', ' + name : greet;

    // Pehle se saved favorites ke buttons ko red karo
    restoreFavButtons();
});

// ===== FAVORITES FUNCTIONS =====
function getFavs() {
    try { return JSON.parse(localStorage.getItem('mv_favSongs') || '[]'); }
    catch(e) { return []; }
}

function saveFavs(arr) {
    localStorage.setItem('mv_favSongs', JSON.stringify(arr));
}

function toggleFav(btn, title, artist, icon) {
    var favs = getFavs();
    var idx  = favs.findIndex(function(s){ return s.title === title; });

    if (idx === -1) {
        favs.push({ title: title, artist: artist, icon: icon });
        btn.innerHTML = '&#10084;';
        btn.classList.add('active');
        btn.title = 'Favorites se hatao';
        showToast(title + ' favorites mein add ho gaya! ❤️');
    } else {
        favs.splice(idx, 1);
        btn.innerHTML = '&#9825;';
        btn.classList.remove('active');
        btn.title = 'Favorites mein add karo';
        showToast(title + ' favorites se hata diya');
    }
    saveFavs(favs);
}

function restoreFavButtons() {
    var favs = getFavs();
    var favTitles = favs.map(function(s){ return s.title; });
    document.querySelectorAll('.fav-heart-btn').forEach(function(btn) {
        var onclick = btn.getAttribute('onclick') || '';
        var match = onclick.match(/'([^']+)'/);
        if (match && favTitles.indexOf(match[1]) !== -1) {
            btn.innerHTML = '&#10084;';
            btn.classList.add('active');
            btn.title = 'Favorites se hatao';
        }
    });
}

function showToast(msg) {
    var t = document.getElementById('fav-toast');
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(function(){ t.style.display = 'none'; }, 2500);
}