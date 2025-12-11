export function renderWebsite() {
  
  function getServerSkeleton() {
    return Array(5).fill('<div class="card skeleton" style="min-width:110px; height:160px;"></div>').join('');
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>My Streaming App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <style>
      body { background: #121212; color: #e0e0e0; font-family: 'Segoe UI', sans-serif; margin:0; padding-bottom: 60px; user-select: none; }
      
      header { background: rgba(20, 20, 20, 0.95); backdrop-filter: blur(10px); padding: 10px 15px; position: sticky; top:0; z-index:50; border-bottom: 1px solid #333; display:flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
      .brand { color: #e50914; font-weight: bold; font-size: 20px; text-decoration: none; cursor:pointer;}
      .search-box { display: flex; align-items: center; background: #222; border: 1px solid #444; border-radius: 20px; padding: 5px 10px; }
      .search-input { background: transparent; border: none; color: white; outline: none; width: 110px; transition: 0.3s; font-size: 14px;}
      .search-input:focus { width: 160px; }
      .search-btn { cursor: pointer; padding: 5px; font-size: 16px; border-radius: 50%; }

      /* Animation */
      @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
      .skeleton { animation: shimmer 2s infinite linear; background: linear-gradient(to right, #222 4%, #333 25%, #222 36%); background-size: 1000px 100%; border-radius: 6px; }

      /* Home */
      .home-section { padding: 15px 0 5px 15px; }
      .section-head { display: flex; justify-content: space-between; align-items: center; padding-right: 15px; margin-bottom: 10px; }
      .section-title { color: #fff; font-size: 16px; font-weight: 600; border-left: 3px solid #e50914; padding-left: 10px; }
      .see-more { color: #aaa; font-size: 11px; cursor: pointer; font-weight: bold; }
      .scroll-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; scroll-behavior: smooth; }
      .scroll-row::-webkit-scrollbar { height: 4px; }
      .scroll-row::-webkit-scrollbar-thumb { background: #444; border-radius: 2px; }
      .scroll-row .card { min-width: 110px; max-width: 110px; }

      /* Grid */
      .container { max-width: 1200px; margin: 0 auto; padding: 15px; display: none; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
      @media (min-width: 600px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 15px; } }
      .card { background: #1f1f1f; border-radius: 6px; overflow: hidden; cursor: pointer; position: relative; transition: transform 0.2s; }
      .card:active { transform: scale(0.95); }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; display: block; }
      .title { padding: 6px; font-size: 11px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ccc; }
      .card-tag { position: absolute; top: 4px; right: 4px; background: rgba(229, 9, 20, 0.9); color: #fff; font-size: 8px; padding: 2px 4px; border-radius: 3px; }
      
      /* Navigation Buttons */
      .back-nav { display: none; padding: 10px 15px; gap:10px; }
      .back-btn { background: #333; color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: bold;}
      .fav-btn-menu { background: #333; color: #e50914; border: 1px solid #e50914; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: bold;}

      /* Player Modal */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:black; z-index:100; overflow-y: auto; }
      .modal-content { width: 100%; max-width: 1000px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #111; }
      .video-area { position: sticky; top: 0; z-index: 10; background:black; width: 100%; aspect-ratio: 16/9; position: relative; }
      video { width: 100%; height: 100%; background: black; display: none; }
      .player-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 10px; box-sizing: border-box; transition: opacity 0.4s ease; opacity: 1; pointer-events: none; background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent 30%, transparent 70%, rgba(0,0,0,0.6)); }
      .player-overlay.hidden { opacity: 0; }
      .ctrl-btn { pointer-events: auto; background: rgba(30,30,30,0.7); color: white; border: 1px solid #555; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold; backdrop-filter: blur(5px); }
      .top-controls { display: flex; justify-content: flex-end; }
      .bottom-controls { display: flex; justify-content: flex-end; margin-bottom: 25px; }
      .cover-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; }
      .play-btn-circle { width: 60px; height: 60px; background: rgba(229, 9, 20, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
      .play-btn-circle::after { content: '▶'; color: white; font-size: 24px; margin-left: 4px; }

      #error-msg { display:none; position:absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.8); flex-direction: column; align-items: center; justify-content: center; z-index: 5; backdrop-filter: blur(5px); }
      #error-msg p { color: #ddd; margin-bottom: 15px; font-size: 14px; font-weight:500; }
      .retry-btn { background: #333; border: 1px solid #555; color: white; padding: 10px 20px; border-radius: 30px; cursor: pointer; font-weight: bold; text-decoration: none; display:flex; align-items:center; gap:8px; transition:0.2s; }
      .retry-btn:hover { background: #e50914; border-color:#e50914; }

      .info-sec { padding: 15px; }
      h2 { margin: 0; color: #fff; font-size: 18px; }
      p.desc { color: #aaa; font-size: 13px; margin-top: 10px; line-height: 1.5; }
      .tag-pill { background: #333; color: #aaa; font-size: 10px; padding: 3px 8px; border-radius: 10px; margin-right:5px; }

      .accordion { background-color: #2a2a2a; color: #eee; cursor: pointer; padding: 12px; width: 100%; border: none; text-align: left; outline: none; font-size: 14px; font-weight: bold; border-bottom: 1px solid #333; display: flex; justify-content: space-between; margin-top: 5px; border-radius: 4px; }
      .accordion.active { background-color: #e50914; color: white; }
      .accordion:after { content: '+'; font-size: 18px; }
      .accordion.active:after { content: '-'; }
      .panel { padding: 0 5px; background-color: #111; max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
      .episode-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 8px; padding: 10px 5px; max-height: 300px; overflow-y: auto; }
      .ep-btn { background: #333; border: 1px solid #444; color: #ddd; padding: 10px 5px; cursor: pointer; border-radius: 4px; font-size: 11px; text-align: center; }
      .ep-btn:hover { background: #444; }
      .ep-btn.active { background: #e50914; color: white; border-color: #e50914; font-weight: bold; }

      /* 🔥 FAV BUTTON & ACTIONS */
      .action-row { display:flex; gap:10px; margin-top:10px; }
      .fav-btn { background: #333; color: white; border: none; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer; display:flex; align-items:center; gap:5px; }
      .fav-btn.active { color: #e50914; border: 1px solid #e50914; }

      .pagination { display: flex; justify-content: center; gap: 15px; margin-top: 30px; padding-bottom: 20px;}
      .page-btn { padding: 8px 16px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer; }
    </style>
  </head>
  <body>

    <header>
      <div class="brand" onclick="goHome()">MY MOVIE</div>
      <div class="search-box">
        <input type="text" id="searchInput" class="search-input" placeholder="Search..." onkeypress="handleSearchKey(event)">
        <div class="search-btn" onclick="executeSearch()">🔍</div>
      </div>
    </header>

    <div id="homeView">
        <div style="padding: 10px 15px; display:flex; gap:10px;">
            <button class="fav-btn-menu" onclick="openFavorites()">❤️ My Favorites</button>
        </div>

        <div class="home-section">
            <div class="section-head"><span class="section-title">Latest Movies</span><a class="see-more" onclick="openCategory('movies')">See More ></a></div>
            <div class="scroll-row" id="row_movies">${getServerSkeleton()}</div>
        </div>
        <div class="home-section">
            <div class="section-head"><span class="section-title">TV Series</span><a class="see-more" onclick="openCategory('series')">See More ></a></div>
            <div class="scroll-row" id="row_series">${getServerSkeleton()}</div>
        </div>
        <div class="home-section">
            <div class="section-head"><span class="section-title">18+ Collections</span><a class="see-more" onclick="openCategory('18+')">See More ></a></div>
            <div class="scroll-row" id="row_18">${getServerSkeleton()}</div>
        </div>
    </div>

    <div class="back-nav" id="backNav">
        <button class="back-btn" onclick="goHome()">⬅ Back to Home</button>
        <span id="gridTitle" style="color:#aaa; font-size:14px; font-weight:bold; padding-top:5px;"></span>
    </div>
    
    <div class="container" id="gridViewContainer">
      <div class="grid" id="mainGrid"></div>
      <div class="pagination" id="pagControls">
        <button class="page-btn" id="prevBtn" onclick="changePage(-1)">Prev</button>
        <span id="pageInfo" style="color:#888; font-size: 12px; align-self:center;"></span>
        <button class="page-btn" id="nextBtn" onclick="changePage(1)">Next</button>
      </div>
    </div>

    <div id="playerModal">
      <div class="modal-content">
        <div class="video-area" id="videoWrapper">
            <div id="coverOverlay" class="cover-overlay" onclick="startPlayback()">
                <div class="play-btn-circle"></div>
            </div>
            <video id="video" controls playsinline controlsList="nodownload"></video>
            
            <div id="error-msg">
                <p>Playback requires external player</p>
                <a id="fallback-btn" class="retry-btn" target="_blank">▶ Click to Play</a>
            </div>

            <div class="player-overlay" id="playerOverlay">
                <div class="top-controls"><button class="ctrl-btn" onclick="closePlayer()">❌ Close</button></div>
                <div class="bottom-controls"><button class="ctrl-btn" onclick="toggleFullScreen()">⛶ Fullscreen</button></div>
            </div>
        </div>
        
        <div class="info-sec">
          <h2 id="m_title"></h2>
          
          <div class="action-row">
             <div id="m_tags" style="display:flex; flex-wrap:wrap; gap:5px;"></div>
             <button id="favBtn" class="fav-btn" onclick="toggleFavorite()">❤️ Add to Fav</button>
          </div>

          <p id="m_desc" class="desc"></p>
          <div id="ep_section" style="margin-top:15px;"></div>
        </div>
      </div>
    </div>

    <script>
      let currentPage = 1, currentCategory = 'all', allMoviesData = [];
      let currentVideoLink = "";
      let controlsTimeout;
      let currentMovieId = ""; // To track current movie for continue watching

      function getClientSkeleton(count) {
        return Array(count).fill('<div class="card skeleton" style="min-width:110px; height:160px;"></div>').join('');
      }

      window.addEventListener('popstate', function(event) {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const view = urlParams.get('view');
        if (!movieId) closePlayerInternal();
        if (view === 'grid') showGridInternal();
        else goHomeInternal();
      });

      window.onload = async () => {
        loadHomeData();
        setupPlayerIdle();
        
        // 🔥 Setup Continue Watching Listener
        const vid = document.getElementById('video');
        vid.addEventListener('timeupdate', () => {
            if(vid.currentTime > 5 && currentMovieId) {
                // Save progress (MovieID + VideoLink as unique key if needed, or just MovieID)
                localStorage.setItem('watch_' + currentMovieId, vid.currentTime.toString());
            }
        });

        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const view = urlParams.get('view');
        if (movieId) fetchSingleMovie(movieId);
        else if (view === 'grid') {
             const cat = urlParams.get('cat') || 'all';
             openCategory(cat, false);
        }
      };

      async function loadHomeData() {
        fetchRow('movies', 'row_movies');
        fetchRow('series', 'row_series');
        fetchRow(encodeURIComponent('18+'), 'row_18');
      }

      async function fetchRow(cat, elemId) {
        try {
            const res = await fetch(\`/api/movies?page=1&cat=\${cat}\`);
            const json = await res.json();
            const container = document.getElementById(elemId);
            if(json.data.length === 0) {
                container.innerHTML = '<p style="color:#555; padding:10px; font-size:12px;">No contents</p>';
                return;
            }
            const html = json.data.slice(0, 10).map(m => createCardHtml(m)).join('');
            container.innerHTML = html;
        } catch(e) { console.log(e); }
      }

      function createCardHtml(m) {
        const tagHtml = m.tags && m.tags.length > 0 ? \`<div class="card-tag">\${m.tags[0]}</div>\` : '';
        return \`<div class="card" onclick="openModalById('\${m.id}')">
            <img src="\${m.image}" loading="lazy" onerror="this.src='https://via.placeholder.com/150x225?text=No+Img'">
            \${tagHtml}
            <div class="title">\${m.title}</div>
        </div>\`;
      }

      // --- Navigation Functions ---
      function goHome() {
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({path:newUrl},'',newUrl);
        goHomeInternal();
      }
      function goHomeInternal() {
        document.getElementById('homeView').style.display = 'block';
        document.getElementById('gridViewContainer').style.display = 'none';
        document.getElementById('backNav').style.display = 'none';
        document.getElementById('searchInput').value = '';
      }
      function showGridInternal() {
        document.getElementById('homeView').style.display = 'none';
        document.getElementById('gridViewContainer').style.display = 'block';
        document.getElementById('backNav').style.display = 'flex';
      }

      function openCategory(cat, pushState = true) {
        currentCategory = cat;
        showGridInternal();
        document.getElementById('gridTitle').innerText = cat.toUpperCase().replace('%20', ' ');
        if(pushState) {
            const encodedCat = encodeURIComponent(cat);
            const newUrl = \`?view=grid&cat=\${encodedCat}\`;
            window.history.pushState({path:newUrl},'',newUrl);
        }
        fetchMovies(1, cat);
      }

      // 🔥 OPEN FAVORITES
      async function openFavorites() {
        showGridInternal();
        document.getElementById('gridTitle').innerText = "MY FAVORITES";
        document.getElementById('mainGrid').innerHTML = getClientSkeleton(5);
        document.getElementById('pagControls').style.display = 'none';
        
        // Push state
        const newUrl = \`?view=grid&cat=fav\`;
        window.history.pushState({path:newUrl},'',newUrl);

        // Get IDs from LocalStorage
        const favs = JSON.parse(localStorage.getItem('my_favs') || '[]');
        if(favs.length === 0) {
            document.getElementById('mainGrid').innerHTML = '<p style="text-align:center; padding:20px;">No favorites yet.</p>';
            return;
        }

        // We need to fetch search logic to get multiple IDs or fetch one by one.
        // For simplicity, we assume we have a search endpoint or we fetch all relevant.
        // Better approach: We fetch page 1 of 'all' and filter client side OR better backend support.
        // Since we don't have 'get_by_ids' API, we will try to fetch 'all' mostly.
        // Workaround: Loop fetch 'get_movie' for each ID (A bit slow but works for small lists)
        
        let html = '';
        for(const id of favs) {
            try {
                const res = await fetch(\`/api/get_movie?id=\${id}\`);
                const m = await res.json();
                if(m && m.title) {
                    html += createCardHtml(m);
                    // Also store in allMoviesData so we can open it
                    if(!allMoviesData.find(x=>x.id === m.id)) allMoviesData.push(m);
                }
            } catch(e){}
        }
        document.getElementById('mainGrid').innerHTML = html || '<p>Error loading favorites</p>';
      }

      async function executeSearch() {
        const query = document.getElementById('searchInput').value;
        if(!query) return goHome();
        showGridInternal();
        document.getElementById('gridTitle').innerText = "SEARCH: " + query;
        const newUrl = \`?view=grid&q=\${encodeURIComponent(query)}\`;
        window.history.pushState({path:newUrl},'',newUrl);
        document.getElementById('mainGrid').innerHTML = getClientSkeleton(10);
        document.getElementById('pagControls').style.display = 'none';
        const res = await fetch(\`/api/search?q=\${encodeURIComponent(query)}\`);
        const results = await res.json();
        allMoviesData = results;
        renderGrid(results);
      }
      function handleSearchKey(e) { if (e.key === 'Enter') executeSearch(); }

      async function fetchMovies(page, cat) {
        document.getElementById('mainGrid').innerHTML = getClientSkeleton(10);
        const encodedCat = (cat === 'all' || cat === 'movies' || cat === 'series') ? cat : encodeURIComponent(cat);
        const res = await fetch(\`/api/movies?page=\${page}&cat=\${encodedCat}\`);
        const json = await res.json();
        allMoviesData = json.data;
        renderGrid(json.data);
        updatePagination(json);
        currentPage = json.currentPage;
      }
      function renderGrid(data) {
        const grid = document.getElementById('mainGrid');
        if(data.length === 0) grid.innerHTML = '<p>No contents.</p>';
        else grid.innerHTML = data.map(m => createCardHtml(m)).join('');
      }

      function setupPlayerIdle() {
        const wrapper = document.getElementById('videoWrapper');
        const overlay = document.getElementById('playerOverlay');
        const resetTimer = () => {
            overlay.classList.remove('hidden'); 
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => {
                const vid = document.getElementById('video');
                if(!vid.paused) overlay.classList.add('hidden');
            }, 3000);
        };
        wrapper.addEventListener('mousemove', resetTimer);
        wrapper.addEventListener('touchstart', resetTimer);
        wrapper.addEventListener('click', resetTimer);
      }

      async function fetchSingleMovie(id) {
        document.getElementById('playerModal').style.display = 'block';
        document.getElementById('m_title').innerText = "Loading...";
        document.getElementById('m_desc').innerText = "";
        document.getElementById('m_tags').innerHTML = "";
        document.getElementById('ep_section').innerHTML = "";
        document.getElementById('coverOverlay').style.backgroundImage = "";
        document.getElementById('error-msg').style.display = "none";
        
        const res = await fetch(\`/api/get_movie?id=\${id}\`);
        const movie = await res.json();
        if(movie && movie.title) setupModal(movie);
      }

      function openModalById(id) {
        const movie = allMoviesData.find(m => m.id === id) || {id: id}; 
        if(!movie.title) { fetchSingleMovie(id); }
        else { setupModal(movie); }
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view');
        const viewParam = view ? \`&view=\${view}\` : '';
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?id=' + id + viewParam;
        window.history.pushState({path:newUrl},'',newUrl);
      }

      function setupModal(movie) {
        currentMovieId = movie.id; // 🔥 Track ID
        const modal = document.getElementById('playerModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        document.getElementById('m_title').innerText = movie.title;
        document.getElementById('m_desc').innerText = movie.description || "";
        const coverDiv = document.getElementById('coverOverlay');
        coverDiv.style.backgroundImage = \`url('\${movie.cover || movie.image}')\`;
        coverDiv.style.display = 'flex';
        document.getElementById('video').style.display = 'none';
        document.getElementById('video').pause();
        document.getElementById('m_tags').innerHTML = movie.tags ? movie.tags.map(t => \`<span class="tag-pill">\${t}</span>\`).join('') : '';
        document.getElementById('error-msg').style.display = "none";
        
        // 🔥 UPDATE FAVORITE BUTTON STATE
        updateFavBtnState();

        if (!movie.episodes || movie.episodes.length <= 1) {
             document.getElementById('ep_section').style.display = 'none';
             currentVideoLink = (movie.episodes && movie.episodes[0]) ? movie.episodes[0].link : movie.link; 
        } else {
             document.getElementById('ep_section').style.display = 'block';
             renderAccordion(movie.episodes);
             currentVideoLink = movie.episodes[0].link;
        }
      }

      // 🔥 FAVORITE LOGIC
      function updateFavBtnState() {
          const favs = JSON.parse(localStorage.getItem('my_favs') || '[]');
          const btn = document.getElementById('favBtn');
          if(favs.includes(currentMovieId)) {
              btn.innerHTML = "❤️ Saved";
              btn.classList.add('active');
          } else {
              btn.innerHTML = "🤍 Add to Fav";
              btn.classList.remove('active');
          }
      }

      window.toggleFavorite = function() {
          if(!currentMovieId) return;
          let favs = JSON.parse(localStorage.getItem('my_favs') || '[]');
          if(favs.includes(currentMovieId)) {
              favs = favs.filter(id => id !== currentMovieId);
          } else {
              favs.push(currentMovieId);
          }
          localStorage.setItem('my_favs', JSON.stringify(favs));
          updateFavBtnState();
      };

      function startPlayback() {
        document.getElementById('coverOverlay').style.display = 'none';
        const vid = document.getElementById('video');
        vid.style.display = 'block';
        
        // 🔥 Check Continue Watching
        const savedTime = localStorage.getItem('watch_' + currentMovieId);
        
        playViaSecureToken(currentVideoLink).then(() => {
            if(savedTime) {
                // Small timeout to ensure video metadata loaded
                setTimeout(() => {
                    vid.currentTime = parseFloat(savedTime);
                }, 500);
            }
        });
      }
      
      function renderAccordion(episodes) {
        const container = document.getElementById('ep_section');
        container.innerHTML = "";
        const seasons = {};
        episodes.forEach(ep => {
            let group = "Videos"; 
            const match = ep.label.match(/^(Season \\d+|S\\d+)/i);
            if(match) {
                let g = match[0];
                if(g.toUpperCase().startsWith('S') && !g.toUpperCase().startsWith('SEASON')) {
                    g = g.replace(/^S/i, 'Season ');
                }
                group = g;
            }
            if(ep.label === 'Movie') group = "Movie";
            if(!seasons[group]) seasons[group] = [];
            seasons[group].push(ep);
        });

        Object.keys(seasons).sort().forEach((key, idx) => {
            const btn = document.createElement('button');
            btn.className = "accordion";
            btn.innerHTML = key;
            const panel = document.createElement('div');
            panel.className = "panel";
            const grid = document.createElement('div');
            grid.className = "episode-grid";
            grid.innerHTML = seasons[key].map(ep => {
                const cleanLabel = ep.label.replace(key, '').trim() || ep.label;
                return \`<button class="ep-btn" onclick="switchEpisode(this, '\${ep.link}')">\${cleanLabel}</button>\`;
            }).join('');
            panel.appendChild(grid);
            container.appendChild(btn);
            container.appendChild(panel);
            btn.addEventListener("click", function() {
                this.classList.toggle("active");
                if (panel.style.maxHeight) { panel.style.maxHeight = null; } 
                else { panel.style.maxHeight = "400px"; }
            });
        });
      }

      function switchEpisode(btn, link) {
        document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentVideoLink = link;
        if(document.getElementById('video').style.display !== 'none') playViaSecureToken(link);
        else startPlayback();
      }

      async function playViaSecureToken(realUrl) {
        const vid = document.getElementById('video');
        vid.style.display = 'block';
        document.getElementById('error-msg').style.display = "none"; 
        
        const showFallback = () => {
            vid.style.display = 'none'; 
            const errDiv = document.getElementById('error-msg');
            const btn = document.getElementById('fallback-btn');
            btn.href = realUrl;
            errDiv.style.display = "flex"; 
        };

        if (realUrl.includes('.m3u8')) {
            vid.src = ""; 
            if (vid.canPlayType('application/vnd.apple.mpegurl')) {
                vid.src = realUrl;
                vid.addEventListener('loadedmetadata', () => {
                    vid.play().catch(e => console.log("Native Play prevented"));
                });
                vid.onerror = () => tryHlsJs(vid, realUrl, showFallback);
            } 
            else {
                tryHlsJs(vid, realUrl, showFallback);
            }
            return;
        }

        try {
            const res = await fetch('/api/sign_url', { method: 'POST', body: JSON.stringify({ url: realUrl }) });
            const json = await res.json();
            if(json.token) { 
                vid.src = "/api/play?t=" + json.token; 
                vid.play().catch(showFallback); 
                vid.onerror = showFallback;
            } else { showFallback(); }
        } catch(e) { showFallback(); }
      }

      function tryHlsJs(vid, url, fallbackCb) {
          if (Hls.isSupported()) {
                const hls = new Hls({ debug: false });
                hls.loadSource(url);
                hls.attachMedia(vid);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    vid.play().catch(() => {});
                });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data.fatal) {
                        hls.destroy();
                        fallbackCb();
                    }
                });
          } else {
              fallbackCb();
          }
      }

      function closePlayerInternal() {
        const vid = document.getElementById('video'); vid.pause(); vid.src="";
        document.getElementById('playerModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        if (document.fullscreenElement) document.exitFullscreen();
      }
      function closePlayer() {
        closePlayerInternal();
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view');
        let newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        if(view) newUrl += \`?view=\${view}\`; 
        window.history.pushState({path:newUrl},'',newUrl);
      }
      function toggleFullScreen() {
        const wrapper = document.getElementById('videoWrapper');
        if (!document.fullscreenElement) {
            if(wrapper.requestFullscreen) wrapper.requestFullscreen();
            if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{});
        } else { if(document.exitFullscreen) document.exitFullscreen(); }
      }
      function updatePagination(info) {
        const div = document.getElementById('pagControls');
        if(info.totalPages > 1) {
          div.style.display = 'flex';
          document.getElementById('prevBtn').disabled = !info.hasPrev;
          document.getElementById('nextBtn').disabled = !info.hasNext;
          document.getElementById('pageInfo').innerText = \`Page \${info.currentPage}\`;
        } else div.style.display = 'none';
      }
      function changePage(d) { fetchMovies(currentPage + d, currentCategory); }
    </script>
  </body>
  </html>
  `;
}
