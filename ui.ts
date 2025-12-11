export function renderWebsite() {
  
  function getServerSkeleton() {
    return Array(6).fill('<div class="card skeleton" style="min-width:110px; height:160px;"></div>').join('');
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Stream App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <style>
      /* --- GLOBAL RESET --- */
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      body { background: #121212; color: #e0e0e0; font-family: 'Segoe UI', sans-serif; margin:0; padding-bottom: 60px; user-select: none; overflow-x: hidden; }
      
      /* --- HEADER --- */
      header { background: rgba(18, 18, 18, 0.98); backdrop-filter: blur(10px); padding: 12px 15px; position: sticky; top:0; z-index:50; border-bottom: 1px solid #333; display:flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
      .brand { color: #e50914; font-weight: 900; font-size: 22px; text-decoration: none; cursor:pointer; letter-spacing: 1px; }
      
      .search-box { display: flex; align-items: center; background: #222; border: 1px solid #444; border-radius: 25px; padding: 5px 12px; width: 50%; max-width: 200px; transition: 0.3s; }
      .search-input { background: transparent; border: none; color: white; outline: none; width: 100%; font-size: 14px; }
      .icon-btn { background: none; border: none; color: white; font-size: 22px; cursor: pointer; padding: 5px; }

      /* --- 🔥 PAGE TRANSITION LOADER --- */
      #global-loader {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: #121212; z-index: 9999;
          display: flex; justify-content: center; align-items: center;
          transition: opacity 0.3s;
      }
      .spinner {
          width: 40px; height: 40px; border: 4px solid #333;
          border-top: 4px solid #e50914; border-radius: 50%;
          animation: spin 0.8s linear infinite;
      }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .hidden-loader { opacity: 0; pointer-events: none; }

      /* --- USER SIDEBAR --- */
      .user-panel { position: fixed; top: 0; right: 0; width: 280px; height: 100%; background: #1a1a1a; z-index: 100; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); padding: 20px; box-shadow: -5px 0 20px rgba(0,0,0,0.7); display: flex; flex-direction: column; }
      .user-panel.open { transform: translateX(0); }
      .panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px; }
      .auth-input { width: 100%; padding: 12px; margin: 8px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 8px; box-sizing: border-box; outline: none; }
      .auth-input:focus { border-color: #e50914; }
      .auth-btn { width: 100%; padding: 12px; background: #e50914; color: white; border: none; font-weight: bold; cursor: pointer; border-radius: 8px; margin-top: 10px; transition: 0.2s; }
      .auth-btn:active { transform: scale(0.98); }
      .auth-btn.secondary { background: #333; margin-top: 5px; }

      /* --- HOME LAYOUT --- */
      .home-section { padding: 20px 0 5px 15px; }
      .section-head { display: flex; justify-content: space-between; align-items: center; padding-right: 15px; margin-bottom: 12px; }
      .section-title { color: #fff; font-size: 16px; font-weight: 700; border-left: 4px solid #e50914; padding-left: 10px; }
      .see-more { color: #aaa; font-size: 12px; cursor: pointer; font-weight: 600; text-decoration: none; }
      
      .scroll-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 15px; scroll-behavior: smooth; }
      .scroll-row::-webkit-scrollbar { display: none; } 
      .scroll-row .card { min-width: 115px; max-width: 115px; }

      /* --- GRID SYSTEM --- */
      .container { max-width: 1200px; margin: 0 auto; padding: 15px; display: none; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      @media (min-width: 600px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 15px; } }
      
      .card { background: #1f1f1f; border-radius: 8px; overflow: hidden; cursor: pointer; position: relative; transition: transform 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }
      .card:active { transform: scale(0.96); }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; display: block; }
      .title { padding: 8px 5px; font-size: 11px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ddd; }
      .prem-tag { position: absolute; top: 0; left: 0; background: #ffd700; color: #000; font-size: 9px; font-weight: bold; padding: 2px 6px; border-bottom-right-radius: 6px; z-index: 2; }
      
      .back-nav { display: none; padding: 10px 15px; align-items: center; gap: 10px; background: #121212; position: sticky; top: 59px; z-index: 40; border-bottom: 1px solid #222; }
      .back-btn { background: #333; color: white; border: none; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: bold; display: flex; align-items: center; gap: 5px; }
      
      /* --- PLAYER MODAL --- */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:black; z-index:200; overflow-y: auto; animation: slideUp 0.3s ease-out; }
      @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

      .modal-content { width: 100%; max-width: 1000px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #111; }
      .video-area { position: sticky; top: 0; z-index: 10; background:black; width: 100%; aspect-ratio: 16/9; position: relative; }
      video { width: 100%; height: 100%; background: black; }
      
      /* 🔥 FIX: VIP LOCK CENTERED */
      #vip-lock { 
          display: none; position: absolute; top:0; left:0; width:100%; height:100%; 
          background: #000; /* Solid Black */
          flex-direction: column; align-items: center; justify-content: center; 
          text-align: center; padding: 20px; z-index: 25; 
      }
      #vip-lock h2 { color: #ffd700; margin-bottom: 10px; font-size: 24px; }
      #vip-lock p { color: #ccc; font-size: 14px; margin-bottom: 20px; max-width: 80%; line-height: 1.5; }

      /* Info & Controls */
      .info-sec { padding: 20px; }
      h2#m_title { margin: 0; color: #fff; font-size: 18px; line-height: 1.3; }
      .action-row { display: flex; gap: 10px; margin: 15px 0; align-items: center; }
      .fav-btn { background: #222; border: 1px solid #444; color: #ccc; padding: 8px 15px; border-radius: 20px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 5px; transition: 0.2s; }
      .fav-btn.active { color: #e50914; border-color: #e50914; background: rgba(229,9,20,0.1); }
      .dl-btn { background: #4db8ff; color: #000; padding: 8px 15px; border-radius: 20px; text-decoration: none; font-size: 12px; font-weight: bold; }
      .tag-pill { background: #333; color: #aaa; font-size: 10px; padding: 3px 8px; border-radius: 10px; margin-right:5px; }
      p.desc { color: #bbb; font-size: 14px; line-height: 1.6; margin-top: 15px; }

      /* Episodes */
      .accordion { background-color: #222; color: #eee; cursor: pointer; padding: 14px; width: 100%; border: none; text-align: left; outline: none; font-size: 15px; font-weight: bold; border-bottom: 1px solid #333; display: flex; justify-content: space-between; margin-top: 5px; border-radius: 6px; }
      .accordion.active { background-color: #333; color: #e50914; }
      .panel { padding: 0 5px; background-color: #151515; max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
      .episode-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 8px; padding: 15px 5px; max-height: 350px; overflow-y: auto; }
      .ep-btn { background: #2a2a2a; border: 1px solid #444; color: #ddd; padding: 10px 5px; cursor: pointer; border-radius: 4px; font-size: 12px; text-align: center; }
      .ep-btn.active { background: #e50914; color: white; border-color: #e50914; font-weight: bold; }

      /* Player Overlays */
      .player-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 15px; box-sizing: border-box; transition: opacity 0.3s; pointer-events: none; background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent 30%, transparent 70%, rgba(0,0,0,0.6)); }
      .ctrl-btn { pointer-events: auto; background: rgba(30,30,30,0.6); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold; backdrop-filter: blur(4px); }
      .top-controls { display: flex; justify-content: flex-end; }
      .bottom-controls { display: flex; justify-content: flex-end; gap: 10px; }
      .cover-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; }
      .play-btn-circle { width: 60px; height: 60px; background: rgba(229, 9, 20, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
      .play-btn-circle::after { content: '▶'; color: white; font-size: 24px; margin-left: 4px; }
      
      /* Error / Fallback */
      #error-msg { display:none; position:absolute; top:0; left:0; width:100%; height:100%; background: #000; flex-direction: column; align-items: center; justify-content: center; z-index: 15; }
      .retry-btn { background: #333; border: 1px solid #555; color: white; padding: 10px 20px; border-radius: 30px; cursor: pointer; font-weight: bold; text-decoration: none; display:flex; align-items:center; gap:8px; }

      .pagination { display: flex; justify-content: center; gap: 15px; margin-top: 30px; padding-bottom: 20px;}
      .page-btn { padding: 8px 16px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer; }
      
      /* Skeleton */
      @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
      .skeleton { animation: shimmer 2s infinite linear; background: linear-gradient(to right, #222 4%, #333 25%, #222 36%); background-size: 1000px 100%; border-radius: 6px; }
    </style>
  </head>
  <body>

    <div id="global-loader"><div class="spinner"></div></div>

    <header>
      <div class="brand" onclick="goHome()">MY APP</div>
      <div class="search-box">
        <input type="text" id="searchInput" class="search-input" placeholder="Search..." onkeypress="handleSearchKey(event)">
        <button class="icon-btn" onclick="executeSearch()">🔍</button>
      </div>
      <button class="icon-btn" onclick="toggleUserPanel()">👤</button>
    </header>

    <div id="userPanel" class="user-panel">
        <div class="panel-head">
            <h3 id="u_head" style="margin:0; color:#fff;">Account</h3>
            <button class="icon-btn" onclick="toggleUserPanel()">✕</button>
        </div>
        
        <div id="loginForm">
            <input type="text" id="reg_user" class="auth-input" placeholder="Username">
            <input type="password" id="reg_pass" class="auth-input" placeholder="Password">
            <button class="auth-btn" onclick="doLogin()">Login</button>
            <button class="auth-btn secondary" onclick="doRegister()">Register New</button>
        </div>

        <div id="profileView" style="display:none;">
            <p style="color:#aaa; font-size:13px;">Logged in as:</p>
            <h3 id="u_name" style="color:#e50914; margin-top:0;">User</h3>
            <div style="background:#222; padding:10px; border-radius:6px; margin:10px 0;">
                <p style="margin:0; font-size:12px; color:#aaa;">Status</p>
                <p id="u_status" style="margin:5px 0; font-weight:bold;">Free Plan</p>
            </div>
            <p style="margin-bottom:5px; font-size:13px;">Redeem Code:</p>
            <div style="display:flex; gap:5px;">
                <input type="text" id="vip_code" class="auth-input" style="margin:0;" placeholder="Code">
                <button class="auth-btn" style="margin:0; width:auto;" onclick="doRedeem()">Go</button>
            </div>
            <button class="auth-btn secondary" style="margin-top:20px;" onclick="openFavorites(); toggleUserPanel();">❤️ My Favorites</button>
            <button class="auth-btn secondary" onclick="doLogout()">Log Out</button>
        </div>
    </div>

    <div id="homeView">
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
        <button class="back-btn" onclick="goHome()">⬅ Back</button>
        <span id="gridTitle" class="grid-title" style="margin-left:auto; margin-right:auto;"></span>
    </div>
    
    <div class="container" id="gridViewContainer">
      <div class="grid" id="mainGrid"></div>
      <div class="pagination" id="pagControls" style="display:none;">
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
            
            <div id="vip-lock">
                <div style="font-size:40px; margin-bottom:10px;">👑</div>
                <h2>Premium Content</h2>
                <p>This content requires a VIP subscription.<br>Please login or redeem a code.</p>
                <button class="auth-btn" style="width:auto; padding:10px 30px;" onclick="closePlayer(); toggleUserPanel();">Login / Redeem</button>
            </div>

            <div id="error-msg">
                <p>⚠️ Playback Error or CORS Issue</p>
                <a id="fallback-btn" class="retry-btn" target="_blank">▶ Play Original Link</a>
            </div>

            <div class="player-overlay" id="playerOverlay">
                <div class="top-controls"><button class="ctrl-btn" onclick="closePlayer()">✕</button></div>
                <div class="bottom-controls"><button class="ctrl-btn" onclick="toggleFullScreen()">⛶</button></div>
            </div>
        </div>
        
        <div class="info-sec">
          <h2 id="m_title">Loading...</h2>
          <div style="margin:10px 0" id="m_tags"></div>
          
          <div class="action-row">
             <button id="favBtn" class="fav-btn" onclick="toggleFavorite()">🤍 Add to Fav</button>
             <div id="dl_area"></div>
          </div>

          <p id="m_desc" class="desc"></p>
          <div id="ep_section" style="margin-top:20px;"></div>
        </div>
      </div>
    </div>

    <script>
      let currentPage = 1, currentCategory = 'all', allMoviesData = [];
      let currentUser = JSON.parse(localStorage.getItem('user_session') || 'null');
      let currentMovieId = "";
      
      // --- LOADER ---
      const loader = document.getElementById('global-loader');
      function showLoader() { loader.classList.remove('hidden-loader'); }
      function hideLoader() { loader.classList.add('hidden-loader'); }

      function getClientSkeleton(count) { return Array(count).fill('<div class="card skeleton" style="min-width:110px; height:160px;"></div>').join(''); }

      // --- INITIALIZATION ---
      window.addEventListener('popstate', function(event) {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const view = urlParams.get('view');
        if (!movieId) closePlayerInternal();
        if (view === 'grid') showGridInternal();
        else goHomeInternal();
      });

      window.onload = async () => {
        updateProfileUI();
        await loadHomeData();
        setupPlayerIdle();
        hideLoader(); // Init done
        
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const view = urlParams.get('view');

        if (movieId) fetchSingleMovie(movieId);
        else if (view === 'grid') {
             const cat = urlParams.get('cat') || 'all';
             openCategory(cat, false);
        }

        const vid = document.getElementById('video');
        vid.addEventListener('timeupdate', () => {
            if(vid.currentTime > 5 && currentMovieId) localStorage.setItem('watch_' + currentMovieId, vid.currentTime);
        });
      };

      // --- AUTH ---
      function toggleUserPanel() { document.getElementById('userPanel').classList.toggle('open'); }

      function updateProfileUI() {
          if (currentUser) {
              document.getElementById('loginForm').style.display = 'none';
              document.getElementById('profileView').style.display = 'block';
              document.getElementById('u_name').innerText = currentUser.username;
              const isVip = currentUser.vipExpiry > Date.now();
              document.getElementById('u_status').innerHTML = isVip ? 
                  '<span style="color:#ffd700">👑 VIP Active</span>' : 'Free Account';
          } else {
              document.getElementById('loginForm').style.display = 'block';
              document.getElementById('profileView').style.display = 'none';
          }
      }

      async function doRegister() {
          const u = document.getElementById('reg_user').value;
          const p = document.getElementById('reg_pass').value;
          if(!u || !p) return alert("Missing fields");
          showLoader();
          const res = await fetch('/api/auth/register', { method:'POST', body:JSON.stringify({username:u, password:p}) });
          hideLoader();
          if(res.ok) alert("Registered! Please Login.");
          else alert("Username taken");
      }

      async function doLogin() {
          const u = document.getElementById('reg_user').value;
          const p = document.getElementById('reg_pass').value;
          showLoader();
          const res = await fetch('/api/auth/login', { method:'POST', body:JSON.stringify({username:u, password:p}) });
          hideLoader();
          if(res.ok) {
              currentUser = await res.json();
              localStorage.setItem('user_session', JSON.stringify(currentUser));
              updateProfileUI();
          } else alert("Invalid login");
      }

      function doLogout() {
          localStorage.removeItem('user_session');
          currentUser = null;
          updateProfileUI();
      }

      async function doRedeem() {
          const code = document.getElementById('vip_code').value;
          showLoader();
          const res = await fetch('/api/auth/redeem', { method:'POST', body:JSON.stringify({username:currentUser.username, code}) });
          hideLoader();
          if(res.ok) {
              currentUser = await res.json();
              localStorage.setItem('user_session', JSON.stringify(currentUser));
              alert("VIP Activated!");
              updateProfileUI();
          } else alert("Invalid Code");
      }

      // --- DATA ---
      async function loadHomeData() {
        // 🔥 Use Promise.all to fetch parallel
        await Promise.all([
            fetchRow('movies', 'row_movies'),
            fetchRow('series', 'row_series'),
            fetchRow(encodeURIComponent('18+'), 'row_18')
        ]);
      }

      async function fetchRow(cat, elemId) {
        try {
            const res = await fetch(\`/api/movies?page=1&cat=\${cat}\`);
            const json = await res.json();
            const container = document.getElementById(elemId);
            if(json.data.length === 0) container.innerHTML = '<p style="padding:10px; color:#555;">No content</p>';
            else container.innerHTML = json.data.slice(0,10).map(m => createCardHtml(m)).join('');
        } catch(e) {}
      }

      function createCardHtml(m) {
        const tag = m.isPremium ? '<div class="prem-tag">👑 VIP</div>' : '';
        return \`<div class="card" onclick="openModalById('\${m.id}')">
            <img src="\${m.image}" loading="lazy" onerror="this.src='https://via.placeholder.com/150x225?text=No+Img'">
            \${tag}
            <div class="title">\${m.title}</div>
        </div>\`;
      }

      // --- NAV ---
      function goHome() {
        showLoader();
        setTimeout(() => {
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.pushState({path:newUrl},'',newUrl);
            goHomeInternal();
            hideLoader();
        }, 300); // Fake delay for effect
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
        showLoader();
        currentCategory = cat;
        showGridInternal();
        document.getElementById('gridTitle').innerText = decodeURIComponent(cat).toUpperCase();
        if(pushState) {
            const encodedCat = encodeURIComponent(cat);
            const newUrl = \`?view=grid&cat=\${encodedCat}\`;
            window.history.pushState({path:newUrl},'',newUrl);
        }
        fetchMovies(1, cat).then(hideLoader);
      }

      async function openFavorites() {
        showLoader();
        showGridInternal();
        document.getElementById('gridTitle').innerText = "MY FAVORITES";
        document.getElementById('mainGrid').innerHTML = getClientSkeleton(6);
        document.getElementById('pagControls').style.display = 'none';
        
        window.history.pushState({},'','?view=grid&cat=fav');
        
        const favs = JSON.parse(localStorage.getItem('my_favs') || '[]');
        if(favs.length === 0) {
            document.getElementById('mainGrid').innerHTML = '<p style="grid-column:1/-1; text-align:center;">No favorites yet.</p>';
            hideLoader();
            return;
        }
        
        let html = '';
        for(const id of favs) {
            try {
                const res = await fetch(\`/api/get_movie?id=\${id}\`);
                const m = await res.json();
                if(m && m.title) {
                    html += createCardHtml(m);
                    if(!allMoviesData.find(x=>x.id===m.id)) allMoviesData.push(m);
                }
            } catch(e){}
        }
        document.getElementById('mainGrid').innerHTML = html;
        hideLoader();
      }

      async function executeSearch() {
        const q = document.getElementById('searchInput').value;
        if(!q) return goHome();
        showLoader();
        showGridInternal();
        document.getElementById('gridTitle').innerText = "SEARCH: " + q;
        window.history.pushState({},'','?view=grid&q='+encodeURIComponent(q));
        
        document.getElementById('mainGrid').innerHTML = getClientSkeleton(10);
        document.getElementById('pagControls').style.display = 'none';
        
        const res = await fetch(\`/api/search?q=\${encodeURIComponent(q)}\`);
        const results = await res.json();
        allMoviesData = results;
        renderGrid(results);
        hideLoader();
      }
      function handleSearchKey(e) { if(e.key==='Enter') executeSearch(); }

      async function fetchMovies(page, cat) {
        document.getElementById('mainGrid').innerHTML = getClientSkeleton(10);
        const encodedCat = (cat==='all'||cat==='movies'||cat==='series') ? cat : encodeURIComponent(cat);
        const res = await fetch(\`/api/movies?page=\${page}&cat=\${encodedCat}\`);
        const json = await res.json();
        allMoviesData = json.data;
        renderGrid(json.data);
        
        const div = document.getElementById('pagControls');
        if(json.totalPages > 1) {
            div.style.display = 'flex';
            document.getElementById('prevBtn').disabled = !json.hasPrev;
            document.getElementById('nextBtn').disabled = !json.hasNext;
            document.getElementById('pageInfo').innerText = \`Page \${json.currentPage}\`;
        } else div.style.display = 'none';
        currentPage = json.currentPage;
      }

      function renderGrid(data) {
        const grid = document.getElementById('mainGrid');
        if(!data || data.length === 0) grid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">Empty</p>';
        else grid.innerHTML = data.map(m => createCardHtml(m)).join('');
      }

      // --- PLAYER ---
      async function fetchSingleMovie(id) {
        showLoader();
        resetPlayerUI();
        document.getElementById('playerModal').style.display = 'block';
        const res = await fetch(\`/api/get_movie?id=\${id}\`);
        const movie = await res.json();
        if(movie && movie.title) setupModal(movie);
        hideLoader();
      }

      function openModalById(id) {
        const m = allMoviesData.find(x => x.id === id);
        if(m) { setupModal(m); } else { fetchSingleMovie(id); }
        
        const urlP = new URLSearchParams(window.location.search);
        const v = urlP.get('view') ? \`&view=\${urlP.get('view')}\` : '';
        const u = window.location.pathname + '?id=' + id + v;
        window.history.pushState({path:u},'',u);
      }

      function resetPlayerUI() {
          document.getElementById('m_title').innerText = "Loading...";
          document.getElementById('m_desc').innerText = "";
          document.getElementById('m_tags').innerHTML = "";
          document.getElementById('ep_section').innerHTML = "";
          document.getElementById('dl_area').innerHTML = "";
          document.getElementById('coverOverlay').style.backgroundImage = "";
          document.getElementById('vip-lock').style.display = "none";
          document.getElementById('video').style.display = "block";
      }

      function setupModal(movie) {
        currentMovieId = movie.id;
        document.getElementById('playerModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        document.getElementById('m_title').innerText = movie.title;
        document.getElementById('m_desc').innerText = movie.description || "";
        document.getElementById('coverOverlay').style.backgroundImage = \`url('\${movie.cover || movie.image}')\`;
        document.getElementById('coverOverlay').style.display = 'flex'; 
        document.getElementById('video').style.display = 'none'; 
        document.getElementById('video').pause();
        
        if(movie.tags) {
            document.getElementById('m_tags').innerHTML = movie.tags.map(t=>\`<span class="tag-pill">\${t}</span>\`).join('');
        }

        updateFavBtnState();

        const dlDiv = document.getElementById('dl_area');
        dlDiv.innerHTML = "";
        if(movie.downloadLink) {
            dlDiv.innerHTML = \`<a href="\${movie.downloadLink}" target="_blank" class="dl-btn">📥 Download</a>\`;
        }

        if (!movie.episodes || movie.episodes.length <= 1) {
             document.getElementById('ep_section').style.display = 'none';
             const link = (movie.episodes && movie.episodes[0]) ? movie.episodes[0].link : movie.link; 
             setupPlayButton(link, movie.isPremium);
        } else {
             document.getElementById('ep_section').style.display = 'block';
             renderAccordion(movie.episodes, movie.isPremium);
             const firstLink = movie.episodes[0].link;
             setupPlayButton(firstLink, movie.isPremium);
        }
      }

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
          if(favs.includes(currentMovieId)) favs = favs.filter(id => id !== currentMovieId);
          else favs.push(currentMovieId);
          localStorage.setItem('my_favs', JSON.stringify(favs));
          updateFavBtnState();
      }

      let activeVideoLink = "";
      let activeIsPremium = false;

      function setupPlayButton(link, isPrem) {
          activeVideoLink = link;
          activeIsPremium = isPrem;
      }

      window.startPlayback = function() {
          if(activeIsPremium) {
              if(!currentUser || currentUser.vipExpiry < Date.now()) {
                  document.getElementById('vip-lock').style.display = 'flex';
                  document.getElementById('video').style.display = 'none';
                  return;
              }
          }
          
          document.getElementById('coverOverlay').style.display = 'none';
          const vid = document.getElementById('video');
          
          playViaSecureToken(activeVideoLink).then(() => {
              const t = localStorage.getItem('watch_'+currentMovieId);
              if(t) vid.currentTime = parseFloat(t);
          });
      }

      function renderAccordion(episodes, isPremium) {
        const container = document.getElementById('ep_section');
        container.innerHTML = "";
        const seasons = {};
        
        episodes.forEach(ep => {
            let g = "Videos";
            const match = ep.label.match(/^(Season \\d+|S\\d+)/i);
            if(match) {
                let s = match[0];
                if(s.toUpperCase().startsWith('S') && !s.toUpperCase().startsWith('SEASON')) s = s.replace(/^S/i, 'Season ');
                g = s;
            }
            if(ep.label === 'Movie') g = "Movie";
            if(!seasons[g]) seasons[g] = [];
            seasons[g].push(ep);
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
                const label = ep.label.replace(key, '').trim() || ep.label;
                return \`<button class="ep-btn" onclick="switchEpisode(this, '\${ep.link}', \${isPremium})">\${label}</button>\`;
            }).join('');
            
            panel.appendChild(grid);
            container.appendChild(btn);
            container.appendChild(panel);
            btn.onclick = () => {
                btn.classList.toggle("active");
                if (panel.style.maxHeight) panel.style.maxHeight = null;
                else panel.style.maxHeight = "400px";
            };
        });
      }

      window.switchEpisode = function(btn, link, isPremium) {
          document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          setupPlayButton(link, isPremium);
          
          if(document.getElementById('video').style.display !== 'none') {
              startPlayback(); 
          } else {
              startPlayback();
          }
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
            // Native First (Mobile)
            if (vid.canPlayType('application/vnd.apple.mpegurl')) {
                vid.src = realUrl;
                vid.addEventListener('loadedmetadata', () => vid.play().catch(e=>console.log(e)));
                vid.onerror = () => tryHlsJs(vid, realUrl, showFallback);
            } 
            // HLS.js (Desktop)
            else {
                tryHlsJs(vid, realUrl, showFallback);
            }
            return;
        }

        try {
            const res = await fetch('/api/sign_url', { 
                method: 'POST', 
                body: JSON.stringify({ 
                    url: realUrl, 
                    movieId: currentMovieId, 
                    username: currentUser ? currentUser.username : null 
                }) 
            });
            
            if(res.status === 403) {
               document.getElementById('vip-lock').style.display = 'flex';
               vid.style.display = 'none';
               return;
            }
            
            const json = await res.json();
            if(json.token) { 
                vid.src = "/api/play?t=" + json.token; 
                vid.play(); 
            } else showFallback();
        } catch(e) { showFallback(); }
      }

      function tryHlsJs(vid, url, fallbackCb) {
          if (Hls.isSupported()) {
                const hls = new Hls({ debug: false });
                hls.loadSource(url);
                hls.attachMedia(vid);
                hls.on(Hls.Events.MANIFEST_PARSED, () => vid.play().catch(()=>{}));
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data.fatal) { hls.destroy(); fallbackCb(); }
                });
          } else { fallbackCb(); }
      }

      function closePlayerInternal() {
        const vid = document.getElementById('video'); vid.pause(); vid.src="";
        document.getElementById('playerModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        if (document.fullscreenElement) document.exitFullscreen();
      }
      function closePlayer() {
        closePlayerInternal();
        const u = new URLSearchParams(window.location.search);
        let url = window.location.pathname;
        if(u.get('view')) url += '?view='+u.get('view');
        window.history.pushState({path:url},'',url);
      }
      function toggleFullScreen() {
        const w = document.getElementById('videoWrapper');
        if (!document.fullscreenElement) {
            if(w.requestFullscreen) w.requestFullscreen();
            if(screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(e=>{});
        } else { if(document.exitFullscreen) document.exitFullscreen(); }
      }
      function setupPlayerIdle() {
          const w = document.getElementById('videoWrapper');
          const o = document.getElementById('playerOverlay');
          let t;
          const reset = () => { o.classList.remove('hidden'); clearTimeout(t); t = setTimeout(()=>o.classList.add('hidden'),3000); };
          w.onmousemove = reset; w.ontouchstart = reset; w.onclick = reset;
      }
      function changePage(d) { fetchMovies(currentPage + d, currentCategory); }
    </script>
  </body>
  </html>
  `;
}
