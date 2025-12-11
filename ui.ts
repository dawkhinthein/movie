export function renderWebsite() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>My Streaming App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <style>
      body { background: #121212; color: #e0e0e0; font-family: 'Segoe UI', sans-serif; margin:0; padding-bottom: 60px; user-select: none; }
      
      /* --- Header --- */
      header { background: rgba(20, 20, 20, 0.95); backdrop-filter: blur(10px); padding: 10px 20px; position: sticky; top:0; z-index:50; border-bottom: 1px solid #333; display:flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
      .brand { color: #e50914; font-weight: bold; font-size: 20px; text-decoration: none; cursor:pointer;}
      
      .search-box { display: flex; align-items: center; background: #222; border: 1px solid #444; border-radius: 20px; padding: 5px 15px; }
      .search-input { background: transparent; border: none; color: white; outline: none; width: 120px; transition: 0.3s; }
      .search-input:focus { width: 180px; }

      /* --- Home Section Layout (Rows) --- */
      .home-section { padding: 20px 0 10px 15px; }
      .section-head { display: flex; justify-content: space-between; align-items: center; padding-right: 15px; margin-bottom: 10px; }
      .section-title { color: #fff; font-size: 18px; font-weight: 600; border-left: 4px solid #e50914; padding-left: 10px; }
      .see-more { color: #aaa; font-size: 12px; cursor: pointer; text-decoration: none; font-weight: bold; }
      .see-more:hover { color: #e50914; }

      /* Horizontal Scrolling Row */
      .scroll-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px; scroll-behavior: smooth; }
      .scroll-row::-webkit-scrollbar { height: 6px; }
      .scroll-row::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
      .scroll-row .card { min-width: 140px; max-width: 140px; }

      /* --- Grid Layout (For 'See More') --- */
      .container { max-width: 1200px; margin: 0 auto; padding: 15px; display: none; /* Hidden by default */ }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      @media (min-width: 600px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 15px; } }
      @media (min-width: 900px) { .grid { grid-template-columns: repeat(5, 1fr); gap: 20px; } }

      /* --- Card Styles --- */
      .card { background: #1f1f1f; border-radius: 8px; overflow: hidden; cursor: pointer; position: relative; transition: transform 0.2s; }
      .card:hover { transform: scale(1.05); z-index: 10; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; display: block; }
      .title { padding: 8px; font-size: 12px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }
      .card-tag { position: absolute; top: 5px; right: 5px; background: rgba(229, 9, 20, 0.9); color: #fff; font-size: 9px; padding: 2px 5px; border-radius: 4px; }

      /* --- Navigation Buttons (Back to Home) --- */
      .back-nav { display: none; padding: 10px 15px; }
      .back-btn { background: #333; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; display: flex; align-items: center; gap: 5px; }
      .back-btn:hover { background: #555; }

      /* --- Player & Modal --- */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:black; z-index:100; overflow-y: auto; }
      .modal-content { width: 100%; max-width: 1000px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #111; }
      
      .video-area { position: sticky; top: 0; z-index: 10; background:black; width: 100%; aspect-ratio: 16/9; position: relative; overflow: hidden; }
      video { width: 100%; height: 100%; background: black; display: none; }
      
      /* 🔥 FADING CONTROLS */
      .player-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 15px; box-sizing: border-box; transition: opacity 0.4s ease; opacity: 1; pointer-events: none; background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent 30%, transparent 70%, rgba(0,0,0,0.7)); }
      .player-overlay.hidden { opacity: 0; }
      
      .ctrl-btn { pointer-events: auto; background: rgba(50,50,50,0.8); color: white; border: 1px solid #555; padding: 8px 14px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight:bold; backdrop-filter: blur(5px); }
      .ctrl-btn:hover { background: #e50914; border-color: #e50914; }
      .top-controls { display: flex; justify-content: flex-end; }
      .bottom-controls { display: flex; justify-content: flex-end; margin-bottom: 30px; }

      .cover-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; }
      .play-btn-circle { width: 65px; height: 65px; background: rgba(229, 9, 20, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
      .play-btn-circle::after { content: '▶'; color: white; font-size: 26px; margin-left: 4px; }

      /* Info & Accordion */
      .info-sec { padding: 20px; }
      h2 { margin: 0; color: #fff; font-size: 20px; }
      .tag-pill { background: #333; color: #aaa; font-size: 11px; padding: 3px 8px; border-radius: 10px; margin-right:5px; }
      p.desc { color: #bbb; font-size: 14px; margin-top: 10px; line-height: 1.5; }
      
      .accordion { background-color: #222; color: #eee; cursor: pointer; padding: 12px; width: 100%; border: none; text-align: left; outline: none; font-size: 15px; font-weight: bold; border-bottom: 1px solid #333; display: flex; justify-content: space-between; margin-top: 5px; border-radius: 4px; }
      .accordion.active { background-color: #333; color: #e50914; }
      .panel { padding: 0 10px; background-color: #111; max-height: 0; overflow: hidden; transition: max-height 0.2s ease-out; }
      .episode-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 8px; padding: 15px 0; }
      .ep-btn { background: #222; border: 1px solid #444; color: #ddd; padding: 8px; cursor: pointer; border-radius: 4px; font-size: 12px; }
      .ep-btn.active { background: #e50914; color: white; border-color: #e50914; }

      /* Pagination */
      .pagination { display: flex; justify-content: center; gap: 15px; margin-top: 30px; padding-bottom: 20px;}
      .page-btn { padding: 8px 16px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer; }
    </style>
  </head>
  <body>

    <header>
      <div class="brand" onclick="goHome()">MY MOVIE</div>
      <div class="search-box">
        <input type="text" id="searchInput" class="search-input" placeholder="Search..." onkeypress="handleSearch(event)">
        <span style="color:#888;">🔍</span>
      </div>
    </header>

    <div id="homeView">
        <div class="home-section">
            <div class="section-head">
                <span class="section-title">Latest Movies</span>
                <a class="see-more" onclick="openCategory('movies')">See More ></a>
            </div>
            <div class="scroll-row" id="row_movies">
                ${getSkeletonRow()}
            </div>
        </div>

        <div class="home-section">
            <div class="section-head">
                <span class="section-title">TV Series</span>
                <a class="see-more" onclick="openCategory('series')">See More ></a>
            </div>
            <div class="scroll-row" id="row_series">
                 ${getSkeletonRow()}
            </div>
        </div>

        <div class="home-section">
            <div class="section-head">
                <span class="section-title" style="border-color: #ff0055;">18+ Collections</span>
                <a class="see-more" onclick="openCategory('18+')">See More ></a>
            </div>
            <div class="scroll-row" id="row_18">
                 ${getSkeletonRow()}
            </div>
        </div>
    </div>

    <div class="back-nav" id="backNav">
        <button class="back-btn" onclick="goHome()">⬅ Back to Home</button>
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
            
            <div class="player-overlay" id="playerOverlay">
                <div class="top-controls">
                    <button class="ctrl-btn" onclick="closePlayer()">❌ Close</button>
                </div>
                <div class="bottom-controls">
                    <button class="ctrl-btn" onclick="toggleFullScreen()">⛶ Fullscreen</button>
                </div>
            </div>
        </div>
        
        <div class="info-sec">
          <h2 id="m_title"></h2>
          <div style="margin:10px 0" id="m_tags"></div>
          <div id="ep_section" style="margin-top:15px;"></div>
          <p id="m_desc" class="desc"></p>
        </div>
      </div>
    </div>

    <script>
      let currentPage = 1, currentCategory = 'all', allMoviesData = [];
      let currentVideoLink = "";
      let controlsTimeout;

      window.addEventListener('popstate', function(event) {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        if (!movieId) closePlayerInternal(); 
      });

      window.onload = async () => {
        // Load Home Rows
        loadHomeData();
        
        // Setup Player Idle Detection
        setupPlayerIdle();

        // Check for direct link
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        if (movieId) fetchSingleMovie(movieId);
      };

      // --- HOME PAGE LOGIC ---
      async function loadHomeData() {
        fetchRow('movies', 'row_movies');
        fetchRow('series', 'row_series');
        fetchRow('18+', 'row_18');
      }

      async function fetchRow(cat, elemId) {
        try {
            const res = await fetch(\`/api/movies?page=1&cat=\${cat}\`);
            const json = await res.json();
            const container = document.getElementById(elemId);
            
            if(json.data.length === 0) {
                container.innerHTML = '<p style="color:#555; padding:10px;">No contents</p>';
                return;
            }
            // Limit to 10 items for row
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

      // --- NAVIGATION LOGIC ---
      function goHome() {
        document.getElementById('homeView').style.display = 'block';
        document.getElementById('gridViewContainer').style.display = 'none';
        document.getElementById('backNav').style.display = 'none';
        document.getElementById('searchInput').value = '';
      }

      function openCategory(cat) {
        currentCategory = cat;
        document.getElementById('homeView').style.display = 'none';
        document.getElementById('gridViewContainer').style.display = 'block';
        document.getElementById('backNav').style.display = 'block';
        fetchMovies(1, cat);
      }

      async function handleSearch(e) {
        if (e.key === 'Enter') {
            const query = document.getElementById('searchInput').value;
            if(!query) return goHome();
            
            document.getElementById('homeView').style.display = 'none';
            document.getElementById('gridViewContainer').style.display = 'block';
            document.getElementById('backNav').style.display = 'block';
            
            document.getElementById('mainGrid').innerHTML = '<p>Searching...</p>';
            document.getElementById('pagControls').style.display = 'none';
            
            const res = await fetch(\`/api/search?q=\${encodeURIComponent(query)}\`);
            const results = await res.json();
            allMoviesData = results;
            renderGrid(results);
        }
      }

      // --- GRID LOGIC ---
      async function fetchMovies(page, cat) {
        document.getElementById('mainGrid').innerHTML = '<p>Loading...</p>';
        const res = await fetch(\`/api/movies?page=\${page}&cat=\${cat}\`);
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

      // --- PLAYER LOGIC (With Idle Hide) ---
      function setupPlayerIdle() {
        const wrapper = document.getElementById('videoWrapper');
        const overlay = document.getElementById('playerOverlay');
        
        const resetTimer = () => {
            overlay.classList.remove('hidden'); // Show
            clearTimeout(controlsTimeout);
            // Hide after 3 seconds of no activity
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
        const res = await fetch(\`/api/get_movie?id=\${id}\`);
        const movie = await res.json();
        if(movie && movie.title) setupModal(movie);
      }

      function openModalById(id) {
        const movie = allMoviesData.find(m => m.id === id) || {id: id}; 
        // If not in current list, fetch it (handled by logic below mostly)
        if(!movie.title) { fetchSingleMovie(id); }
        else { setupModal(movie); }
        
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?id=' + id;
        window.history.pushState({path:newUrl},'',newUrl);
      }

      function setupModal(movie) {
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
        const epSection = document.getElementById('ep_section');
        epSection.innerHTML = "";
        
        if (movie.episodes.length === 1) {
            currentVideoLink = movie.episodes[0].link;
        } else {
            renderAccordion(movie.episodes);
            currentVideoLink = movie.episodes[0].link;
        }
      }

      function startPlayback() {
        document.getElementById('coverOverlay').style.display = 'none';
        const vid = document.getElementById('video');
        vid.style.display = 'block';
        playViaSecureToken(currentVideoLink);
      }
      
      function renderAccordion(episodes) {
        const container = document.getElementById('ep_section');
        const seasons = {};
        episodes.forEach(ep => {
            const match = ep.label.match(/(S\d+|Season \d+)/i);
            const seasonName = match ? match[0].toUpperCase() : "Episodes";
            if(!seasons[seasonName]) seasons[seasonName] = [];
            seasons[seasonName].push(ep);
        });

        Object.keys(seasons).sort().forEach((seasonKey, index) => {
            const btn = document.createElement("button");
            btn.className = "accordion";
            btn.innerHTML = seasonKey;
            const panel = document.createElement("div");
            panel.className = "panel";
            const grid = document.createElement("div");
            grid.className = "episode-grid";
            grid.innerHTML = seasons[seasonKey].map(ep => \`
                <button class="ep-btn" onclick="switchEpisode(this, '\${ep.link}')">\${ep.label.replace(seasonKey, '').trim() || ep.label}</button>
            \`).join('');
            panel.appendChild(grid);
            container.appendChild(btn);
            container.appendChild(panel);
            btn.addEventListener("click", function() {
                this.classList.toggle("active");
                panel.style.maxHeight = panel.style.maxHeight ? null : panel.scrollHeight + "px";
            });
            if(index === 0) btn.click();
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
        if(Hls.isSupported() && realUrl.includes('.m3u8')) {
           const hls = new Hls(); hls.loadSource(realUrl); hls.attachMedia(vid);
           hls.on(Hls.Events.MANIFEST_PARSED, () => vid.play());
           return;
        }
        try {
            const res = await fetch('/api/sign_url', { method: 'POST', body: JSON.stringify({ url: realUrl }) });
            const json = await res.json();
            if(json.token) { vid.src = "/api/play?t=" + json.token; vid.play(); }
        } catch(e) {}
      }

      function closePlayerInternal() {
        const vid = document.getElementById('video'); vid.pause(); vid.src="";
        document.getElementById('playerModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        if (document.fullscreenElement) document.exitFullscreen();
      }
      function closePlayer() {
        closePlayerInternal();
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
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

function getSkeletonRow() {
    // Helper to make initial HTML nicer
    return Array(5).fill('<div class="card" style="min-width:140px; background:#222;"></div>').join('');
}
