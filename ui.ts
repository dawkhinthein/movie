export function renderWebsite() {
  
  // Server-Side Skeleton Helper (Deno)
  function getServerSkeleton() {
    return Array(6).fill('<div class="card skeleton" style="min-width:110px; height:160px;"></div>').join('');
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Stream App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <style>
      /* --- GLOBAL STYLES --- */
      body { background: #121212; color: #e0e0e0; font-family: 'Segoe UI', sans-serif; margin:0; padding-bottom: 60px; user-select: none; -webkit-tap-highlight-color: transparent; }
      
      /* --- HEADER --- */
      header { background: rgba(20, 20, 20, 0.98); backdrop-filter: blur(10px); padding: 12px 15px; position: sticky; top:0; z-index:50; border-bottom: 1px solid #333; display:flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
      .brand { color: #e50914; font-weight: 800; font-size: 22px; text-decoration: none; cursor:pointer; letter-spacing: 1px; }
      
      .search-box { display: flex; align-items: center; background: #222; border: 1px solid #444; border-radius: 25px; padding: 5px 12px; width: 50%; max-width: 200px; transition: 0.3s; }
      .search-box:focus-within { border-color: #e50914; background: #2a2a2a; width: 60%; }
      .search-input { background: transparent; border: none; color: white; outline: none; width: 100%; font-size: 14px; }
      .icon-btn { background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 5px; }

      /* --- USER SIDEBAR --- */
      .user-panel { position: fixed; top: 0; right: 0; width: 280px; height: 100%; background: #1a1a1a; z-index: 100; transform: translateX(100%); transition: transform 0.3s ease-in-out; padding: 20px; box-shadow: -5px 0 20px rgba(0,0,0,0.7); display: flex; flex-direction: column; }
      .user-panel.open { transform: translateX(0); }
      .panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px; }
      .auth-input { width: 100%; padding: 12px; margin: 8px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 6px; box-sizing: border-box; outline: none; }
      .auth-input:focus { border-color: #e50914; }
      .auth-btn { width: 100%; padding: 12px; background: #e50914; color: white; border: none; font-weight: bold; cursor: pointer; border-radius: 6px; margin-top: 10px; transition: 0.2s; }
      .auth-btn:hover { background: #ff0f1f; }
      .auth-btn.secondary { background: #333; margin-top: 5px; }

      /* --- HOME LAYOUT --- */
      .home-section { padding: 20px 0 5px 15px; }
      .section-head { display: flex; justify-content: space-between; align-items: center; padding-right: 15px; margin-bottom: 12px; }
      .section-title { color: #fff; font-size: 17px; font-weight: 700; border-left: 4px solid #e50914; padding-left: 10px; }
      .see-more { color: #aaa; font-size: 12px; cursor: pointer; font-weight: 600; text-decoration: none; }
      
      .scroll-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 15px; scroll-behavior: smooth; }
      .scroll-row::-webkit-scrollbar { height: 0px; } /* Hide scrollbar for cleaner look */
      .scroll-row .card { min-width: 115px; max-width: 115px; }

      /* --- GRID SYSTEM --- */
      .container { max-width: 1200px; margin: 0 auto; padding: 15px; display: none; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      @media (min-width: 600px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 15px; } }
      @media (min-width: 900px) { .grid { grid-template-columns: repeat(5, 1fr); gap: 20px; } }

      /* --- CARD DESIGN --- */
      .card { background: #1f1f1f; border-radius: 8px; overflow: hidden; cursor: pointer; position: relative; transition: transform 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }
      .card:active { transform: scale(0.96); }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; display: block; }
      .title { padding: 8px 5px; font-size: 11px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ddd; }
      .prem-tag { position: absolute; top: 0; left: 0; background: #ffd700; color: #000; font-size: 9px; font-weight: bold; padding: 2px 6px; border-bottom-right-radius: 6px; z-index: 2; }
      
      /* --- NAVIGATION BAR (Back Button) --- */
      .back-nav { display: none; padding: 10px 15px; align-items: center; gap: 10px; background: #181818; position: sticky; top: 59px; z-index: 40; }
      .back-btn { background: #333; color: white; border: none; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: bold; display: flex; align-items: center; gap: 5px; }
      .grid-title { font-size: 14px; font-weight: bold; color: #ccc; }

      /* --- PLAYER MODAL --- */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:black; z-index:200; overflow-y: auto; }
      .modal-content { width: 100%; max-width: 1000px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #111; }
      .video-area { position: sticky; top: 0; z-index: 10; background:black; width: 100%; aspect-ratio: 16/9; position: relative; }
      video { width: 100%; height: 100%; background: black; }
      
      /* Player Controls Overlay */
      .player-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 15px; box-sizing: border-box; transition: opacity 0.3s; pointer-events: none; background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent 30%, transparent 70%, rgba(0,0,0,0.6)); }
      .ctrl-btn { pointer-events: auto; background: rgba(30,30,30,0.6); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold; backdrop-filter: blur(4px); }
      .top-controls { display: flex; justify-content: flex-end; }
      .bottom-controls { display: flex; justify-content: flex-end; gap: 10px; }
      .cover-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; }
      .play-btn-circle { width: 60px; height: 60px; background: rgba(229, 9, 20, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
      .play-btn-circle::after { content: '▶'; color: white; font-size: 24px; margin-left: 4px; }

      /* VIP Lock Screen */
      #vip-lock { display: none; position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.95); flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; z-index: 25; }
      #vip-lock h2 { color: #ffd700; margin-bottom: 10px; }
      #vip-lock p { color: #ccc; font-size: 13px; margin-bottom: 15px; }

      /* Info Section */
      .info-sec { padding: 20px; }
      h2#m_title { margin: 0; color: #fff; font-size: 20px; text-shadow: 0 2px 2px black; }
      .action-row { display: flex; gap: 10px; margin: 15px 0; align-items: center; }
      .fav-btn { background: #222; border: 1px solid #444; color: #ccc; padding: 8px 15px; border-radius: 20px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 5px; transition: 0.2s; }
      .fav-btn.active { color: #e50914; border-color: #e50914; background: rgba(229,9,20,0.1); }
      .dl-btn { background: #4db8ff; color: #000; padding: 8px 15px; border-radius: 20px; text-decoration: none; font-size: 12px; font-weight: bold; }
      p.desc { color: #bbb; font-size: 14px; line-height: 1.6; margin-top: 15px; }

      /* Accordion & Episodes */
      .accordion { background-color: #222; color: #eee; cursor: pointer; padding: 14px; width: 100%; border: none; text-align: left; outline: none; font-size: 15px; font-weight: bold; border-bottom: 1px solid #333; display: flex; justify-content: space-between; margin-top: 5px; border-radius: 6px; }
      .accordion.active { background-color: #333; color: #e50914; }
      .panel { padding: 0 5px; background-color: #151515; max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
      .episode-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 8px; padding: 15px 5px; max-height: 350px; overflow-y: auto; }
      .ep-btn { background: #2a2a2a; border: 1px solid #444; color: #ddd; padding: 10px 5px; cursor: pointer; border-radius: 4px; font-size: 12px; text-align: center; }
      .ep-btn.active { background: #e50914; color: white; border-color: #e50914; }

      /* Skeleton & Pagination */
      @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
      .skeleton { animation: shimmer 2s infinite linear; background: linear-gradient(to right, #222 4%, #333 25%, #222 36%); background-size: 1000px 100%; border-radius: 6px; }
      .pagination { display: flex; justify-content: center; gap: 15px; margin-top: 30px; padding-bottom: 20px;}
      .page-btn { padding: 8px 16px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer; }
    </style>
  </head>
  <body>

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
        <span id="gridTitle" class="grid-title"></span>
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
                <h2 style="font-size:30px;">👑</h2>
                <h3 style="color:#ffd700; margin:0;">Premium Content</h3>
                <p>This content requires a VIP subscription.</p>
                <button class="auth-btn" style="width:auto; padding:8px 20px;" onclick="closePlayer(); toggleUserPanel();">Login / Redeem</button>
            </div>

            <div class="player-overlay" id="playerOverlay">
                <div class="top-controls">
                    <button class="ctrl-btn" onclick="closePlayer()">❌ Close</button>
                </div>
                <div class="bottom-controls">
                    <button class="ctrl-btn" onclick="toggleFullScreen()">⛶ Full</button>
                </div>
            </div>
        </div>
        
        <div class="info-sec">
          <h2 id="m_title">Loading...</h2>
          <div style="margin:5px 0" id="m_tags"></div>
          
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
      let controlsTimeout;

      // --- HELPER: Skeleton ---
      function getClientSkeleton(count) {
        return Array(count).fill('<div class="card skeleton" style="min-width:110px; height:160px;"></div>').join('');
      }

      // --- INIT & BACK BUTTON ---
      window.addEventListener('popstate', function(event) {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const view = urlParams.get('view');

        if (!movieId) closePlayerInternal(); // Close player if back pressed
        if (view === 'grid') showGridInternal();
        else goHomeInternal();
      });

      window.onload = async () => {
        updateProfileUI();
        loadHomeData();
        setupPlayerIdle();
        
        // Check URL for direct link
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const view = urlParams.get('view');

        if (movieId) fetchSingleMovie(movieId);
        else if (view === 'grid') {
             const cat = urlParams.get('cat') || 'all';
             openCategory(cat, false);
        }

        // Continue Watching Listener
        const vid = document.getElementById('video');
        vid.addEventListener('timeupdate', () => {
            if(vid.currentTime > 5 && currentMovieId) {
                localStorage.setItem('watch_' + currentMovieId, vid.currentTime);
            }
        });
      };

      // --- AUTHENTICATION ---
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
          const res = await fetch('/api/auth/register', { method:'POST', body:JSON.stringify({username:u, password:p}) });
          if(res.ok) alert("Registered! Please Login.");
          else alert("Username taken or error");
      }

      async function doLogin() {
          const u = document.getElementById('reg_user').value;
          const p = document.getElementById('reg_pass').value;
          const res = await fetch('/api/auth/login', { method:'POST', body:JSON.stringify({username:u, password:p}) });
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
          const res = await fetch('/api/auth/redeem', { method:'POST', body:JSON.stringify({username:currentUser.username, code}) });
          if(res.ok) {
              currentUser = await res.json();
              localStorage.setItem('user_session', JSON.stringify(currentUser));
              alert("VIP Activated!");
              updateProfileUI();
          } else alert("Invalid Code");
      }

      // --- DATA LOADING ---
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
            if(json.data.length === 0) container.innerHTML = '<p style="padding:10px; color:#555;">No content</p>';
            else container.innerHTML = json.data.slice(0,10).map(m => createCardHtml(m)).join('');
        } catch(e) {}
      }

      function createCardHtml(m) {
        const tag = m.isPremium ? '<div class="prem-tag">👑 VIP</div>' : '';
        return \`<div class="card" onclick="openModalById('\${m.id}')">
            <img src="\${m.image}" loading="lazy" onerror="this.src='https://via.placeholder.com/150x225?text=Img'">
            \${tag}
            <div class="title">\${m.title}</div>
        </div>\`;
      }

      // --- NAVIGATION ---
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
        document.getElementById('gridTitle').innerText = decodeURIComponent(cat).toUpperCase();
        if(pushState) {
            const u = \`?view=grid&cat=\${encodeURIComponent(cat)}\`;
            window.history.pushState({path:u},'',u);
        }
        fetchMovies(1, cat);
      }

      async function openFavorites() {
        showGridInternal();
        document.getElementById('gridTitle').innerText = "MY FAVORITES";
        document.getElementById('mainGrid').innerHTML = getClientSkeleton(6);
        document.getElementById('pagControls').style.display = 'none';
        
        window.history.pushState({},'','?view=grid&cat=fav');
        
        const favs = JSON.parse(localStorage.getItem('my_favs') || '[]');
        if(favs.length === 0) {
            document.getElementById('mainGrid').innerHTML = '<p style="grid-column:1/-1; text-align:center;">No favorites yet.</p>';
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
      }

      async function executeSearch() {
        const q = document.getElementById('searchInput').value;
        if(!q) return goHome();
        showGridInternal();
        document.getElementById('gridTitle').innerText = "SEARCH: " + q;
        window.history.pushState({},'','?view=grid&q='+encodeURIComponent(q));
        
        document.getElementById('mainGrid').innerHTML = getClientSkeleton(10);
        document.getElementById('pagControls').style.display = 'none';
        
        const res = await fetch(\`/api/search?q=\${encodeURIComponent(q)}\`);
        const results = await res.json();
        allMoviesData = results;
        renderGrid(results);
      }
      function handleSearchKey(e) { if(e.key==='Enter') executeSearch(); }

      async function fetchMovies(page, cat) {
        document.getElementById('mainGrid').innerHTML = getClientSkeleton(10);
        const encodedCat = (cat==='all'||cat==='movies'||cat==='series') ? cat : encodeURIComponent(cat);
        const res = await fetch(\`/api/movies?page=\${page}&cat=\${encodedCat}\`);
        const json = await res.json();
        allMoviesData = json.data;
        renderGrid(json.data);
        
        // Update Pagination
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

      // --- PLAYER LOGIC ---
      async function fetchSingleMovie(id) {
        document.getElementById('playerModal').style.display = 'block';
        resetPlayerUI();
        const res = await fetch(\`/api/get_movie?id=\${id}\`);
        const movie = await res.json();
        if(movie && movie.title) setupModal(movie);
      }

      function openModalById(id) {
        const m = allMoviesData.find(x => x.id === id);
        if(m) { setupModal(m); } else { fetchSingleMovie(id); }
        
        // Update URL
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
        document.getElementById('coverOverlay').style.display = 'flex'; // Show cover again
        document.getElementById('video').style.display = 'none'; // Hide video initially
        document.getElementById('video').pause();
        
        // Tags
        if(movie.tags) {
            document.getElementById('m_tags').innerHTML = movie.tags.map(t=>\`<span class="tag-pill">\${t}</span>\`).join('');
        }

        // Favorites Button Check
        updateFavBtnState();

        // Download Button
        const dlDiv = document.getElementById('dl_area');
        dlDiv.innerHTML = "";
        if(movie.downloadLink) {
            dlDiv.innerHTML = \`<a href="\${movie.downloadLink}" target="_blank" class="dl-btn">📥 Download</a>\`;
        }

        // Episodes Logic
        if (!movie.episodes || movie.episodes.length <= 1) {
             document.getElementById('ep_section').style.display = 'none';
             // For single movie, use array[0] or fallback to legacy .link
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

      // Called when Big Play Button is clicked
      window.startPlayback = function() {
          // Check VIP
          if(activeIsPremium) {
              if(!currentUser || currentUser.vipExpiry < Date.now()) {
                  document.getElementById('vip-lock').style.display = 'flex';
                  return;
              }
          }
          
          document.getElementById('coverOverlay').style.display = 'none';
          const vid = document.getElementById('video');
          vid.style.display = 'block';
          
          playViaSecureToken(activeVideoLink).then(() => {
              // Continue Watching Logic
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
              startPlayback(); // Reload video if already playing
          } else {
              startPlayback();
          }
      }

      async function playViaSecureToken(realUrl) {
        const vid = document.getElementById('video');
        vid.style.display = 'block';
        
        // 1. Direct M3U8 Logic (Native First)
        if (realUrl.includes('.m3u8')) {
            vid.src = "";
            if (vid.canPlayType('application/vnd.apple.mpegurl')) {
                vid.src = realUrl;
                vid.addEventListener('loadedmetadata', () => vid.play().catch(e=>console.log(e)));
            } else if(Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(realUrl);
                hls.attachMedia(vid);
                hls.on(Hls.Events.MANIFEST_PARSED, () => vid.play());
            } else {
                // Fallback for desktop native
                vid.src = realUrl;
            }
            return;
        }

        // 2. MP4/Other (Signed URL)
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
            }
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
        const u = new URLSearchParams(window.location.search);
        let url = window.location.pathname;
        if(u.get('view')) url += '?view='+u.get('view');
        window.history.pushState({path:url},'',url);
      }
      function setupPlayerIdle() {
          const w = document.getElementById('videoWrapper');
          const o = document.getElementById('playerOverlay');
          let t;
          const reset = () => { o.classList.remove('hidden'); clearTimeout(t); t = setTimeout(()=>o.classList.add('hidden'),3000); };
          w.onmousemove = reset; w.ontouchstart = reset; w.onclick = reset;
      }
      function toggleFullScreen() {
        const w = document.getElementById('videoWrapper');
        if (!document.fullscreenElement) {
            if(w.requestFullscreen) w.requestFullscreen();
            if(screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(e=>{});
        } else { if(document.exitFullscreen) document.exitFullscreen(); }
      }
      function changePage(d) { fetchMovies(currentPage + d, currentCategory); }
    </script>
  </body>
  </html>
  `;
}
