// ===== SIDEBAR STATE =====
var lastSidebarPage = 'home';
var lastSidebarEl   = null;
var sidebarOpen     = true;
var settingsOpen    = false;

// ===== SIDEBAR PAGE NAVIGATION =====
function showPage(name, el) {
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('show'); });
    document.querySelectorAll('.sidebar li').forEach(function(li) { li.classList.remove('active'); });
    document.getElementById('page-' + name).classList.add('show');
    el.classList.add('active');
    lastSidebarPage = name;
    lastSidebarEl   = el;
    if (name === 'favorites') { renderFavoritesPage(); renderFavoritesHero(); }
}

// ===== HAMBURGER =====
function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    document.getElementById('sidebar').classList.toggle('collapsed', !sidebarOpen);
    if (!sidebarOpen && settingsOpen) {
        settingsOpen = false;
        document.getElementById('settings-panel').classList.remove('open');
    }
}

// ===== SETTINGS PANEL =====
function toggleSettings() {
    if (!sidebarOpen) {
        sidebarOpen = true;
        document.getElementById('sidebar').classList.remove('collapsed');
    }
    settingsOpen = !settingsOpen;
    document.getElementById('settings-panel').classList.toggle('open', settingsOpen);
}

// =====================================================================
// ===== YOUTUBE DATA API v3 — YAHAN APNI KEY PASTE KARO ===============
// =====================================================================
var YT_API_KEY = "AIzaSyDfOvhHwJRsCDzFbUXcdIV_EXB6e-sgrsQ";
// =====================================================================

var MOOD_KEYWORDS = {
    happy:        ['top happy songs', 'best happy feel good songs'],
    sad:          ['top sad songs', 'best sad heartbreak songs'],
    energetic:    ['top energetic songs', 'best workout high energy songs'],
    romantic:     ['top romantic love songs', 'best romantic hits'],
    sleep:        ['best sleep music relaxing', 'top sleep songs calm'],
    lofi:         ['top lofi chill beats', 'best lofi study music'],
    broken:       ['top broken heart sad songs', 'best heartbreak songs'],
    love:         ['top love songs best hits', 'best mohabbat songs'],
    gym:          ['top gym workout songs', 'best gym music hits'],
    motivation:   ['top motivational songs', 'best motivation music hits'],
    calm:         ['top calm relaxing music', 'best calm songs'],
    morning:      ['top morning vibes songs', 'best morning music'],
    party:        ['top party songs hits', 'best party music'],
    hiphop:       ['top hip hop songs', 'best hip hop hits'],
    hollywood:    ['top hollywood songs', 'best hollywood music hits'],
    punjabi:      ['top punjabi songs', 'best punjabi hits'],
    rock:         ['top rock songs', 'best rock music hits'],
    pop:          ['top pop songs hits', 'best pop music'],
    jazz:         ['top jazz songs', 'best jazz music'],
    classical:    ['top classical music', 'best classical songs'],
    study:        ['top study focus music', 'best study songs'],
    meditation:   ['top meditation music', 'best meditation songs'],
    yoga:         ['top yoga music', 'best yoga songs'],
    nightdrive:   ['top night drive music', 'best night drive songs'],
    dance:        ['top dance songs hits', 'best dance music'],
    running:      ['top running workout music', 'best running songs'],
    roadtrip:     ['top road trip songs', 'best road trip music'],
    marathi:      ['top marathi songs', 'best marathi hits'],
    kpop:         ['top kpop songs', 'best kpop hits'],
    urdu:         ['top urdu songs', 'best urdu music'],
    sindhi:       ['top sindhi songs', 'best sindhi music'],
    pashto:       ['top pashto songs', 'best pashto music'],
    cooking:      ['top cooking music songs', 'best cooking playlist'],
    cleaning:     ['top cleaning motivation music', 'best cleaning songs'],
    walking:      ['top walking music songs', 'best walking playlist'],
    tired:        ['top relaxing tired music', 'best rest songs'],
    angry:        ['top anger release music', 'best angry songs'],
    devotional:   ['top devotional songs', 'best devotional music'],
    rainyday:     ['top rainy day music', 'best rain songs'],
    funny:        ['top funny songs', 'best comedy music'],

    tophappy:     ['most popular happy songs all time', 'top happy songs highest views'],
    topsad:       ['most popular sad songs all time', 'top sad songs highest views'],
    topenergetic: ['most popular energetic songs all time', 'top high energy songs highest views'],

    trending:     ['trending songs 2025', 'viral hit songs 2025', 'top chart songs this week'],
    viralhits:    ['viral hit songs 2025', 'most viral songs trending'],
    top50:        ['top 50 songs 2025', 'top chart songs'],
    hotnow:       ['hot songs right now 2025', 'trending music now'],
    chartbusters: ['chart topper songs 2025', 'billboard hits songs'],

    latest:       ['new songs 2025', 'latest released songs 2025', 'new music 2025'],
    justadded:    ['new songs released 2025', 'latest new songs'],
    newsingles:   ['new single songs 2025', 'latest singles 2025'],
    newalbums:    ['new album songs 2025', 'latest album music 2025'],
};

function getSearchKeywordsForMood(mood) {
    if (MOOD_KEYWORDS[mood] && MOOD_KEYWORDS[mood].length) return MOOD_KEYWORDS[mood];
    var info = moodMap[mood];
    var base = (info && info.title) ? info.title.replace(/[^a-zA-Z ]/g, '').trim() : mood;
    if (!base) base = mood;
    return [base + ' songs', base + ' music'];
}

// ===== SONGS CACHE =====
var SONGS_CACHE_KEY = 'mv_moodSongsCache';
var SONGS_CACHE_TTL_DEFAULT = 24 * 60 * 60 * 1000;

function getCacheTTL(mood) {
    return SONGS_CACHE_TTL_DEFAULT;
}

function getSongsCache() {
    try { return JSON.parse(localStorage.getItem(SONGS_CACHE_KEY) || '{}'); }
    catch (e) { return {}; }
}

function saveSongsCacheEntry(mood, songs) {
    try {
        var cache = getSongsCache();
        cache[mood] = { songs: songs, time: Date.now() };
        localStorage.setItem(SONGS_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {}
}

function getCachedSongs(mood) {
    var cache = getSongsCache();
    var entry = cache[mood];
    if (!entry || (Date.now() - entry.time) > getCacheTTL(mood)) return null;
    return entry.songs;
}

var moodSongs        = {};
var moodKeywordIndex = {};

function searchVideosForMood(mood, keywordIndex, callback) {
    var keywords = getSearchKeywordsForMood(mood);
    if (keywordIndex >= keywords.length) { callback([]); return; }

    if (!YT_API_KEY || YT_API_KEY.indexOf('YAHAN_APNI') !== -1) {
        console.warn('YT_API_KEY set nahi ki gayi.');
        callback([]);
        return;
    }

    var q = keywords[keywordIndex];
    searchYouTubeRaw(q, function(songs) {
        console.log('[MoodVibe] ' + songs.length + ' songs mili "' + q + '" [' + mood + ']');
        callback(songs);
    }, mood);
}

function getMoodSearchType(mood) {
    var latestMoods  = ['latest','justadded','newsingles','newalbums'];
    var trendingMoods = ['trending','viralhits','hotnow','chartbusters','top50'];
    if (latestMoods.indexOf(mood) !== -1)  return 'latest';
    if (trendingMoods.indexOf(mood) !== -1) return 'trending';
    return 'top';
}

function sevenDaysAgoISO() {
    var d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString();
}

function searchYouTubeRaw(query, callback, moodHint) {
    query = (query || '').trim();
    if (!query) { callback([]); return; }

    if (!YT_API_KEY || YT_API_KEY.indexOf('YAHAN_APNI') !== -1) {
        callback([]);
        return;
    }

    var searchType = moodHint ? getMoodSearchType(moodHint) : 'search';

    var order = 'relevance';
    if (searchType === 'top')      order = 'viewCount';
    if (searchType === 'latest')   order = 'date';
    if (searchType === 'trending') order = 'viewCount';

    var url = 'https://www.googleapis.com/youtube/v3/search'
        + '?part=snippet&type=video&maxResults=50'
        + '&videoEmbeddable=true'
        + '&order=' + order
        + '&q=' + encodeURIComponent(query)
        + '&key=' + encodeURIComponent(YT_API_KEY);

    if (searchType === 'latest') {
        var d = new Date();
        d.setDate(d.getDate() - 30);
        url += '&publishedAfter=' + d.toISOString();
    }
    if (searchType === 'trending') {
        url += '&publishedAfter=' + sevenDaysAgoISO();
    }

    console.log('[MoodVibe] Search [' + searchType + ']: "' + query + '"');

    fetch(url)
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (!data.items || data.items.length === 0) {
                if (searchType === 'search') {
                    _searchWithoutEmbedFilter(query, callback);
                } else {
                    callback([]);
                }
                return;
            }
            var songs = data.items
                .filter(function (it) { return it.id && it.id.videoId && it.snippet; })
                .map(function (it) {
                    var sn = it.snippet;
                    var thumb = (sn.thumbnails && (sn.thumbnails.medium || sn.thumbnails.default)) ? (sn.thumbnails.medium || sn.thumbnails.default).url : '';
                    return {
                        videoId: it.id.videoId,
                        title:   sn.title,
                        channel: sn.channelTitle || '',
                        thumb:   thumb
                    };
                });
            fetchDurationsForSongs(songs, callback);
        })
        .catch(function (err) {
            console.error('[MoodVibe] YouTube search API error:', err);
            callback([]);
        });
}

function _searchWithoutEmbedFilter(query, callback) {
    var url = 'https://www.googleapis.com/youtube/v3/search'
        + '?part=snippet&type=video&maxResults=50'
        + '&order=relevance'
        + '&q=' + encodeURIComponent(query)
        + '&key=' + encodeURIComponent(YT_API_KEY);

    fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (!data.items || data.items.length === 0) { callback([]); return; }
            var songs = data.items
                .filter(function(it) { return it.id && it.id.videoId && it.snippet; })
                .map(function(it) {
                    var sn = it.snippet;
                    var thumb = (sn.thumbnails && (sn.thumbnails.medium || sn.thumbnails.default)) ? (sn.thumbnails.medium || sn.thumbnails.default).url : '';
                    return { videoId: it.id.videoId, title: sn.title, channel: sn.channelTitle || '', thumb: thumb };
                });
            _filterEmbeddableSongs(songs, callback);
        })
        .catch(function() { callback([]); });
}

function _filterEmbeddableSongs(songs, callback) {
    if (!songs.length) { callback([]); return; }
    var ids = songs.map(function(s) { return s.videoId; }).join(',');
    var url = 'https://www.googleapis.com/youtube/v3/videos'
        + '?part=status,contentDetails'
        + '&id=' + encodeURIComponent(ids)
        + '&key=' + encodeURIComponent(YT_API_KEY);

    fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            var embeddableIds = {};
            var durMap = {};
            (data.items || []).forEach(function(it) {
                if (it.status && it.status.embeddable === true) {
                    embeddableIds[it.id] = true;
                }
                if (it.contentDetails && it.contentDetails.duration) {
                    durMap[it.id] = formatISODuration(it.contentDetails.duration);
                }
            });
            var filtered = songs.filter(function(s) { return embeddableIds[s.videoId]; });
            filtered.forEach(function(s) { s.duration = durMap[s.videoId] || ''; });
            callback(filtered);
        })
        .catch(function() {
            fetchDurationsForSongs(songs, callback);
        });
}

function fetchDurationsForSongs(songs, callback) {
    if (!songs.length) { callback(songs); return; }

    var ids = songs.map(function (s) { return s.videoId; }).join(',');
    var url = 'https://www.googleapis.com/youtube/v3/videos'
        + '?part=contentDetails'
        + '&id=' + encodeURIComponent(ids)
        + '&key=' + encodeURIComponent(YT_API_KEY);

    fetch(url)
        .then(function (res) { return res.json(); })
        .then(function (data) {
            var durMap = {};
            (data.items || []).forEach(function (it) {
                if (it.id && it.contentDetails && it.contentDetails.duration) {
                    durMap[it.id] = formatISODuration(it.contentDetails.duration);
                }
            });
            songs.forEach(function (s) {
                s.duration = durMap[s.videoId] || '';
            });
            callback(songs);
        })
        .catch(function (err) {
            console.warn('[MoodVibe] Duration fetch error:', err);
            callback(songs);
        });
}

function formatISODuration(iso) {
    var match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '');
    if (!match) return '';
    var h = parseInt(match[1] || 0, 10);
    var m = parseInt(match[2] || 0, 10);
    var s = parseInt(match[3] || 0, 10);
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    if (h > 0) return h + ':' + pad(m) + ':' + pad(s);
    return m + ':' + pad(s);
}

var searchLoadToken = 0;

function performGlobalSearch(query) {
    query = (query || '').trim();
    if (!query) return;

    var token = ++searchLoadToken;

    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('show'); });
    document.querySelectorAll('.sidebar li').forEach(function(li) { li.classList.remove('active'); });
    document.getElementById('page-search').classList.add('show');
    closeAllHeaderControls();

    currentMood      = 'search';
    currentSongIndex = -1;
    moodLoadToken++;

    var titleEl = document.getElementById('search-result-title');
    var subEl   = document.getElementById('search-result-sub');
    var listEl  = document.getElementById('search-song-list');
    if (titleEl) titleEl.textContent = '🔍 "' + query + '" search ho raha hai...';
    if (subEl)   subEl.textContent   = '';
    if (listEl)  listEl.innerHTML    = '<div class="song-item"><div class="song-info"><div class="song-title">Loading...</div></div></div>';
    restoreSearchHeaderIcon();

    _searchAllSongs(query, function(allSongs) {
        if (token !== searchLoadToken) return;

        if (!allSongs || allSongs.length === 0) {
            if (titleEl) titleEl.textContent = '⚠️ "' + query + '" ke liye koi gaana nahi mila';
            if (subEl)   subEl.textContent   = '';
            if (listEl)  listEl.innerHTML    = '';
            currentPlaylistSongs = [];
            return;
        }

        allSongs.forEach(function(s) { s.ytOnly = false; });
        currentPlaylistSongs = allSongs;
        currentSongIndex     = -1;

        renderSearchSongList(allSongs);

        if (titleEl) titleEl.textContent = '🔍 ' + query;
        if (subEl)   subEl.textContent   = allSongs.length + ' songs mile';
        saveHistory('search', { icon: '🔍', title: query });
    });
}

function _searchAllSongs(query, callback) {
    var url = 'https://www.googleapis.com/youtube/v3/search'
        + '?part=snippet&type=video&maxResults=50'
        + '&order=relevance'
        + '&q=' + encodeURIComponent(query)
        + '&key=' + encodeURIComponent(YT_API_KEY);

    fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (!data.items || !data.items.length) { callback([]); return; }
            var songs = data.items
                .filter(function(it) { return it.id && it.id.videoId && it.snippet; })
                .map(function(it) {
                    var sn = it.snippet;
                    var thumb = (sn.thumbnails && (sn.thumbnails.medium || sn.thumbnails.default))
                        ? (sn.thumbnails.medium || sn.thumbnails.default).url : '';
                    return { videoId: it.id.videoId, title: sn.title, channel: sn.channelTitle || '', thumb: thumb };
                });
            fetchDurationsForSongs(songs, callback);
        })
        .catch(function() { callback([]); });
}

function restoreSearchHeaderIcon() {
    var page = document.getElementById('page-search');
    if (!page) return;
    var wrap = page.querySelector('.header-icon-wrap');
    if (!wrap) return;
    var bigIcon = wrap.querySelector('.big-icon');
    if (bigIcon) bigIcon.innerHTML = '🔍';
    var header = page.querySelector('.mood-detail-header');
    if (header) {
        header.classList.remove('song-active');
        moveControlsBackToWrap(header);
        var favBtn = header.querySelector('.header-fav-btn');
        if (favBtn) favBtn.removeAttribute('data-songfavkey');
    }
}

function renderSearchSongList(songs) {
    var songList = document.getElementById('search-song-list');
    if (!songList) return;

    if (songs.length === 0) {
        songList.innerHTML = '<div class="song-item"><div class="song-info"><div class="song-title">Koi related song nahi mila</div></div></div>';
        return;
    }

    songList.innerHTML = songs.map(function(s, i) {
        var thumbHtml = s.thumb
            ? '<img class="song-thumb-click" data-index="' + i + '" src="' + s.thumb + '" style="width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;cursor:pointer;">'
            : '<div class="song-img song-thumb-click" data-index="' + i + '" style="cursor:pointer;">🎵</div>';

        var isActive = (i === currentSongIndex);
        var favKeys  = getFavSongIds();
        var songFavKey = 'search:' + s.videoId;
        var isFav    = favKeys.indexOf(songFavKey) !== -1;

        if (s.ytOnly) {
            return '<div class="song-item song-item--ytonly" data-index="' + i + '">'
                + '<span class="song-num">' + (i + 1) + '</span>'
                + (s.thumb ? '<img src="' + s.thumb + '" style="width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;">' : '<div class="song-img">🎵</div>')
                + '<div class="song-info">'
                    + '<div class="song-title">' + escapeHtml(s.title) + '</div>'
                    + '<div class="song-sub">' + escapeHtml(s.channel) + (s.duration ? ' • ' + s.duration : '') + ' <span style="color:#ff4444;font-weight:700;font-size:10px;">• YouTube Only</span></div>'
                + '</div>'
                + '<div class="song-row-controls">'
                    + '<button class="yt-open-btn" onclick="openYtPopup(\'' + s.videoId + '\',\'' + escapeHtml(s.title).replace(/'/g,'') + '\')">▶ Play</button>'
                + '</div>'
            + '</div>';
        }

        var rowPlayIcon = (isActive && isCurrentlyPlaying()) ? '⏸' : '▶';
        return '<div class="song-item' + (isActive ? ' active' : '') + '" data-index="' + i + '">'
            + '<span class="song-num">' + (i + 1) + '</span>'
            + thumbHtml
            + '<div class="song-info song-thumb-click" data-index="' + i + '" style="cursor:pointer;">'
                + '<div class="song-title">' + escapeHtml(s.title) + '</div>'
                + '<div class="song-sub">' + escapeHtml(s.channel) + (s.duration ? ' • ' + s.duration : '') + '</div>'
            + '</div>'
            + '<div class="song-row-controls">'
                + '<button class="row-ctrl-btn row-prev-btn" data-index="' + i + '" title="Previous">⏮</button>'
                + '<button class="row-ctrl-btn row-play-btn" data-index="' + i + '" title="Play/Pause">' + rowPlayIcon + '</button>'
                + '<button class="row-ctrl-btn row-next-btn" data-index="' + i + '" title="Next">⏭</button>'
                + '<button class="row-ctrl-btn row-fav-btn' + (isFav ? ' active' : '') + '" data-index="' + i + '" data-favkey="' + songFavKey + '" title="Favorite">' + (isFav ? '❤' : '♡') + '</button>'
            + '</div>'
        + '</div>';
    }).join('');

    attachSongRowEvents(songList);
}

function _loadMoodSongs(mood) {
    var token = moodLoadToken;
    resolveMoodSongs(mood, function(songs) {
        if (token !== moodLoadToken) return;
        if (!songs || songs.length === 0) {
            var titleEl = document.querySelector('.playlist-title');
            if (titleEl) titleEl.textContent = '⚠️ Is mood ki koi gaana nahi mil saka.';
            return;
        }
        currentPlaylistSongs = songs;
        currentSongIndex = -1;
        renderSongListForMood(mood, songs);
    });
}

function resolveMoodSongs(mood, onReady) {
    if (moodSongs[mood] && moodSongs[mood].length) { onReady(moodSongs[mood]); return; }

    var cached = getCachedSongs(mood);
    if (cached && cached.length) {
        moodSongs[mood] = cached;
        onReady(cached);
        return;
    }

    var ki = moodKeywordIndex[mood] || 0;
    searchVideosForMood(mood, ki, function (songs) {
        moodKeywordIndex[mood] = ki + 1;
        if (songs.length === 0) {
            var keywords = getSearchKeywordsForMood(mood);
            if (ki + 1 < keywords.length) {
                resolveMoodSongs(mood, onReady);
            } else {
                onReady([]);
            }
            return;
        }
        moodSongs[mood] = songs;
        saveSongsCacheEntry(mood, songs);
        onReady(songs);
    });
}

// ===== YOUTUBE PLAYER =====
var ytPlayer    = null;
var ytReady     = false;
var pendingMood = null;
var currentPlaylistSongs = [];
var moodLoadToken = 0;

function onYouTubeIframeAPIReady() {
    ytReady = true;
    initYTPlayer();
}

function initYTPlayer() {
    if (ytPlayer) return;

    var frame = document.getElementById('yt-player-frame');
    if (!frame) {
        frame = document.createElement('div');
        frame.id = 'yt-player-frame';
        frame.style.cssText = 'position:fixed;bottom:-10px;right:-10px;width:1px;height:1px;opacity:0;pointer-events:none;';
        document.body.appendChild(frame);
    }

    ytPlayer = new YT.Player('yt-player-frame', {
        height: '1',
        width:  '1',
        playerVars: {
            autoplay: 1,
            origin:   window.location.origin || 'http://localhost'
        },
        events: {
            onReady: function() {
                if (pendingMood) {
                    _loadMoodSongs(pendingMood);
                    pendingMood = null;
                }
            },
            onStateChange: function(e) {
                updateAllPlayButtons(e.data === YT.PlayerState.PLAYING);
                refreshRowPlayButtons();
                syncHeaderControlState();
                syncNowPlayingMiniCard();

                if (e.data === YT.PlayerState.PLAYING) {
                    startProgressTracking();
                } else {
                    stopProgressTracking();
                }

                if (e.data === YT.PlayerState.ENDED) {
                    resetProgressUI();
                    nextTrack();
                }

                if (e.data === YT.PlayerState.BUFFERING || e.data === -1) {
                    clearTimeout(window._stuckTimer);
                    window._stuckTimer = setTimeout(function() {
                        if (!ytPlayer) return;
                        var st = ytPlayer.getPlayerState();
                        if (st === YT.PlayerState.BUFFERING || st === -1) {
                            var bad = currentPlaylistSongs[currentSongIndex];
                            if (bad) {
                                showSkipToast('⏭ Song load nahi hua, skip ho raha hai...');
                                bad.ytOnly = true;
                                _refreshCurrentSongList();
                                var nextIdx = -1;
                                for (var i = 1; i <= currentPlaylistSongs.length; i++) {
                                    var idx = (currentSongIndex + i) % currentPlaylistSongs.length;
                                    if (!currentPlaylistSongs[idx].ytOnly) { nextIdx = idx; break; }
                                }
                                if (nextIdx !== -1) {
                                    setTimeout(function() { playVideoAtIndex(nextIdx); }, 300);
                                }
                            }
                        }
                    }, 5000);
                } else {
                    clearTimeout(window._stuckTimer);
                }
            },
            onError: function(e) {
                var bad = currentPlaylistSongs[currentSongIndex];
                console.warn('[MoodVibe] Error Code:', e.data, bad && bad.videoId);

                if (!bad) return;

                bad.ytOnly = true;

                _refreshCurrentSongList();

                var nextIdx = -1;
                for (var i = 1; i <= currentPlaylistSongs.length; i++) {
                    var idx = (currentSongIndex + i) % currentPlaylistSongs.length;
                    if (!currentPlaylistSongs[idx].ytOnly) { nextIdx = idx; break; }
                }

                if (nextIdx !== -1) {
                    setTimeout(function() { playVideoAtIndex(nextIdx); }, 300);
                }
            }
        }
    });
}

function _refreshCurrentSongList() {
    if (currentMood === 'search') {
        renderSearchSongList(currentPlaylistSongs);
    } else if (currentMood === 'favorites') {
        renderFavoritesHero();
    } else if (currentMood && currentMood.indexOf('artist_') === 0) {
        var sl = document.getElementById('artist-song-list');
        if (sl && currentPlaylistSongs.length) attachSongRowEvents(sl);
    } else if (currentMood) {
        renderSongListForMood(currentMood, currentPlaylistSongs);
    }
}

function playYouTubePlaylist(mood) {
    var info = moodMap[mood] || { icon: '🎵', title: mood };
    var titleEl = document.querySelector('.playlist-title');
    if (titleEl) titleEl.textContent = info.icon + ' ' + info.title;

    currentMood = mood;
    moodLoadToken++;

    if (!ytPlayer || typeof ytPlayer.loadVideoById !== 'function') {
        pendingMood = null;
        if (!document.getElementById('yt-api-script')) {
            var tag = document.createElement('script');
            tag.id  = 'yt-api-script';
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
        }
        resolveMoodSongs(mood, function(songs) {
            if (songs && songs.length) {
                currentPlaylistSongs = songs;
                currentSongIndex = -1;
                renderSongListForMood(mood, songs);
            }
        });
        saveHistory(mood, info);
        return;
    }

    _loadMoodSongs(mood);
    saveHistory(mood, info);
}

function renderSongListForMood(mood, songs) {
    var pageId = (dedicatedPages.indexOf(mood) !== -1) ? ('page-mood-' + mood) : 'page-mood-default';
    var page = document.getElementById(pageId);
    if (!page) return;
    var songList = page.querySelector('.song-list');
    if (!songList) return;

    if (!songs || songs.length === 0) {
        songList.innerHTML = '<div class="song-item"><div class="song-info"><div class="song-title">Koi song nahi mili</div></div></div>';
        return;
    }

    songList.innerHTML = songs.map(function(s, i) {
        var thumbHtml = s.thumb
            ? '<img class="song-thumb-click" data-index="' + i + '" src="' + s.thumb + '" style="width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;cursor:pointer;">'
            : '<div class="song-img song-thumb-click" data-index="' + i + '" style="cursor:pointer;">🎵</div>';
        var isActive = (i === currentSongIndex);
        var rowPlayIcon = (isActive && isCurrentlyPlaying()) ? '⏸' : '▶';
        var favKeys = getFavSongIds();
        var songFavKey = mood + ':' + s.videoId;
        var isFav = favKeys.indexOf(songFavKey) !== -1;

        if (s.ytOnly) {
            return '<div class="song-item song-item--ytonly" data-index="' + i + '">'
                + '<span class="song-num">' + (i + 1) + '</span>'
                + (s.thumb ? '<img src="' + s.thumb + '" style="width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;">' : '<div class="song-img">🎵</div>')
                + '<div class="song-info">'
                    + '<div class="song-title">' + escapeHtml(s.title) + '</div>'
                    + '<div class="song-sub">' + escapeHtml(s.channel) + (s.duration ? ' • ' + s.duration : '') + ' <span style="color:#ff4444;font-weight:700;font-size:10px;">• YouTube Only</span></div>'
                + '</div>'
                + '<div class="song-row-controls">'
                    + '<button class="yt-open-btn" onclick="openYtPopup(\'' + s.videoId + '\',\'' + escapeHtml(s.title).replace(/'/g,'') + '\')">▶ Play</button>'
                + '</div>'
            + '</div>';
        }

        return '<div class="song-item' + (isActive ? ' active' : '') + '" data-index="' + i + '">'
            + '<span class="song-num">' + (i + 1) + '</span>'
            + thumbHtml
            + '<div class="song-info song-thumb-click" data-index="' + i + '" style="cursor:pointer;">'
                + '<div class="song-title">' + escapeHtml(s.title) + '</div>'
                + '<div class="song-sub">' + escapeHtml(s.channel) + (s.duration ? ' • ' + s.duration : '') + '</div>'
            + '</div>'
            + '<div class="song-row-controls">'
                + '<button class="row-ctrl-btn row-prev-btn" data-index="' + i + '" title="Previous">⏮</button>'
                + '<button class="row-ctrl-btn row-play-btn" data-index="' + i + '" title="Play/Pause">' + rowPlayIcon + '</button>'
                + '<button class="row-ctrl-btn row-next-btn" data-index="' + i + '" title="Next">⏭</button>'
                + '<button class="row-ctrl-btn row-fav-btn' + (isFav ? ' active' : '') + '" data-index="' + i + '" data-favkey="' + songFavKey + '" title="Favorite">' + (isFav ? '❤' : '♡') + '</button>'
            + '</div>'
        + '</div>';
    }).join('');

    attachSongRowEvents(songList);
}

function attachSongRowEvents(songList) {
    songList.querySelectorAll('.song-thumb-click').forEach(function(el) {
        el.addEventListener('click', function() {
            playSpecificSong(parseInt(el.getAttribute('data-index')));
        });
    });
    songList.querySelectorAll('.row-play-btn').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            var i = parseInt(el.getAttribute('data-index'));
            if (i !== currentSongIndex) {
                playSpecificSong(i);
            } else {
                playPause();
            }
        });
    });
    songList.querySelectorAll('.row-next-btn').forEach(function(el) {
        el.addEventListener('click', function(e) { e.stopPropagation(); nextTrack(); });
    });
    songList.querySelectorAll('.row-prev-btn').forEach(function(el) {
        el.addEventListener('click', function(e) { e.stopPropagation(); prevTrack(); });
    });
    songList.querySelectorAll('.row-fav-btn').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            var key = el.getAttribute('data-favkey');
            toggleFavSong(key);
        });
    });
}

function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}

var currentSongIndex = -1;

function isCurrentlyPlaying() {
    return !!(ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() === YT.PlayerState.PLAYING);
}

function playVideoAtIndex(index) {
    var song = currentPlaylistSongs[index];
    if (!song || !ytPlayer || typeof ytPlayer.loadVideoById !== 'function') return;

    if (song.ytOnly) {
        var nextIdx = -1;
        for (var i = 1; i <= currentPlaylistSongs.length; i++) {
            var idx = (index + i) % currentPlaylistSongs.length;
            if (!currentPlaylistSongs[idx].ytOnly) { nextIdx = idx; break; }
        }
        if (nextIdx !== -1 && nextIdx !== index) {
            playVideoAtIndex(nextIdx);
        }
        return;
    }

    resetProgressUI();
    ytPlayer.loadVideoById(song.videoId);
    currentSongIndex = index;
    highlightPlayingSong(index);
    updateNowPlayingMiniCard(song);
    swapHeaderToSong(index);
}

function playSpecificSong(index) {
    playVideoAtIndex(index);
}

function highlightPlayingSong(index) {
    currentSongIndex = index;
    document.querySelectorAll('.song-item').forEach(function(el) {
        el.classList.remove('active');
    });
    var el = document.querySelector('.song-item[data-index="' + index + '"]');
    if (el) el.classList.add('active');
    refreshRowPlayButtons();
    if (currentMood === 'search') renderSearchSongList(currentPlaylistSongs);
    if (currentMood === 'favorites') renderFavoritesHero();
}

function refreshRowPlayButtons() {
    document.querySelectorAll('.row-play-btn').forEach(function(btn) {
        var i = parseInt(btn.getAttribute('data-index'));
        btn.textContent = (i === currentSongIndex && isCurrentlyPlaying()) ? '⏸' : '▶';
    });
}

function moveControlsForSongActive(header) {
    var controls = header.querySelector('.header-controls');
    if (controls && controls.parentNode !== header) {
        header.appendChild(controls);
    }
}

function moveControlsBackToWrap(header) {
    var wrap = header.querySelector('.header-icon-wrap');
    var controls = header.querySelector('.header-controls');
    if (controls && wrap && controls.parentNode !== wrap) {
        wrap.appendChild(controls);
    }
}

function updateHomeNowPlaying(song) {
    updateNowPlayingMiniCard(song);
}

function swapHeaderToSong(index) {
    var song = currentPlaylistSongs[index];
    if (!song) return;

    var page = document.querySelector('.page.show');
    if (!page) return;

    if (page.id === 'page-search') {
        var snpBar  = document.getElementById('search-now-playing');
        var snpArt  = document.getElementById('snp-art');
        var snpTitle = document.getElementById('search-result-title');
        var snpSub   = document.getElementById('search-result-sub');
        if (snpBar) snpBar.classList.add('is-playing');
        if (snpArt) {
            snpArt.innerHTML = song.thumb
                ? '<img src="' + song.thumb + '" alt="">'
                : '<div style="font-size:22px;">🎵</div>';
        }
        if (snpTitle) snpTitle.textContent = song.title || '';
        if (snpSub)   snpSub.textContent   = song.channel || '';
        updateNowPlayingMiniCard(song);
        _syncSnpProgress();
        return;
    }

    if (page.id === 'page-artist-detail') {
        updateNowPlayingMiniCard(song);
        syncHeaderControlState();
        updateProgressUI();
        return;
    }

    if (page.id === 'page-favorites') {
        updateNowPlayingMiniCard(song);
        return;
    }

    var header = page.querySelector('.mood-detail-header');
    if (!header) return;
    var wrap = header.querySelector('.header-icon-wrap');
    if (!wrap) return;
    var bigIcon = wrap.querySelector('.big-icon');
    if (bigIcon) {
        if (song.thumb) {
            bigIcon.innerHTML = '<img src="' + song.thumb + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">';
        } else {
            bigIcon.textContent = '🎵';
        }
    }
    var titleEl = header.querySelector('h1');
    var subEl   = header.querySelector('p');
    if (titleEl) titleEl.textContent = song.title;
    if (subEl)   subEl.textContent   = song.channel || '';
    header.classList.add('song-active');
    moveControlsForSongActive(header);
    updateHomeNowPlaying(song);
    var favBtn = header.querySelector('.header-fav-btn');
    if (favBtn) {
        var songFavKey = (currentMood || '') + ':' + song.videoId;
        favBtn.setAttribute('data-songfavkey', songFavKey);
        var isFav = getFavSongIds().indexOf(songFavKey) !== -1;
        favBtn.classList.toggle('active', isFav);
        favBtn.textContent = isFav ? '❤' : '♡';
    }
    syncHeaderControlState();
    ensureProgressBar(header);
    updateProgressUI();
}

function restoreHeaderToMood(mood) {
    var info = moodMap[mood] || { icon: '🎵', title: 'Playlist', sub: '' };
    var page = document.querySelector('.page.show');
    if (!page) return;
    var header = page.querySelector('.mood-detail-header');
    if (!header) return;
    var wrap = header.querySelector('.header-icon-wrap');
    if (!wrap) return;
    var bigIcon = wrap.querySelector('.big-icon');
    if (bigIcon) bigIcon.innerHTML = info.icon;
    var titleEl = header.querySelector('h1');
    var subEl   = header.querySelector('p');
    if (titleEl) titleEl.textContent = info.title;
    if (subEl)   subEl.textContent   = info.sub || '';
    header.classList.remove('song-active');
    moveControlsBackToWrap(header);
    updateHomeNowPlaying(null);
    resetProgressUI();
    var favBtn = header.querySelector('.header-fav-btn');
    if (favBtn) favBtn.removeAttribute('data-songfavkey');
}

function getFavSongIds() {
    try { return JSON.parse(localStorage.getItem('mv_favSongIds') || '[]'); }
    catch(e) { return []; }
}

function saveFavSongIds(arr) {
    localStorage.setItem('mv_favSongIds', JSON.stringify(arr));
}

function getFavSongsList() {
    try { return JSON.parse(localStorage.getItem('mv_favSongsList') || '[]'); }
    catch(e) { return []; }
}

function saveFavSongsList(list) {
    localStorage.setItem('mv_favSongsList', JSON.stringify(list));
}

function lookupSongByFavKey(key) {
    var sep = key.indexOf(':');
    if (sep === -1) return null;
    var mood    = key.substring(0, sep);
    var videoId = key.substring(sep + 1);

    var pool = (moodSongs[mood] || []).concat(currentPlaylistSongs || []);
    var found = null;
    for (var i = 0; i < pool.length; i++) {
        if (pool[i].videoId === videoId) { found = pool[i]; break; }
    }
    if (!found) return null;

    return {
        key:     key,
        mood:    mood,
        videoId: videoId,
        title:   found.title,
        channel: found.channel || '',
        thumb:   found.thumb || ''
    };
}

function toggleFavSong(key) {
    if (!key) return;
    var favs = getFavSongIds();
    var idx  = favs.indexOf(key);
    var list = getFavSongsList();

    if (idx === -1) {
        favs.push(key);
        list = list.filter(function(item) { return item.key !== key; });
        var songData = lookupSongByFavKey(key);
        if (songData) list.unshift(songData);
        showFavToast('Song favorites mein add ho gaya! ❤️');
    } else {
        favs.splice(idx, 1);
        list = list.filter(function(item) { return item.key !== key; });
        showFavToast('Song favorites se hata diya');
    }
    saveFavSongIds(favs);
    saveFavSongsList(list);

    document.querySelectorAll('.row-fav-btn[data-favkey="' + key + '"]').forEach(function(btn) {
        var active = favs.indexOf(key) !== -1;
        btn.classList.toggle('active', active);
        btn.textContent = active ? '❤' : '♡';
    });

    var headerFavBtn = document.querySelector('.header-fav-btn[data-songfavkey="' + key + '"]');
    if (headerFavBtn) {
        var active = favs.indexOf(key) !== -1;
        headerFavBtn.classList.toggle('active', active);
        headerFavBtn.textContent = active ? '❤' : '♡';
    }

    renderFavoritesHero();
    renderFavoritesPage();
}

// =====================================================================
// ===== UPDATE: Favorites ab MOOD ke naam se ek "playlist card"    ===
// ===== banati hai (jaise "Sad Playlist"). Card ki cover picture   ===
// ===== hamesha us mood mein SABSE RECENTLY favorite kiye gaye     ===
// ===== song ki asal thumbnail hoti hai — emoji nahi. Jaise hi us  ===
// ===== mood se koi NAYA song favorite hota hai, cover picture     ===
// ===== khud-ba-khud us naye song ki picture se update ho jaati    ===
// ===== hai. Card par click karne se wahi mood-playlist khulti hai.===
// =====================================================================
function renderFavoritesHero() {
    var container  = document.getElementById('fav-left-list');
    var playerList = document.getElementById('fav-player-list');
    if (!container) return;

    var list = getFavSongsList();

    if (!list.length) {
        container.innerHTML =
            '<div class="fav-empty-hero">' +
                '<div class="fav-empty-hero-icon">🤍</div>' +
                '<p>Abhi koi song favorite nahi hua. Kisi bhi song ke ♡ button par tap karein — uski mood-playlist yahan khud ban jayegi.</p>' +
            '</div>';
        if (playerList) {
            playerList.innerHTML =
                '<div class="fav-empty-hero">' +
                    '<div class="fav-empty-hero-icon">🎵</div>' +
                    '<p>Abhi tak koi favorite nahi. Kisi song ko ♡ karein — playlist yahan bhi dikhegi.</p>' +
                '</div>';
        }
        return;
    }

    var moodsInOrder = [];
    list.forEach(function(item) {
        if (moodsInOrder.indexOf(item.mood) === -1) moodsInOrder.push(item.mood);
    });

    container.innerHTML = moodsInOrder.map(function(mood, i) {
        var songsInMood = list.filter(function(item) { return item.mood === mood; });
        var latest = songsInMood[0];
        var info   = moodMap[mood] || { icon: '🎵', title: mood, sub: '' };
        var sizeClass = (i === 0) ? 'fav-hero' : 'fav-hero fav-hero--sm';
        var imgHtml = latest.thumb
            ? '<img src="' + latest.thumb + '" alt="' + escapeHtml(info.title) + '">'
            : '<div class="fav-hero-placeholder">' + info.icon + '</div>';
        var countLabel = songsInMood.length + (songsInMood.length > 1 ? ' favorite songs' : ' favorite song');

        return '<div class="' + sizeClass + '" onclick="showMood(\'' + mood + '\')">' +
            imgHtml +
            '<div class="fav-hero-overlay"><h2>' + escapeHtml(info.title) + '</h2><p class="fav-hero-count">' + countLabel + '</p></div>' +
        '</div>';
    }).join('');

    // =====================================================================
    // ===== UPDATE: right side ab SIRF ek playlist nahi — left side ki   ===
    // ===== tarah HAR favorited playlist ki apni badi row (picture,      ===
    // ===== emoji+naam, count) dikhti hai, sabse recent sabse UPAR,     ===
    // ===== purani neeche — koi bhi hide/gayab nahi hoti.                ===
    // =====================================================================
    if (playerList) {
        playerList.innerHTML = moodsInOrder.map(function(mood) {
            var songsInMood = list.filter(function(item) { return item.mood === mood; });
            var latest = songsInMood[0];
            var info   = moodMap[mood] || { icon: '🎵', title: mood };
            var thumbHtml = latest.thumb
                ? '<img src="' + latest.thumb + '" alt="">'
                : '<div class="fav-player-thumb-placeholder">' + info.icon + '</div>';
            var countLabel = songsInMood.length + (songsInMood.length > 1 ? ' favorite songs' : ' favorite song');

            return '<div class="fav-player" onclick="showMood(\'' + mood + '\')">' +
                '<div class="fav-player-thumb">' + thumbHtml + '</div>' +
                '<div class="fav-player-info">' +
                    '<h3>' + info.icon + ' ' + escapeHtml(info.title) + '</h3>' +
                    '<p class="fav-player-sub">' + countLabel + ' • Tap to play</p>' +
                '</div>' +
                '<button class="fav-player-btn" onclick="event.stopPropagation(); showMood(\'' + mood + '\');"><i class="fas fa-play"></i></button>' +
            '</div>';
        }).join('');
    }
}

function renderHomeRowThumbs(mood, containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return;

    resolveMoodSongs(mood, function(songs) {
        if (!songs || songs.length === 0) return;

        var otherBtn = container.querySelector('.other-thumb');
        container.querySelectorAll('.thumb-wrap').forEach(function(el) { el.remove(); });

        var picks = songs.slice(0, 4);
        var frag = document.createDocumentFragment();

        picks.forEach(function(s, i) {
            var wrap = document.createElement('div');
            wrap.className = 'thumb-wrap';

            var img = document.createElement('img');
            img.src = s.thumb || '';
            img.alt = s.title || '';
            img.title = s.title || '';
            img.addEventListener('click', function() {
                showMood(mood);
                setTimeout(function() {
                    var idx = currentPlaylistSongs.indexOf(s);
                    if (idx !== -1) playVideoAtIndex(idx);
                }, 600);
            });

            var heart = document.createElement('span');
            heart.className = 'fav-heart fav-heart--corner-sm';
            var favKey = mood + ':' + s.videoId;
            heart.setAttribute('data-songmood', mood);
            heart.setAttribute('data-favkey', favKey);
            var isFav = getFavSongIds().indexOf(favKey) !== -1;
            heart.classList.toggle('active', isFav);
            heart.textContent = isFav ? '❤' : '♡';
            heart.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleFavSong(favKey);
            });

            wrap.appendChild(img);
            wrap.appendChild(heart);
            frag.appendChild(wrap);
        });

        if (otherBtn) {
            container.insertBefore(frag, otherBtn);
        } else {
            container.appendChild(frag);
        }
    });
}

function loadHomeTrendingLatestThumbs() {
    renderHomeRowThumbs('trending', '#home-trending-row');
    renderHomeRowThumbs('latest',   '#home-latest-row');
}

function saveHistory(mood, info) {
    var hist = [];
    try { hist = JSON.parse(localStorage.getItem('mv_history') || '[]'); } catch(e) {}
    var now = new Date();
    hist.unshift({
        mood:  mood,
        icon:  info.icon,
        title: info.title,
        time:  now.toLocaleString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true }),
        date:  now.toLocaleDateString('en-PK')
    });
    if (hist.length > 20) hist = hist.slice(0, 20);
    localStorage.setItem('mv_history', JSON.stringify(hist));
    renderHistory();
}

function renderHistory() {
    var container = document.getElementById('page-history');
    if (!container) return;
    var hist = [];
    try { hist = JSON.parse(localStorage.getItem('mv_history') || '[]'); } catch(e) {}
    container.querySelectorAll('.hist-item.dynamic').forEach(function(el) { el.remove(); });
    var subtitle = container.querySelector('.subtitle');
    hist.forEach(function(h) {
        var div = document.createElement('div');
        div.className = 'hist-item dynamic';
        div.onclick = function() {
            if (h.mood === 'search') {
                var input = document.getElementById('global-search-input');
                if (input) input.value = h.title;
                performGlobalSearch(h.title);
            } else {
                showMood(h.mood);
            }
        };
        div.innerHTML =
            '<div class="hist-icon">' + h.icon + '</div>' +
            '<div class="hist-info">' +
                '<div class="hist-title">' + h.title + '</div>' +
                '<div class="hist-time">' + h.date + ' — ' + h.time + '</div>' +
            '</div>';
        if (subtitle && subtitle.nextSibling) {
            container.insertBefore(div, subtitle.nextSibling);
        } else {
            container.appendChild(div);
        }
    });
}

var moodMap = {
    happy:        {icon:'😊', title:'Happy Playlist',      sub:'Khushi bhare gaane'},
    sad:          {icon:'😢', title:'Sad Playlist',        sub:'Dil ki baat kehne wale gaane'},
    romantic:     {icon:'❤️', title:'Romantic Playlist',   sub:'Pyaar ke gaane'},
    energetic:    {icon:'⚡', title:'Energetic Playlist',  sub:'Full energy boost!'},
    sleep:        {icon:'🌙', title:'Sleep Playlist',      sub:'Sukoon bhari raatein'},
    lofi:         {icon:'🎧', title:'Lofi Playlist',       sub:'Study aur chill beats'},
    broken:       {icon:'💔', title:'Broken Heart',        sub:'Dard ke gaane'},
    love:         {icon:'💚', title:'Love Playlist',       sub:'Mohabbat ke gaane'},
    gym:          {icon:'🏋', title:'Gym Playlist',        sub:'Workout beats'},
    motivation:   {icon:'💪', title:'Motivation',          sub:'Himmat wale gaane'},
    punjabi:      {icon:'🎤', title:'Punjabi Hits',        sub:'Best Punjabi songs'},
    hiphop:       {icon:'🎧', title:'Hip Hop',             sub:'Top Hip Hop tracks'},
    hollywood:    {icon:'🎬', title:'Hollywood',           sub:'Best Hollywood music'},
    marathi:      {icon:'🎵', title:'Marathi Songs',       sub:'Top Marathi hits'},
    rock:         {icon:'🎸', title:'Rock Songs',          sub:'Best Rock tracks'},
    classical:    {icon:'🎹', title:'Classical Music',     sub:'Timeless classical pieces'},
    pop:          {icon:'🥁', title:'Pop Hits',            sub:'Top Pop songs'},
    jazz:         {icon:'🎺', title:'Jazz Collection',     sub:'Smooth jazz tracks'},
    calm:         {icon:'😌', title:'Calm Playlist',       sub:'Sukoon bhare gaane'},
    angry:        {icon:'😤', title:'Angry Playlist',      sub:'Gussa nikalne wale gaane'},
    party:        {icon:'🥳', title:'Party Playlist',      sub:'Party anthems'},
    tired:        {icon:'😴', title:'Tired Playlist',      sub:'Thakaan utarne wale gaane'},
    devotional:   {icon:'🙏', title:'Devotional',          sub:'Ibadat ke gaane'},
    rainyday:     {icon:'🌧️', title:'Rainy Day',           sub:'Baarish ke mausam ke gaane'},
    morning:      {icon:'☀️', title:'Morning Playlist',    sub:'Subah ke fresh gaane'},
    nightdrive:   {icon:'🌃', title:'Night Drive',         sub:'Raat ki drive ke gaane'},
    funny:        {icon:'😂', title:'Funny Songs',         sub:'Hasi mazaak wale gaane'},
    meditation:   {icon:'🧘', title:'Meditation',          sub:'Dhyaan aur shanti ke liye'},
    running:      {icon:'🏃', title:'Running Playlist',    sub:'Daudne ke liye energetic gaane'},
    yoga:         {icon:'🧘‍♀️', title:'Yoga Playlist',    sub:'Yoga ke liye shaant gaane'},
    roadtrip:     {icon:'🚗', title:'Road Trip',           sub:'Safar ke gaane'},
    study:        {icon:'📚', title:'Study Playlist',      sub:'Padhai ke liye focus music'},
    cooking:      {icon:'🍳', title:'Cooking Playlist',    sub:'Khana banate waqt ke gaane'},
    cleaning:     {icon:'🧹', title:'Cleaning Playlist',   sub:'Safai karte waqt ke gaane'},
    walking:      {icon:'🚶', title:'Walking Playlist',    sub:'Walk ke liye gaane'},
    dance:        {icon:'💃', title:'Dance Playlist',      sub:'Dance ke gaane'},
    urdu:         {icon:'🎙️', title:'Urdu Songs',          sub:'Best Urdu music'},
    sindhi:       {icon:'🎵', title:'Sindhi Songs',        sub:'Best Sindhi music'},
    pashto:       {icon:'🎤', title:'Pashto Songs',        sub:'Best Pashto music'},
    kpop:         {icon:'🎧', title:'K-Pop',               sub:'Top K-Pop hits'},
    viralhits:    {icon:'🎵', title:'Viral Hits',          sub:'Sab se zyada chalne wale gaane'},
    top50:        {icon:'🎶', title:'Top 50',              sub:'Top 50 songs is hafte'},
    hotnow:       {icon:'🔥', title:'Hot Now',             sub:'Abhi trend mein'},
    chartbusters: {icon:'📈', title:'Chart Busters',       sub:'Charts pe top gaane'},
    justadded:    {icon:'🆕', title:'Just Added',          sub:'Nayi additions'},
    newsingles:   {icon:'🎤', title:'New Singles',         sub:'Naye singles'},
    newalbums:    {icon:'💿', title:'New Albums',          sub:'Naye albums'},
    trending:     {icon:'🔥', title:'Trending Songs',      sub:'Abhi sab sun rahe hain'},
    latest:       {icon:'🆕', title:'Latest Songs',        sub:'Naye aaye gaane'},
    tophappy:     {icon:'😊', title:'Top Happy Songs',     sub:'Sab se zyada suney gaye khushi ke gaane'},
    topsad:       {icon:'😢', title:'Top Sad Songs',       sub:'Sab se popular sad gaane'},
    topenergetic: {icon:'⚡', title:'Top Energetic Songs', sub:'Sab se popular energy songs'},
    search:       {icon:'🔍', title:'Search',              sub:''},
    favorites:    {icon:'❤️', title:'Favorites',           sub:''}
};

function buildArtistMoodMap() {
    if (typeof artistsData === 'undefined') return;
    artistsData.forEach(function(a) {
        moodMap['artist_' + a.key] = { icon: '🎤', title: a.name, sub: a.genre };
    });
}

var dedicatedPages = ['happy', 'sad', 'romantic', 'energetic', 'sleep', 'lofi'];

function showMood(mood) {
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('show'); });
    document.querySelectorAll('.sidebar li').forEach(function(li) { li.classList.remove('active'); });

    if (dedicatedPages.indexOf(mood) !== -1) {
        document.getElementById('page-mood-' + mood).classList.add('show');
    } else {
        var info = moodMap[mood] || {icon:'🎵', title:'Playlist', sub:'Is mood ke gaane'};
        document.getElementById('default-icon').textContent  = info.icon;
        document.getElementById('default-title').textContent = info.title;
        document.getElementById('default-sub').textContent   = info.sub;
        var dh = document.getElementById('default-fav-heart');
        if (dh) dh.setAttribute('data-mood', mood);
        document.getElementById('page-mood-default').classList.add('show');
    }

    closeAllHeaderControls();
    currentSongIndex = -1;
    restoreHeaderToMood(mood);

    playYouTubePlaylist(mood);
    syncFavButtons();
}

function goBack() {
    var showing = document.querySelector('.page.show');
    if (showing && showing.id === 'page-artist-detail') {
        goBackToArtists();
        return;
    }
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('show'); });
    document.querySelectorAll('.sidebar li').forEach(function(li) { li.classList.remove('active'); });
    document.getElementById('page-' + lastSidebarPage).classList.add('show');
    if (lastSidebarEl) lastSidebarEl.classList.add('active');
    else document.querySelector('.sidebar li').classList.add('active');
}

function playPause() {
    if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function') return;
    var state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
    } else {
        ytPlayer.playVideo();
    }
}

function prevTrack() {
    if (!currentPlaylistSongs.length) return;
    if (currentSongIndex <= 0) return;

    var idx = currentSongIndex - 1;
    while (idx >= 0 && currentPlaylistSongs[idx].ytOnly) idx--;
    if (idx >= 0) playVideoAtIndex(idx);
}

function nextTrack() {
    if (!currentPlaylistSongs.length) return;
    if (currentSongIndex === -1) return;

    var nextIdx = -1;
    for (var i = 1; i <= currentPlaylistSongs.length; i++) {
        var idx = (currentSongIndex + i) % currentPlaylistSongs.length;
        if (!currentPlaylistSongs[idx].ytOnly) { nextIdx = idx; break; }
    }
    if (nextIdx !== -1) playVideoAtIndex(nextIdx);
}

var currentMood = null;

function setupHeaderControls() {
    var headers = document.querySelectorAll('.mood-detail-header');
    headers.forEach(function(header) {
        var existingWrap = header.querySelector('.header-icon-wrap');
        if (existingWrap && existingWrap.querySelector('.header-controls')) {
            ensureProgressBar(header);
            return;
        }

        var bigIcon = header.querySelector('.big-icon');
        if (!bigIcon) return;

        var wrap = existingWrap;
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.className = 'header-icon-wrap';
            bigIcon.parentNode.insertBefore(wrap, bigIcon);
            wrap.appendChild(bigIcon);
        }

        var controls = document.createElement('div');
        controls.className = 'header-controls';
        controls.innerHTML =
            '<button class="header-ctrl-btn header-prev-btn" onclick="event.stopPropagation(); prevTrack();" title="Previous">⏮</button>' +
            '<button class="header-ctrl-btn header-play-btn-big" onclick="event.stopPropagation(); playPause();" title="Play/Pause">▶</button>' +
            '<button class="header-ctrl-btn header-next-btn" onclick="event.stopPropagation(); nextTrack();" title="Next">⏭</button>' +
            '<button class="header-ctrl-btn header-fav-btn" onclick="event.stopPropagation(); toggleHeaderFav(this);" title="Favorite">♡</button>' +
            '<button class="header-cancel-btn" onclick="event.stopPropagation(); closeHeaderControls(this);" title="Close">✕</button>';
        wrap.appendChild(controls);

        wrap.addEventListener('click', function() {
            var hdr = wrap.closest('.mood-detail-header');
            if (hdr && hdr.classList.contains('song-active')) return;
            toggleHeaderControls(wrap);
        });

        ensureProgressBar(header);
    });
}

function ensureProgressBar(header) {
    if (!header || header.querySelector('.song-progress-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'song-progress-wrap';
    wrap.innerHTML =
        '<div class="song-progress-bar">' +
            '<div class="song-progress-fill"></div>' +
        '</div>' +
        '<div class="song-time-row">' +
            '<span class="song-time-current">0:00</span>' +
            '<span class="song-time-total">0:00</span>' +
        '</div>';
    header.appendChild(wrap);

    wrap.querySelector('.song-progress-bar').addEventListener('click', function(e) {
        if (!ytPlayer || typeof ytPlayer.getDuration !== 'function') return;
        var rect = this.getBoundingClientRect();
        var pct  = (e.clientX - rect.left) / rect.width;
        var dur  = ytPlayer.getDuration();
        if (dur) ytPlayer.seekTo(dur * pct, true);
    });
}

var progressTimer = null;

function startProgressTracking() {
    stopProgressTracking();
    progressTimer = setInterval(updateProgressUI, 500);
}

function stopProgressTracking() {
    if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
}

function formatTime(sec) {
    sec = Math.floor(sec || 0);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
}

function _syncSnpProgress() {
    if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
    var cur  = ytPlayer.getCurrentTime() || 0;
    var dur  = ytPlayer.getDuration() || 0;
    var pct  = dur ? (cur / dur * 100) : 0;
    var fill = document.getElementById('snp-progress-fill');
    var cur2 = document.getElementById('snp-time-cur');
    var tot2 = document.getElementById('snp-time-tot');
    var btn  = document.getElementById('snp-play-btn');
    if (fill) fill.style.width = pct + '%';
    if (cur2) cur2.textContent = formatTime(cur);
    if (tot2) tot2.textContent = formatTime(dur);
    if (btn)  btn.innerHTML    = isCurrentlyPlaying() ? '⏸' : '▶';
}

function updateProgressUI() {
    if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
    var cur = ytPlayer.getCurrentTime() || 0;
    var dur = ytPlayer.getDuration() || 0;
    var pct = dur ? (cur / dur * 100) : 0;

    document.querySelectorAll('.song-progress-fill').forEach(function(f) { f.style.width = pct + '%'; });
    document.querySelectorAll('.song-time-current').forEach(function(e) { e.textContent = formatTime(cur); });
    document.querySelectorAll('.song-time-total').forEach(function(e) { e.textContent = formatTime(dur); });

    _syncSnpProgress();
    syncNowPlayingMiniCard();
}

function resetProgressUI() {
    document.querySelectorAll('.song-progress-fill').forEach(function(f) { f.style.width = '0%'; });
    document.querySelectorAll('.song-time-current').forEach(function(e) { e.textContent = '0:00'; });
    document.querySelectorAll('.song-time-total').forEach(function(e) { e.textContent = '0:00'; });
    var npmFill = document.getElementById('npm-progress-fill');
    if (npmFill) npmFill.style.width = '0%';
    var npmCur = document.getElementById('npm-time-cur');
    if (npmCur) npmCur.textContent = '0:00';
    var npmTot = document.getElementById('npm-time-tot');
    if (npmTot) npmTot.textContent = '0:00';
}

function toggleHeaderControls(wrap) {
    var alreadyOpen = wrap.classList.contains('controls-open');
    closeAllHeaderControls();
    if (!alreadyOpen) {
        wrap.classList.add('controls-open');
        syncHeaderControlState();
    }
}

function closeHeaderControls(btnInside) {
    var wrap = btnInside.closest('.header-icon-wrap');
    if (wrap) wrap.classList.remove('controls-open');
}

function closeAllHeaderControls() {
    document.querySelectorAll('.header-icon-wrap.controls-open').forEach(function(w) {
        w.classList.remove('controls-open');
    });
}

function toggleHeaderFav(btn) {
    var songFavKey = btn.getAttribute('data-songfavkey');
    if (songFavKey) {
        toggleFavSong(songFavKey);
        return;
    }
    if (!currentMood || currentMood === 'search') return;
    toggleFavMood(null, currentMood);
    syncHeaderControlState();
}

function syncHeaderControlState() {
    var isPlaying = false;
    if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
        isPlaying = (ytPlayer.getPlayerState() === YT.PlayerState.PLAYING);
    }
    document.querySelectorAll('.header-icon-wrap.controls-open .header-play-btn-big').forEach(function(btn) {
        btn.innerHTML = isPlaying ? '⏸' : '▶';
    });

    document.querySelectorAll('.header-fav-btn').forEach(function(btn) {
        var songFavKey = btn.getAttribute('data-songfavkey');
        if (songFavKey) {
            var isFav = getFavSongIds().indexOf(songFavKey) !== -1;
            btn.classList.toggle('active', isFav);
            btn.textContent = isFav ? '❤' : '♡';
        } else {
            var favKeys = getFavMoods().map(function(m) { return m.key; });
            var isMoodFav = currentMood && favKeys.indexOf(currentMood) !== -1;
            btn.classList.toggle('active', !!isMoodFav);
            btn.textContent = isMoodFav ? '❤' : '♡';
        }
    });
}

function updateAllPlayButtons(isPlaying) {
    var homePlayBtn = document.querySelector('.play-btn');
    if (homePlayBtn) homePlayBtn.innerHTML = isPlaying ? '⏸' : '▶';

    document.querySelectorAll('.header-play-btn-big').forEach(function(btn) {
        btn.innerHTML = isPlaying ? '⏸' : '▶';
    });

    var npmPlayBtn = document.getElementById('npm-play-btn');
    if (npmPlayBtn) npmPlayBtn.innerHTML = isPlaying ? '⏸' : '▶';

    var snpPlayBtn = document.getElementById('snp-play-btn');
    if (snpPlayBtn) snpPlayBtn.innerHTML = isPlaying ? '⏸' : '▶';

    var card = document.getElementById('now-playing-mini-card');
    if (card) card.classList.toggle('is-playing', isPlaying);
}

var otherPageData = {
    moodcards: {
        title:'More Moods', sub:'Apna mood chuniye',
        items:[
            {key:'calm',       icon:'😌', name:'Calm'},
            {key:'angry',      icon:'😤', name:'Angry'},
            {key:'party',      icon:'🥳', name:'Party'},
            {key:'tired',      icon:'😴', name:'Tired'},
            {key:'devotional', icon:'🙏', name:'Devotional'},
            {key:'rainyday',   icon:'🌧️', name:'Rainy Day'},
            {key:'morning',    icon:'☀️', name:'Morning'},
            {key:'nightdrive', icon:'🌃', name:'Night Drive'}
        ]
    },
    moodtags: {
        title:'More Mood Tags', sub:'Aur moods dekhiye',
        items:[
            {key:'calm',       icon:'😌', name:'Calm'},
            {key:'angry',      icon:'😤', name:'Angry'},
            {key:'party',      icon:'🥳', name:'Party'},
            {key:'tired',      icon:'😴', name:'Tired'},
            {key:'devotional', icon:'🙏', name:'Devotional'},
            {key:'funny',      icon:'😂', name:'Funny'},
            {key:'meditation', icon:'🧘', name:'Meditation'}
        ]
    },
    energytags: {
        title:'More Activities', sub:'Aur activities dekhiye',
        items:[
            {key:'running',  icon:'🏃',    name:'Running'},
            {key:'yoga',     icon:'🧘‍♀️', name:'Yoga'},
            {key:'roadtrip', icon:'🚗',    name:'Road Trip'},
            {key:'study',    icon:'📚',    name:'Study'},
            {key:'cooking',  icon:'🍳',    name:'Cooking'},
            {key:'cleaning', icon:'🧹',    name:'Cleaning'},
            {key:'walking',  icon:'🚶',    name:'Walking'},
            {key:'dance',    icon:'💃',    name:'Dance'}
        ]
    },
    genretags: {
        title:'More Genres', sub:'Genre chuniye',
        items:[
            {key:'rock',      icon:'🎸',  name:'Rock'},
            {key:'classical', icon:'🎹',  name:'Classical'},
            {key:'pop',       icon:'🥁',  name:'Pop'},
            {key:'jazz',      icon:'🎺',  name:'Jazz'},
            {key:'urdu',      icon:'🎙️', name:'Urdu'},
            {key:'sindhi',    icon:'🎵',  name:'Sindhi'},
            {key:'pashto',    icon:'🎤',  name:'Pashto'},
            {key:'kpop',      icon:'🎧',  name:'K-Pop'}
        ]
    },
    trending: {
        title:'More Trending', sub:'Aur trending songs dekhiye',
        items:[
            {key:'viralhits',    icon:'🎵', name:'Viral Hits'},
            {key:'top50',        icon:'🎶', name:'Top 50'},
            {key:'hotnow',       icon:'🔥', name:'Hot Now'},
            {key:'chartbusters', icon:'📈', name:'Chart Busters'}
        ]
    },
    latest: {
        title:'More Latest', sub:'Naye additions dekhiye',
        items:[
            {key:'justadded',  icon:'🆕', name:'Just Added'},
            {key:'newsingles', icon:'🎤', name:'New Singles'},
            {key:'newalbums',  icon:'💿', name:'New Albums'}
        ]
    },
    toppicks: {
        title:'More Top Picks', sub:'Baaki ke top picks dekhiye',
        items:[
            {key:'tophappy',     icon:'😊', name:'Top Happy'},
            {key:'topsad',       icon:'😢', name:'Top Sad'},
            {key:'topenergetic', icon:'⚡', name:'Top Energetic'},
            {key:'romantic',     icon:'❤️', name:'Top Romantic'},
            {key:'lofi',         icon:'🎧', name:'Top Lofi'},
            {key:'motivation',   icon:'💪', name:'Top Motivation'},
            {key:'sleep',        icon:'🌙', name:'Top Sleep'}
        ]
    }
};

function openOtherPage(section) {
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('show'); });
    document.querySelectorAll('.sidebar li').forEach(function(li) { li.classList.remove('active'); });
    var data = otherPageData[section];
    document.getElementById('other-title').textContent = data.title;
    document.getElementById('other-sub').textContent   = data.sub;
    var grid = document.getElementById('other-grid');
    grid.innerHTML = '';
    data.items.forEach(function(item) {
        var div = document.createElement('div');
        div.className = 'opt-card';
        div.innerHTML =
            '<span class="fav-heart fav-heart--corner-sm" data-mood="' + item.key + '" onclick="toggleFavMood(event,\'' + item.key + '\')">♡</span>' +
            '<div class="opt-icon">' + item.icon + '</div><div class="opt-name">' + item.name + '</div>';
        div.addEventListener('click', function() { showMood(item.key); });
        grid.appendChild(div);
    });
    document.getElementById('page-other').classList.add('show');
    syncFavButtons();
}

function closeOtherPage() {
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('show'); });
    document.querySelectorAll('.sidebar li').forEach(function(li) { li.classList.remove('active'); });
    document.getElementById('page-' + lastSidebarPage).classList.add('show');
    if (lastSidebarEl) lastSidebarEl.classList.add('active');
    else document.querySelector('.sidebar li').classList.add('active');
}

var translations = {
    en: {
        home:'Home', moods:'Moods', genres:'Genres', fav:'Favorites', hist:'History',
        settings:'Settings', spTitle:'Settings', darkmode:'Dark Mode', language:'Language',
        greetMorning:'Good Morning', greetAfternoon:'Good Afternoon',
        greetEvening:'Good Evening', greetNight:'Good Night',
        welcome:'Welcome to MoodVibe', subtitle:'Music That Matches Your Mood',
        happy:'Happy', sad:'Sad', romantic:'Romantic', energetic:'Energetic',
        sleep:'Sleep', other:'Other',
        moodbased:'Mood Based', energy:'Energy & Activity', genre:'Genre / Language',
        trending:'Trending Songs', latest:'Latest Songs', toppicks:'Top Mood Picks',
        tophappy:'Top Happy', topsad:'Top Sad', topenergy:'Top Energetic',
        nowplaying:'Now Playing', allmoods:'All Moods',
        moodssub:'Apna mood chuniye aur music enjoy karein',
        genrespage:'Genres', genressub:'Genre ya language ke hisaab se music chuniye',
        favpage:'Favorites', favsub:'Aapke pasandeeda moods aur playlists',
        favempty:'Abhi tak koi favorite nahi. Kisi card ya tag ke ♡ button par click karke add karein.',
        favRightTitle:'Your Favorite Playlists', favRightSub:'Everything you have hearted shows up here',
        histpage:'History', histsub:'Aapne recently kya suna',
        back:'Wapas Jao',
        broken:'Broken Heart', love:'Love', gym:'Gym', lofi:'Lofi', motivation:'Motivation',
        loginBtn:'Login', signupBtn:'Sign Up', logoutBtn:'Logout'
    },
    ur: {
        home:'ہوم', moods:'موڈز', genres:'صنف', fav:'پسندیدہ', hist:'تاریخ',
        settings:'ترتیبات', spTitle:'ترتیبات', darkmode:'ڈارک موڈ', language:'زبان',
        greetMorning:'صبح بخیر', greetAfternoon:'دوپہر بخیر',
        greetEvening:'شام بخیر', greetNight:'شب بخیر',
        welcome:'MoodVibe میں خوش آمدید', subtitle:'اپنے موڈ کے مطابق موسیقی',
        happy:'خوش', sad:'اداس', romantic:'رومانٹک', energetic:'توانا',
        sleep:'نیند', other:'مزید',
        moodbased:'موڈ پر مبنی', energy:'توانائی اور سرگرمی', genre:'صنف / زبان',
        trending:'ٹرینڈنگ گانے', latest:'تازہ گانے', toppicks:'بہترین موڈ پکس',
        tophappy:'بہترین خوشی', topsad:'بہترین اداسی', topenergy:'بہترین توانائی',
        nowplaying:'ابھی چل رہا ہے', allmoods:'تمام موڈز',
        moodssub:'اپنا موڈ چنیں اور موسیقی سنیں',
        genrespage:'اصناف', genressub:'صنف یا زبان کے مطابق موسیقی چنیں',
        favpage:'پسندیدہ', favsub:'آپ کے پسندیدہ موڈز اور پلے لسٹ',
        favempty:'ابھی تک کوئی پسندیدہ نہیں۔',
        favRightTitle:'آپ کی پسندیدہ پلے لسٹس', favRightSub:'جو بھی آپ نے ♡ کیا ہے وہ یہاں نظر آئے گا',
        histpage:'تاریخ', histsub:'آپ نے حال ہی میں کیا سنا',
        back:'واپس جائیں',
        broken:'ٹوٹا دل', love:'محبت', gym:'جم', lofi:'لوفی', motivation:'حوصلہ',
        loginBtn:'لاگ ان', signupBtn:'سائن اپ', logoutBtn:'لاگ آؤٹ'
    },
    hi: {
        home:'होम', moods:'मूड्स', genres:'शैलियाँ', fav:'पसंदीदा', hist:'इतिहास',
        settings:'सेटिंग्स', spTitle:'सेटिंग्स', darkmode:'डार्क मोड', language:'भाषा',
        greetMorning:'सुप्रभात', greetAfternoon:'शुभ दोपहर',
        greetEvening:'शुभ संध्या', greetNight:'शुभ रात्रि',
        welcome:'MoodVibe में आपका स्वागत है', subtitle:'अपने मूड के अनुसार संगीत',
        happy:'खुश', sad:'उदास', romantic:'रोमांटिक', energetic:'ऊर्जावान',
        sleep:'नींद', other:'अन्य',
        moodbased:'मूड आधारित', energy:'ऊर्जा और गतिविधि', genre:'शैली / भाषा',
        trending:'ट्रेंडिंग गाने', latest:'नए गाने', toppicks:'टॉप मूड पिक्स',
        tophappy:'टॉप खुशी', topsad:'टॉप उदासी', topenergy:'टॉप ऊर्जा',
        nowplaying:'अभी चल रहा है', allmoods:'सभी मूड्स',
        moodssub:'अपना मूड चुनें और संगीत का आनंद लें',
        genrespage:'शैलियाँ', genressub:'शैली या भाषा के अनुसार संगीत चुनें',
        favpage:'पसंदीदा', favsub:'आपके पसंदीदा मूड्स और प्लेलिस्ट',
        favempty:'अभी तक कोई पसंदीदा नहीं।',
        favRightTitle:'आपकी पसंदीदा प्लेलिस्ट', favRightSub:'जो भी आपने ♡ किया है वो यहाँ दिखेगा',
        histpage:'इतिहास', histsub:'आपने हाल ही में क्या सुना',
        back:'वापस जाएं',
        broken:'टूटा दिल', love:'प्यार', gym:'जिम', lofi:'लोफी', motivation:'प्रेरणा',
        loginBtn:'लॉग इन', signupBtn:'साइन अप', logoutBtn:'लॉग आउट'
    }
};

var currentLang = localStorage.getItem('mv_lang') || 'en';
var isDark      = localStorage.getItem('mv_dark') === 'true';

function applyLang(lang) {
    var t    = translations[lang];
    var hour = new Date().getHours();
    var greet = hour >= 5  && hour < 12 ? t.greetMorning
              : hour >= 12 && hour < 17 ? t.greetAfternoon
              : hour >= 17 && hour < 21 ? t.greetEvening
              : t.greetNight;

    var loggedIn = localStorage.getItem('mv_loggedIn') === 'true';
    var name     = localStorage.getItem('mv_currentUser') || '';
    var greetEl  = document.getElementById('home-greeting');
    if (greetEl) greetEl.textContent = loggedIn && name
        ? greet + ', ' + name + '! 👋'
        : greet + '! ' + t.welcome + ' 👋';

    var set = function(id, val) { var e = document.getElementById(id); if(e) e.textContent = val; };
    set('home-subtitle',   t.subtitle);
    set('l-settings',      t.settings);
    set('l-sp-title',      t.spTitle);
    set('l-darkmode',      t.darkmode);
    set('l-language',      t.language);
    set('m-happy',         t.happy);
    set('m-sad',           t.sad);
    set('m-romantic',      t.romantic);
    set('m-energetic',     t.energetic);
    set('m-sleep',         t.sleep);
    set('m-other',         t.other);
    set('l-moodbased',     t.moodbased);
    set('l-energy',        t.energy);
    set('l-genre',         t.genre);
    set('l-trending',      t.trending);
    set('l-latest',        t.latest);
    set('l-toppicks',      t.toppicks);
    set('l-tophappy',      t.tophappy);
    set('l-topsad',        t.topsad);
    set('l-topenergy',     t.topenergy);
    set('l-nowplaying',    t.nowplaying);
    set('l-allmoods',      t.allmoods);
    set('l-moodssub',      t.moodssub);
    set('l-genrespage',    t.genrespage);
    set('l-genressub',     t.genressub);
    set('l-favpage',       t.favpage);
    set('l-favsub',        t.favsub);
    set('l-favrighttitle', t.favRightTitle);
    set('l-favrightsub',   t.favRightSub);
    set('l-histpage',      t.histpage);
    set('l-histsub',       t.histsub);
    set('t-happy',         t.happy);
    set('t-sad',           t.sad);
    set('t-romantic',      t.romantic);
    set('t-broken',        t.broken);
    set('t-love',          t.love);
    set('t-other',         t.other);
    set('t-gym',           t.gym);
    set('t-energetic',     t.energetic);
    set('t-sleep',         t.sleep);
    set('t-lofi',          t.lofi);
    set('t-motivation',    t.motivation);
    set('pg-happy',        t.happy);
    set('pg-sad',          t.sad);
    set('pg-romantic',     t.romantic);
    set('pg-energetic',    t.energetic);
    set('pg-sleep',        t.sleep);
    set('pg-broken',       t.broken);
    set('pg-love',         t.love);
    set('pg-lofi',         t.lofi);
    set('pg-motivation',   t.motivation);
    ['l-back1','l-back2','l-back3','l-back4','l-back5','l-back6','l-back7','l-back8','l-back9'].forEach(function(id){ set(id, t.back); });
    var favEmptyEl = document.querySelector('#fav-empty-state p');
    if (favEmptyEl) favEmptyEl.textContent = t.favempty;
    var navLabels = document.querySelectorAll('.sidebar li span');
    var keys = ['home','moods','genres','fav','hist'];
    navLabels.forEach(function(el, i){ if(keys[i]) el.textContent = t[keys[i]]; });
    updateTopbar();
}

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('mv_lang', lang);
    ['en','ur','hi'].forEach(function(l){
        var btn = document.getElementById('btn-' + l);
        if (btn) btn.classList.toggle('active', l === lang);
    });
    applyLang(lang);
}

function applyDark(dark) {
    document.body.classList.toggle('dark-mode', dark);
    document.getElementById('dark-toggle').classList.toggle('on', dark);
}

function toggleDark() {
    isDark = !isDark;
    localStorage.setItem('mv_dark', isDark);
    applyDark(isDark);
}

function updateTopbar() {
    var loggedIn = localStorage.getItem('mv_loggedIn') === 'true';
    var name     = localStorage.getItem('mv_currentUser') || '';
    var t        = translations[currentLang];
    var tbr      = document.getElementById('topbar-btns');
    if (!tbr) return;
    if (loggedIn && name) {
        tbr.innerHTML =
            '<span style="font-size:13px;color:#1a4a48;font-weight:700;align-self:center;">👤 ' + name + '</span>' +
            '<button class="btn-outline" onclick="doLogout()">' + t.logoutBtn + '</button>';
    } else {
        tbr.innerHTML =
            '<button class="btn-outline" onclick="window.location.href=\'Login.html\'">' + t.loginBtn + '</button>' +
            '<button class="btn" onclick="window.location.href=\'Signup.html\'">' + t.signupBtn + '</button>';
    }
}

function doLogout() {
    localStorage.removeItem('mv_loggedIn');
    localStorage.removeItem('mv_currentUser');
    localStorage.removeItem('mv_user');
    updateTopbar();
    applyLang(currentLang);
}

window.addEventListener('DOMContentLoaded', function () {
    // Mobile par sidebar default compact/collapsed khule (jaise mobile apps mein
    // hota hai), taake wo poori screen cover na kare. Hamburger se hamesha
    // expand/collapse kiya ja sakta hai.
    if (window.innerWidth <= 768) {
        sidebarOpen = false;
        var sb = document.getElementById('sidebar');
        if (sb) sb.classList.add('collapsed');
    }

    applyDark(isDark);
    applyLang(currentLang);
    buildArtistMoodMap();
    loadAllArtistImages();
    ['en','ur','hi'].forEach(function(l){
        var btn = document.getElementById('btn-' + l);
        if (btn) btn.classList.toggle('active', l === currentLang);
    });
    lastSidebarEl = document.querySelector('.sidebar li');
    syncFavButtons();
    renderHistory();
    renderFavoritesHero();
    setupHeaderControls();
    loadHomeTrendingLatestThumbs();

    var npmBar = document.getElementById('npm-progress-bar');
    if (npmBar) {
        npmBar.addEventListener('click', function(e) {
            if (!ytPlayer || typeof ytPlayer.getDuration !== 'function') return;
            var rect = npmBar.getBoundingClientRect();
            var pct  = (e.clientX - rect.left) / rect.width;
            var dur  = ytPlayer.getDuration();
            if (dur) ytPlayer.seekTo(dur * pct, true);
        });
    }

    var snpBar = document.getElementById('snp-progress-bar');
    if (snpBar) {
        snpBar.addEventListener('click', function(e) {
            if (!ytPlayer || typeof ytPlayer.getDuration !== 'function') return;
            var rect = snpBar.getBoundingClientRect();
            var pct  = (e.clientX - rect.left) / rect.width;
            var dur  = ytPlayer.getDuration();
            if (dur) ytPlayer.seekTo(dur * pct, true);
        });
    }

    var searchInput = document.getElementById('global-search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performGlobalSearch(searchInput.value);
            }
        });
    }

    if (typeof YT !== 'undefined' && typeof YT.Player !== 'undefined') {
        ytReady = true;
        initYTPlayer();
    } else if (!document.getElementById('yt-api-script')) {
        var tag = document.createElement('script');
        tag.id  = 'yt-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }
});

function getFavMoods() {
    try { return JSON.parse(localStorage.getItem('mv_favMoods') || '[]'); }
    catch(e) { return []; }
}

function saveFavMoods(arr) {
    localStorage.setItem('mv_favMoods', JSON.stringify(arr));
}

function toggleFavMood(e, key) {
    if (e) e.stopPropagation();
    if (!key) return;
    var favs = getFavMoods();
    var idx  = favs.findIndex(function(m) { return m.key === key; });
    var info = moodMap[key] || { icon: '🎵', title: key };
    if (idx === -1) {
        favs.push({ key: key, icon: info.icon, name: info.title });
        showFavToast((info.title || key) + ' favorites mein add ho gaya! ❤️');
    } else {
        favs.splice(idx, 1);
        showFavToast((info.title || key) + ' favorites se hata diya');
    }
    saveFavMoods(favs);
    syncFavButtons();
    var favPage = document.getElementById('page-favorites');
    if (favPage && favPage.classList.contains('show')) renderFavoritesPage();
}

function syncFavButtons() {
    var favKeys = getFavMoods().map(function(m) { return m.key; });
    document.querySelectorAll('.fav-heart').forEach(function(btn) {
        var key    = btn.getAttribute('data-mood');
        var active = !!key && favKeys.indexOf(key) !== -1;
        btn.classList.toggle('active', active);
        btn.textContent = active ? '❤' : '♡';
    });
    syncHeaderControlState();
}

function renderFavoritesPage() {
    var container = document.getElementById('fav-list-container');
    var empty     = document.getElementById('fav-empty-state');
    if (!container) return;
    var favs = getFavMoods();
    if (favs.length === 0) {
        container.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    // ===== UPDATE: is panel mein bhi ab emoji-box ki jagah, mumkin ho to
    //       asal song thumbnail dikhti hai (song-favorites data se, ya
    //       us mood ke abhi load hue songs se) — consistency ke liye =====
    var songFavList = getFavSongsList();

    container.innerHTML = favs.map(function(m, i) {
        var thumb = null;
        var favSong = songFavList.find(function(s) { return s.mood === m.key && s.thumb; });
        if (favSong) {
            thumb = favSong.thumb;
        } else if (moodSongs[m.key] && moodSongs[m.key].length && moodSongs[m.key][0].thumb) {
            thumb = moodSongs[m.key][0].thumb;
        }

        var imgHtml = thumb
            ? '<img src="' + thumb + '" style="width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;">'
            : '<div class="song-img">' + m.icon + '</div>';

        return '<div class="song-item" onclick="showMood(\'' + m.key + '\')">' +
            '<span class="song-num">' + (i + 1) + '</span>' +
            imgHtml +
            '<div class="song-info">' +
                '<div class="song-title">' + m.icon + ' ' + m.name + '</div>' +
                '<div class="song-sub">Tap to play</div>' +
            '</div>' +
            '<span class="fav-heart active" data-mood="' + m.key + '" onclick="toggleFavMood(event,\'' + m.key + '\')">\u2764</span>' +
        '</div>';
    }).join('');
}

function showFavToast(msg) {
    var old = document.getElementById('fav-toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.id = 'fav-toast';
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);' +
        'background:#2e7d71;color:white;padding:10px 22px;border-radius:24px;font-size:13px;' +
        'font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.18);pointer-events:none;';
    document.body.appendChild(t);
    setTimeout(function() { if (t.parentNode) t.remove(); }, 2500);
}

function showSkipToast(msg) {
    var old = document.getElementById('skip-toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.id = 'skip-toast';
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);' +
        'background:rgba(60,60,60,0.92);color:white;padding:9px 20px;border-radius:22px;font-size:12px;' +
        'font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.25);pointer-events:none;white-space:nowrap;';
    document.body.appendChild(t);
    setTimeout(function() { if (t.parentNode) t.remove(); }, 2000);
}

function showEmbedBlockedToast(song) {
    var old = document.getElementById('embed-blocked-toast');
    if (old) old.remove();

    var shortTitle = song.title.length > 38 ? song.title.substring(0, 38) + '...' : song.title;
    var ytUrl = 'https://www.youtube.com/watch?v=' + song.videoId;

    var t = document.createElement('div');
    t.id = 'embed-blocked-toast';
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);' +
        'background:#1a3a38;color:white;padding:12px 16px;border-radius:16px;font-size:12px;' +
        'z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.35);max-width:340px;width:90%;';

    t.innerHTML =
        '<div style="font-weight:700;margin-bottom:6px;font-size:11px;opacity:0.7;text-transform:uppercase;letter-spacing:0.5px;">⚠️ Yeh song sirf YouTube pe chal sakta hai</div>' +
        '<div style="font-size:13px;margin-bottom:10px;line-height:1.4;">' + escapeHtml(shortTitle) + '</div>' +
        '<div style="display:flex;gap:8px;">' +
            '<a href="' + ytUrl + '" target="_blank" style="flex:1;background:#ff0000;color:white;border:none;padding:8px 0;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;text-align:center;text-decoration:none;display:block;">▶ YouTube pe Kholo</a>' +
            '<button onclick="document.getElementById(\'embed-blocked-toast\').remove();" style="flex:0 0 36px;background:rgba(255,255,255,0.15);color:white;border:none;border-radius:10px;font-size:14px;cursor:pointer;">✕</button>' +
        '</div>';

    document.body.appendChild(t);

    setTimeout(function() { if (t.parentNode) t.remove(); }, 8000);
}

function updateNowPlayingMiniCard(song) {
    var card  = document.getElementById('now-playing-mini-card');
    var artEl = document.getElementById('npm-art');
    var title = document.getElementById('npm-title');
    var chan   = document.getElementById('npm-channel');
    if (!card || !artEl) return;

    if (song) {
        if (song.thumb) {
            artEl.innerHTML = '<img src="' + song.thumb + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:12px;">';
        } else {
            artEl.innerHTML = '<div class="npm-art-placeholder"><div class="npm-bars"><span></span><span></span><span></span><span></span><span></span></div></div>';
        }
        if (title) title.textContent = song.title || '';
        if (chan)  chan.textContent   = song.channel || '';
    } else {
        artEl.innerHTML = '<div class="npm-art-placeholder"><div class="npm-bars"><span></span><span></span><span></span><span></span><span></span></div></div>';
        if (title) title.textContent = 'Koi mood select karein';
        if (chan)  chan.textContent   = 'MoodVibe Music Player';
        card.classList.remove('is-playing');
        var fill  = document.getElementById('npm-progress-fill');
        var curEl = document.getElementById('npm-time-cur');
        var totEl = document.getElementById('npm-time-tot');
        if (fill)  fill.style.width   = '0%';
        if (curEl) curEl.textContent  = '0:00';
        if (totEl) totEl.textContent  = '0:00';
    }
}

function syncNowPlayingMiniCard() {
    var card    = document.getElementById('now-playing-mini-card');
    var playBtn = document.getElementById('npm-play-btn');
    var fill    = document.getElementById('npm-progress-fill');
    var curEl   = document.getElementById('npm-time-cur');
    var totEl   = document.getElementById('npm-time-tot');
    if (!card) return;

    var playing = isCurrentlyPlaying();
    card.classList.toggle('is-playing', playing);
    if (playBtn) playBtn.innerHTML = playing ? '⏸' : '▶';

    if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
        var cur = ytPlayer.getCurrentTime() || 0;
        var dur = ytPlayer.getDuration() || 0;
        var pct = dur ? (cur / dur * 100) : 0;
        if (fill)  fill.style.width  = pct + '%';
        if (curEl) curEl.textContent = formatTime(cur);
        if (totEl) totEl.textContent = formatTime(dur);
    }
}

var artistsData = [
    { key:'arijit',   name:'Arijit Singh',        genre:'Bollywood',     search:'Arijit Singh songs',         img:null },
    { key:'shreya',   name:'Shreya Ghoshal',       genre:'Bollywood',     search:'Shreya Ghoshal songs',       img:null },
    { key:'kumar',    name:'Kumar Sanu',           genre:'Bollywood',     search:'Kumar Sanu best songs',      img:null },
    { key:'lata',     name:'Lata Mangeshkar',      genre:'Bollywood',     search:'Lata Mangeshkar songs',      img:null },
    { key:'atif',     name:'Atif Aslam',           genre:'Pakistani',     search:'Atif Aslam songs',           img:null },
    { key:'rahat',    name:'Rahat Fateh Ali Khan', genre:'Pakistani',     search:'Rahat Fateh Ali Khan songs', img:null },
    { key:'ali',      name:'Ali Zafar',            genre:'Pakistani',     search:'Ali Zafar songs',            img:null },
    { key:'diljit',   name:'Diljit Dosanjh',       genre:'Punjabi',       search:'Diljit Dosanjh songs',       img:null },
    { key:'karan',    name:'Karan Aujla',          genre:'Punjabi',       search:'Karan Aujla songs',          img:null },
    { key:'sidhu',    name:'Sidhu Moosewala',      genre:'Punjabi',       search:'Sidhu Moosewala songs',      img:null },
    { key:'apdhillon',name:'AP Dhillon',           genre:'International', search:'AP Dhillon songs',           img:null },
    { key:'edsheeran',name:'Ed Sheeran',           genre:'Hollywood',     search:'Ed Sheeran songs',           img:null },
    { key:'weeknd',   name:'The Weeknd',           genre:'Hollywood',     search:'The Weeknd songs',           img:null },
    { key:'taylor',   name:'Taylor Swift',         genre:'Hollywood',     search:'Taylor Swift songs',         img:null },
    { key:'drake',    name:'Drake',                genre:'Hollywood',     search:'Drake songs',                img:null },
    { key:'eminem',   name:'Eminem',               genre:'Hollywood',     search:'Eminem songs',               img:null },
    { key:'adele',    name:'Adele',                genre:'Hollywood',     search:'Adele songs',                img:null },
    { key:'bts',      name:'BTS',                  genre:'K-Pop',         search:'BTS kpop songs',             img:null },
    { key:'blackpink',name:'BLACKPINK',            genre:'K-Pop',         search:'BLACKPINK songs',            img:null },
];

var artistImgCache = {};

function fetchArtistImage(artist, callback) {
    if (artistImgCache[artist.key]) {
        callback(artistImgCache[artist.key]);
        return;
    }
    var cbName = 'deezerCb_' + artist.key;
    window[cbName] = function(data) {
        var img = null;
        if (data && data.data && data.data[0] && data.data[0].picture_medium) {
            img = data.data[0].picture_medium;
        }
        artistImgCache[artist.key] = img;
        artist.img = img;
        callback(img);
        delete window[cbName];
    };
    var s = document.createElement('script');
    s.src = 'https://api.deezer.com/search/artist?q=' + encodeURIComponent(artist.name) + '&limit=1&output=jsonp&callback=' + cbName;
    s.onerror = function() { callback(null); delete window[cbName]; };
    document.head.appendChild(s);
}

function loadAllArtistImages() {
    artistsData.forEach(function(artist) {
        fetchArtistImage(artist, function(imgUrl) {
            document.querySelectorAll('[data-artist-key="' + artist.key + '"]').forEach(function(el) {
                if (imgUrl) {
                    el.src = imgUrl;
                } else {
                    el.src = avatarUrl(artist.name);
                }
            });
        });
    });
}

function avatarUrl(name) {
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=2e7d71&color=fff&size=200&bold=true&rounded=false';
}

var currentArtistKey = null;

function makeArtistImgHtml(artist, size) {
    size = size || 110;
    var src = artist.img || avatarUrl(artist.name);
    return '<img src="' + src + '" data-artist-key="' + artist.key + '" alt="' + artist.name + '" onerror="this.src=\'' + avatarUrl(artist.name) + '\'">';
}

function showArtist(key) {
    var artist = null;
    for (var i = 0; i < artistsData.length; i++) {
        if (artistsData[i].key === key) { artist = artistsData[i]; break; }
    }
    if (!artist) return;

    currentArtistKey = key;

    var header   = document.getElementById('artist-detail-header');
    var imgEl    = document.getElementById('artist-detail-img');
    var nameEl   = document.getElementById('artist-detail-name');
    var genreEl  = document.getElementById('artist-detail-genre');
    var badgeEl  = document.getElementById('artist-detail-badge');
    var songList = document.getElementById('artist-song-list');

    if (imgEl)   imgEl.innerHTML  = makeArtistImgHtml(artist, 90);
    if (nameEl)  nameEl.textContent  = artist.name;
    if (genreEl) genreEl.textContent = artist.genre;
    if (badgeEl) badgeEl.textContent = artist.genre;
    if (songList) songList.innerHTML = '<div class="song-item"><div class="song-info"><div class="song-title">Loading songs...</div></div></div>';

    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('show'); });
    document.getElementById('page-artist-detail').classList.add('show');
    closeAllHeaderControls();

    currentMood = 'artist_' + key;
    moodLoadToken++;
    var token = moodLoadToken;

    searchYouTubeRaw(artist.search, function(songs) {
        if (token !== moodLoadToken) return;
        if (!songs || songs.length === 0) {
            if (songList) songList.innerHTML = '<div class="song-item"><div class="song-info"><div class="song-title">⚠️ Songs nahi mili. Internet check karein.</div></div></div>';
            return;
        }
        currentPlaylistSongs = songs;
        currentSongIndex = -1;

        songList.innerHTML = songs.map(function(s, i) {
            var thumbHtml = s.thumb
                ? '<img class="song-thumb-click" data-index="' + i + '" src="' + s.thumb + '" style="width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;cursor:pointer;">'
                : '<div class="song-img song-thumb-click" data-index="' + i + '" style="cursor:pointer;">🎵</div>';
            var favKeys  = getFavSongIds();
            var favKey   = currentMood + ':' + s.videoId;
            var isFav    = favKeys.indexOf(favKey) !== -1;
            return '<div class="song-item" data-index="' + i + '">'
                + '<span class="song-num">' + (i + 1) + '</span>'
                + thumbHtml
                + '<div class="song-info song-thumb-click" data-index="' + i + '" style="cursor:pointer;">'
                    + '<div class="song-title">' + escapeHtml(s.title) + '</div>'
                    + '<div class="song-sub">' + escapeHtml(s.channel) + (s.duration ? ' • ' + s.duration : '') + '</div>'
                + '</div>'
                + '<div class="song-row-controls">'
                    + '<button class="row-ctrl-btn row-prev-btn" data-index="' + i + '">⏮</button>'
                    + '<button class="row-ctrl-btn row-play-btn" data-index="' + i + '">▶</button>'
                    + '<button class="row-ctrl-btn row-next-btn" data-index="' + i + '">⏭</button>'
                    + '<button class="row-ctrl-btn row-fav-btn' + (isFav ? ' active' : '') + '" data-index="' + i + '" data-favkey="' + favKey + '">' + (isFav ? '❤' : '♡') + '</button>'
                + '</div>'
            + '</div>';
        }).join('');

        attachSongRowEvents(songList);
        saveHistory('artist_' + key, { icon: '🎤', title: artist.name });
    });

    if (!ytPlayer && !document.getElementById('yt-api-script')) {
        var tag = document.createElement('script');
        tag.id  = 'yt-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }
}

function goBackToArtists() {
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('show'); });
    document.getElementById('page-artists').classList.add('show');
}

function openArtistsPage() {
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('show'); });
    document.querySelectorAll('.sidebar li').forEach(function(li) { li.classList.remove('active'); });

    var grid = document.getElementById('artists-full-grid');
    if (grid) {
        grid.innerHTML = artistsData.map(function(artist) {
            var src = artist.img || avatarUrl(artist.name);
            return '<div class="artist-card" onclick="showArtist(\'' + artist.key + '\')" style="width:100%;">'
                + '<div class="artist-img-wrap" style="width:100%;height:130px;border-radius:14px;">'
                    + '<img src="' + src + '" data-artist-key="' + artist.key + '" alt="' + artist.name + '" style="width:100%;height:100%;object-fit:cover;object-position:top center;" onerror="this.src=\'' + avatarUrl(artist.name) + '\'">'
                + '</div>'
                + '<div class="artist-name">' + escapeHtml(artist.name) + '</div>'
                + '<div class="artist-label">' + escapeHtml(artist.genre) + '</div>'
            + '</div>';
        }).join('');
        loadAllArtistImages();
    }

    document.getElementById('page-artists').classList.add('show');
}

// =====================================================================
// ===== FLOATING YOUTUBE POPUP =========================================
// =====================================================================
var ytPopupPlayer = null;

function openYtPopup(videoId, title) {
    var popup   = document.getElementById('yt-float-popup');
    var titleEl = document.getElementById('yt-popup-title');
    if (!popup) return;
    if (titleEl) titleEl.textContent = title || 'YouTube';
    popup.classList.add('open');

    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        popup.classList.remove('open');
        window.open('https://www.youtube.com/watch?v=' + videoId, '_blank');
        return;
    }

    if (!ytPopupPlayer) {
        ytPopupPlayer = new YT.Player('yt-popup-frame', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: { autoplay: 1, rel: 0 },
            events: {
                onReady: function (e) { e.target.playVideo(); },
                onError: function () { handlePopupError(videoId, title); }
            }
        });
    } else {
        ytPopupPlayer.loadVideoById(videoId);
    }
}

function handlePopupError(videoId, title) {
    closeYtPopup();
    showEmbedBlockedToast({ videoId: videoId, title: title || 'Song' });
}

function closeYtPopup() {
    var popup = document.getElementById('yt-float-popup');
    if (popup) popup.classList.remove('open');
    if (ytPopupPlayer && typeof ytPopupPlayer.stopVideo === 'function') {
        try { ytPopupPlayer.stopVideo(); } catch (e) {}
    }
}
