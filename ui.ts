export function renderWebsite() {
  function getServerSkeleton() { return Array(6).fill('<div class="card skeleton"></div>').join(''); }

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <title>Stream Pro</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
    <meta name="theme-color" content="#0f0f0f">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Padauk:wght@400;700&display=swap" rel="stylesheet">
    <style>
      :root {
        --primary: #e50914;
        --bg: #0f0f0f;
        --card-bg: #1a1a1a;
        --text: #f5f5f5;
        --glass: rgba(30, 30, 30, 0.6);
        --nav-height: 60px;
      }

      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; outline: none; }
      body { 
        background: var(--bg); color: var(--text); 
        font-family: 'Inter', 'Padauk', sans-serif; 
        margin: 0; padding-bottom: calc(var(--nav-height) + 20px); 
        user-select: none; -webkit-user-select: none;
        overflow-x: hidden;
      }

      /* --- HERO SECTION --- */
      .hero {
          position: relative; width: 100%; height: 50vh; max-height: 450px;
          background: linear-gradient(to bottom, transparent 50%, var(--bg)), url('https://image.tmdb.org/t/p/original/mXLOHHc1Zeuwsl4xYKjKh2280oL.jpg') center/cover;
          display: flex; flex-direction: column; justify-content: flex-end; padding: 20px;
      }
      .hero-content { z-index: 2; margin-bottom: 10px; }
      .hero-tag { background: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; display: inline-block; margin-bottom: 5px; }
      .hero-title { font-size: 28px; font-weight: 800; margin: 5px 0; text-shadow: 0 2px 10px rgba(0,0,0,0.5); line-height: 1.2; }
      .hero-desc { font-size: 13px; color: #ccc; max-width: 600px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 10px; }
      .hero-btn { 
          background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); 
          border: 1px solid rgba(255,255,255,0.3); color: white; 
          padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: 13px;
          display: inline-flex; align-items: center; gap: 5px; cursor: pointer;
      }

      /* --- HEADER (Floating) --- */
      header { 
          position: fixed; top: 0; left: 0; width: 100%; z-index: 50; 
          padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;
          background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
          transition: background 0.3s;
      }
      header.scrolled { background: rgba(15, 15, 15, 0.95); backdrop-filter: blur(10px); box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
      .brand { color: var(--primary); font-weight: 900; font-size: 24px; letter-spacing: -1px; text-shadow: 0 0 20px rgba(229, 9, 20, 0.4); cursor: pointer; }
      .user-icon { width: 35px; height: 35px; border-radius: 50%; background: #333; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid #444; cursor: pointer; }

      /* --- SECTIONS --- */
      .section { padding: 20px 0 10px 20px; }
      .sec-head { display: flex; justify-content: space-between; align-items: center; padding-right: 20px; margin-bottom: 15px; }
      .sec-title { font-size: 18px; font-weight: 700; color: #fff; position: relative; padding-left: 12px; }
      .sec-title::before { content:''; position: absolute; left: 0; top: 3px; height: 16px; width: 4px; background: var(--primary); border-radius: 2px; }
      .see-more { font-size: 12px; color: var(--primary); font-weight: 600; cursor: pointer; }

      /* --- SCROLL ROW --- */
      .scroll-row { 
          display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px; scroll-behavior: smooth; 
          padding-right: 20px; /* End padding */
      }
      .scroll-row::-webkit-scrollbar { display: none; }

      /* --- CARDS --- */
      .card { 
          min-width: 130px; max-width: 130px; background: var(--card-bg); 
          border-radius: 12px; overflow: hidden; position: relative; 
          box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: transform 0.2s; cursor: pointer;
      }
      .card:active { transform: scale(0.95); }
      .card img { width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; }
      .card-info { padding: 8px; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); position: absolute; bottom: 0; width: 100%; }
      .title { font-size: 11px; color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; }
      
      .badge-prem { position: absolute; top: 6px; left: 6px; background: #ffd700; color: #000; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; z-index: 2; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }
      .badge-year { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 600; border: 1px solid rgba(255,255,255,0.1); }

      /* --- GRID --- */
      .container { padding: 80px 15px 20px 15px; max-width: 1200px; margin: 0 auto; display: none; animation: fadeIn 0.3s; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      @media (min-width: 600px) { .grid { grid-template-columns: repeat(4, 1fr); } .card { min-width: 160px; max-width: 160px; } }
      @media (min-width: 900px) { .grid { grid-template-columns: repeat(5, 1fr); } }

      /* --- BOTTOM NAV --- */
      .btm-nav { 
          position: fixed; bottom: 0; left: 0; width: 100%; height: var(--nav-height); 
          background: rgba(15, 15, 15, 0.95); backdrop-filter: blur(10px); 
          border-top: 1px solid #222; display: flex; justify-content: space-around; align-items: center; 
          z-index: 40; padding-bottom: env(safe-area-inset-bottom);
      }
      .nav-item { display: flex; flex-direction: column; align-items: center; color: #777; font-size: 10px; gap: 4px; cursor: pointer; transition: 0.2s; }
      .nav-item.active { color: var(--primary); }
      .nav-icon { font-size: 20px; }

      /* --- SEARCH MODAL --- */
      #searchModal {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg);
          z-index: 100; padding: 20px; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          display: flex; flex-direction: column;
      }
      #searchModal.open { transform: translateY(0); }
      .search-bar-lg { 
          display: flex; background: #222; border-radius: 12px; padding: 12px; 
          margin-bottom: 20px; border: 1px solid #333; 
      }
      .search-input-lg { background: transparent; border: none; color: white; font-size: 16px; width: 100%; margin-left: 10px; }
      .close-search { font-size: 14px; color: var(--primary); font-weight: bold; align-self: flex-end; margin-bottom: 10px; cursor: pointer; }

      /* --- PLAYER --- */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:black; z-index:200; overflow-y: auto; }
      .modal-content { min-height: 100vh; background: #111; }
      .video-area { position: sticky; top: 0; z-index: 10; background:black; width: 100%; aspect-ratio: 16/9; }
      video { width: 100%; height: 100%; background: black; }
      
      .player-overlay { 
          position: absolute; top: 0; left: 0; width: 100%; height: 60px; 
          background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
          display: none; justify-content: flex-end; align-items: center; padding: 15px; 
          pointer-events: none; transition: opacity 0.3s;
      }
      .ctrl-btn { pointer-events: auto; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 12px; border-radius: 8px; margin-left: 10px; backdrop-filter: blur(5px); }
      
      .info-sec { padding: 20px; background: linear-gradient(to bottom, #111, var(--bg)); min-height: 300px; }
      .info-title { font-size: 20px; font-weight: 700; margin: 0 0 10px 0; line-height: 1.3; }
      .info-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px; }
      .tag-pill { background: #222; color: #aaa; font-size: 11px; padding: 4px 10px; border-radius: 12px; border: 1px solid #333; }
      
      .action-row { display: flex; gap: 10px; margin-bottom: 20px; }
      .act-btn { 
          flex: 1; padding: 12px; border-radius: 10px; font-weight: 600; font-size: 13px; 
          display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; border: none;
      }
      .btn-fav { background: #222; color: #fff; border: 1px solid #333; }
      .btn-fav.active { color: var(--primary); border-color: var(--primary); background: rgba(229, 9, 20, 0.1); }
      .btn-dl { background: #333; color: white; text-decoration: none; }

      /* Episode List */
      .ep-list { margin-top: 10px; }
      .accordion { background: #1f1f1f; color: #eee; padding: 15px; width: 100%; border: none; text-align: left; font-weight: 600; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; }
      .accordion.active { background: #2a2a2a; color: var(--primary); }
      .ep-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 10px 5px; max-height: 0; overflow: hidden; transition: max-height 0.3s; }
      .ep-btn { background: #222; border: 1px solid #333; color: #ccc; padding: 10px 0; border-radius: 6px; font-size: 12px; cursor: pointer; }
      .ep-btn.active { background: var(--primary); color: white; border-color: var(--primary); }

      /* User Panel (Right Sheet) */
      .user-panel { 
          position: fixed; top: 0; right: 0; width: 85%; max-width: 320px; height: 100%; 
          background: #151515; z-index: 150; transform: translateX(100%); 
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          padding: 25px; box-shadow: -10px 0 30px rgba(0,0,0,0.8);
      }
      .user-panel.open { transform: translateX(0); }
      .panel-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:140; display:none; backdrop-filter: blur(2px); }
      
      /* Auth Form */
      .auth-group { margin-bottom: 15px; }
      .auth-label { font-size: 12px; color: #888; margin-bottom: 5px; display: block; }
      .auth-inp { width: 100%; background: #222; border: 1px solid #333; color: white; padding: 12px; border-radius: 8px; font-size: 14px; }
      .auth-inp:focus { border-color: var(--primary); }
      .auth-submit { width: 100%; background: var(--primary); color: white; padding: 14px; border-radius: 10px; border: none; font-weight: bold; margin-top: 10px; font-size: 15px; cursor: pointer; }

      /* Utils */
      .hidden { display: none !important; }
      .skeleton { background: linear-gradient(90deg, #1f1f1f 25%, #2a2a2a 50%, #1f1f1f 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
      @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      
      /* VIP Lock */
      #vip-lock { display: none; position: absolute; top:0; left:0; width:100%; height:100%; background: #000; flex-direction: column; align-items: center; justify-content: center; z-index: 25; }
      .vip-icon { font-size: 40px; margin-bottom: 10px; animation: bounce 2s infinite; }
      @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    </style>
  </head>
  <body>
    
    <div id="global-loader"><div class="spinner"></div></div>
    
    <header id="mainHeader">
        <div class="brand" onclick="goHome()">STREAM<span style="color:white">PRO</span></div>
        <div class="user-icon" onclick="toggleUserPanel()">👤</div>
    </header>

    <div id="searchModal">
        <div class="close-search" onclick="closeSearch()">CLOSE ✕</div>
        <div class="search-bar-lg">
            <span style="font-size:20px">🔍</span>
            <input type="text" id="searchInput" class="search-input-lg" placeholder="Search movies..." onkeypress="handleSearchKey(event)">
        </div>
        <div id="searchResults" class="grid" style="overflow-y:auto; padding-bottom:50px;"></div>
    </div>

    <div id="homeView">
        <div class="hero">
            <div class="hero-content">
                <div class="hero-tag">🔥 Trending Now</div>
                <h1 class="hero-title">Unlimited Movies & Series</h1>
                <p class="hero-desc">Stream your favorite content in high quality. No ads, just entertainment.</p>
                <div class="hero-btn" onclick="openCategory('movies')">▶ Watch Now</div>
            </div>
        </div>

        <div class="section">
            <div class="sec-head"><span class="sec-title">Latest Movies</span><span class="see-more" onclick="openCategory('movies')">View All</span></div>
            <div class="scroll-row" id="row_movies">${getServerSkeleton()}</div>
        </div>

        <div class="section">
            <div class="sec-head"><span class="sec-title">TV Series</span><span class="see-more" onclick="openCategory('series')">View All</span></div>
            <div class="scroll-row" id="row_series">${getServerSkeleton()}</div>
        </div>
        
        <div class="section">
            <div class="sec-head"><span class="sec-title">Adult Collection</span><span class="see-more" onclick="openCategory('Adult')">View All</span></div>
            <div class="scroll-row" id="row_18">${getServerSkeleton()}</div>
        </div>
    </div>

    <div class="container" id="gridViewContainer">
        <div style="display:flex; align-items:center; margin-bottom:15px;">
            <button onclick="goHome()" style="background:none; border:none; color:white; font-size:20px; padding:0; margin-right:15px;">⬅</button>
            <h2 id="gridTitle" style="margin:0; font-size:20px;">Category</h2>
        </div>
        <div class="grid" id="mainGrid"></div>
        <div id="scroll-sentinel" style="height:60px; display:flex; justify-content:center; align-items:center;"><div class="spinner" id="btm-spin" style="width:25px; height:25px; display:none;"></div></div>
    </div>

    <div class="btm-nav">
        <div class="nav-item active" onclick="goHome()"><div class="nav-icon">🏠</div>Home</div>
        <div class="nav-item" onclick="openSearch()"><div class="nav-icon">🔍</div>Search</div>
        <div class="nav-item" onclick="openFavorites()"><div class="nav-icon">❤️</div>Saved</div>
        <div class="nav-item" onclick="toggleUserPanel()"><div class="nav-icon">👤</div>Account</div>
    </div>

    <div class="panel-overlay" id="panelOverlay" onclick="toggleUserPanel()"></div>
    <div class="user-panel" id="userPanel">
        <h2 style="margin-top:0; border-bottom:1px solid #333; padding-bottom:15px;">My Account</h2>
        
        <div id="loginForm">
            <div class="auth-group"><label class="auth-label">Username</label><input type="text" id="reg_user" class="auth-inp"></div>
            <div class="auth-group"><label class="auth-label">Password</label><input type="password" id="reg_pass" class="auth-inp"></div>
            <button class="auth-submit" onclick="doLogin()">Login to Account</button>
            <button class="auth-submit" style="background:#333; margin-top:10px;" onclick="doRegister()">Create Account</button>
        </div>

        <div id="profileView" class="hidden">
            <div style="background:#222; padding:15px; border-radius:10px; margin-bottom:20px;">
                <div style="font-size:12px; color:#888;">Logged in as</div>
                <div id="u_name" style="font-size:18px; font-weight:bold; color:#fff; margin-top:5px;">User</div>
                <div id="u_status" style="margin-top:10px; font-size:13px; color:var(--primary);">Free Plan</div>
            </div>
            
            <div class="auth-group">
                <label class="auth-label">Redeem VIP Code</label>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="vip_code" class="auth-inp" placeholder="XXXX-XXXX">
                    <button class="auth-submit" style="width:auto; margin:0;" onclick="doRedeem()">Go</button>
                </div>
            </div>
            
            <button class="auth-submit" style="background:#333; margin-top:auto;" onclick="doLogout()">Log Out</button>
        </div>
        
        <div style="margin-top:20px; text-align:center;">
             <a href="https://t.me/iqowoq" target="_blank" style="color:#555; text-decoration:none; font-size:12px;">Contact Support</a>
        </div>
    </div>

    <div id="playerModal">
      <div class="modal-content">
        <div class="video-area" id="videoWrapper">
            <div class="player-overlay" id="playerOverlay">
                <button class="ctrl-btn" onclick="toggleFullScreen()">⛶</button>
                <button class="ctrl-btn" onclick="closePlayer()">✕</button>
            </div>
            <video id="video" controls playsinline controlsList="nodownload"></video>
            <div id="vip-lock"><div class="vip-icon">👑</div><h2>Premium Content</h2><p>Upgrade to VIP to watch.</p><button class="lock-btn" onclick="closePlayer(); toggleUserPanel();">Unlock Now</button></div>
        </div>
        
        <div class="info-sec">
            <h1 class="info-title" id="m_title">Loading...</h1>
            <div class="info-tags" id="m_tags"></div>
            <div class="action-row">
                <button id="favBtn" class="act-btn btn-fav" onclick="toggleFavorite()">🤍 Favorite</button>
                <div id="dl_area" style="flex:1"></div>
            </div>
            <p id="m_desc" style="font-size:14px; color:#ccc; line-height:1.6; margin:0;"></p>
            <div id="ep_section" class="ep-list"></div>
        </div>
      </div>
    </div>

    <script>
      // State
      let currentPage = 1, currentCategory = 'movies', allMoviesData = [];
      let currentUser = JSON.parse(localStorage.getItem('user_session') || 'null');
      let currentMovieId = "", activeVideoLink = "";
      let controlsTimeout, isLoading = false, hasMore = true;

      // Init
      window.onload = async () => {
          // Scroll Effect
          window.addEventListener('scroll', () => {
              document.getElementById('mainHeader').classList.toggle('scrolled', window.scrollY > 50);
          });
          
          updateProfileUI();
          await Promise.all([ fetchRow('movies','row_movies'), fetchRow('series','row_series'), fetchRow('Adult','row_18') ]);
          document.getElementById('global-loader').style.display='none';
          setupInfiniteScroll(); setupPlayerIdle();

          // Handle URL
          const urlParams = new URLSearchParams(window.location.search);
          const mid = urlParams.get('id');
          const view = urlParams.get('view');
          const cat = urlParams.get('cat');

          if(mid) fetchSingleMovie(mid);
          else if(view === 'grid') openCategory(cat || 'movies', false);
      };

      // Navigation
      window.addEventListener('popstate', (e) => {
          const p = new URLSearchParams(window.location.search);
          if(p.get('id')) openModalById(p.get('id'), false);
          else if(p.get('view')==='grid') { closePlayerInternal(); openCategory(p.get('cat')||'movies', false); }
          else { closePlayerInternal(); goHomeInternal(); }
      });

      function goHome() {
          document.getElementById('homeView').style.display='block';
          document.getElementById('gridViewContainer').style.display='none';
          document.getElementById('searchModal').classList.remove('open');
          window.scrollTo(0,0);
          window.history.pushState({},'','/');
          resetNav();
          document.querySelectorAll('.nav-item')[0].classList.add('active');
      }
      
      function goHomeInternal() {
          document.getElementById('homeView').style.display='block';
          document.getElementById('gridViewContainer').style.display='none';
      }

      function openCategory(cat, push=true) {
          if(cat.trim()==='18'||cat.includes('18 ')) cat='Adult';
          currentCategory = cat;
          document.getElementById('homeView').style.display='none';
          document.getElementById('gridViewContainer').style.display='block';
          document.getElementById('gridTitle').innerText = cat.toUpperCase();
          
          if(push) window.history.pushState({},'',\`?view=grid&cat=\${encodeURIComponent(cat)}\`);
          
          resetGrid();
          fetchMovies(1, cat, true);
          resetNav();
      }

      function openSearch() { document.getElementById('searchModal').classList.add('open'); document.getElementById('searchInput').focus(); }
      function closeSearch() { document.getElementById('searchModal').classList.remove('open'); }
      
      function resetNav() { document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active')); }

      // Data Fetching
      async function fetchRow(cat, elId) {
          try {
              const res = await fetch(\`/api/movies?page=1&cat=\${encodeURIComponent(cat)}\`);
              const json = await res.json();
              document.getElementById(elId).innerHTML = json.data.slice(0,10).map(m => createCard(m)).join('');
          } catch(e) {}
      }

      async function fetchMovies(page, cat, append=false) {
          if(isLoading) return; isLoading = true;
          document.getElementById('btm-spin').style.display='block';
          
          const res = await fetch(\`/api/movies?page=\${page}&cat=\${encodeURIComponent(cat)}\`);
          const json = await res.json();
          isLoading = false;
          document.getElementById('btm-spin').style.display='none';

          if(json.data.length === 0) { hasMore = false; return; }
          
          allMoviesData = append ? allMoviesData.concat(json.data) : json.data;
          const html = json.data.map(m => createCard(m)).join('');
          
          const grid = document.getElementById('mainGrid');
          if(append) grid.innerHTML += html; else grid.innerHTML = html;
          
          currentPage = page;
      }

      function createCard(m) {
          const tag = m.isPremium ? '<div class="badge-prem">VIP</div>' : '';
          const year = (m.tags && m.tags.find(t => /^\\d{4}$/.test(t))) || '';
          const yTag = year ? \`<div class="badge-year">\${year}</div>\` : '';
          return \`<div class="card" onclick="openModalById('\${m.id}')">
              <img src="\${m.image}" loading="lazy"><div class="card-info"><div class="title">\${m.title}</div></div>
              \${tag}\${yTag}
          </div>\`;
      }

      // Player & Modal
      function openModalById(id, push=true) {
          const m = allMoviesData.find(x => x.id === id);
          if(m) setupModal(m); else fetchSingleMovie(id);
          if(push) window.history.pushState({},'',\`?id=\${id}\`);
      }

      async function fetchSingleMovie(id) {
          const res = await fetch(\`/api/get_movie?id=\${id}\`);
          const m = await res.json();
          if(m && m.title) setupModal(m);
      }

      function setupModal(m) {
          currentMovieId = m.id;
          const modal = document.getElementById('playerModal');
          modal.style.display = 'block';
          document.body.style.overflow = 'hidden'; // Lock scroll
          
          // UI Reset
          document.getElementById('m_title').innerText = m.title;
          document.getElementById('m_desc').innerText = m.description || '';
          document.getElementById('m_tags').innerHTML = (m.tags||[]).map(t=>\`<span class="tag-pill">\${t}</span>\`).join('');
          document.getElementById('dl_area').innerHTML = m.downloadLink ? \`<a href="\${m.downloadLink}" target="_blank" class="act-btn btn-dl">📥 Download</a>\` : '';
          
          updateFavState();
          
          // Video Setup
          const v = document.getElementById('video');
          v.poster = m.cover || m.image;
          v.style.display = 'block';
          document.getElementById('vip-lock').style.display='none';
          
          if(!m.episodes || m.episodes.length <= 1) {
             document.getElementById('ep_section').innerHTML = '';
             const link = (m.episodes && m.episodes[0]) ? m.episodes[0].link : m.link;
             setupPlayer(link, m.isPremium);
          } else {
             renderEpisodes(m.episodes, m.isPremium);
             setupPlayer(m.episodes[0].link, m.isPremium);
          }
      }

      function setupPlayer(link, isPrem) {
          activeVideoLink = link;
          const v = document.getElementById('video');
          
          // Play Logic
          v.onclick = () => {
              if(isPrem && (!currentUser || currentUser.vipExpiry < Date.now())) {
                  document.getElementById('vip-lock').style.display = 'flex';
                  v.style.display = 'none';
                  return;
              }
              playVideo(link);
          };
      }

      async function playVideo(url) {
          const v = document.getElementById('video');
          // Add auth token logic here if needed from previous code
          // Simple HLS implementation:
          if(Hls.isSupported()) {
              const hls = new Hls();
              hls.loadSource(url);
              hls.attachMedia(v);
              hls.on(Hls.Events.MANIFEST_PARSED, () => v.play());
          } else if (v.canPlayType('application/vnd.apple.mpegurl')) {
              v.src = url;
              v.play();
          }
      }
      
      function renderEpisodes(eps, isPrem) {
          const sec = document.getElementById('ep_section');
          sec.innerHTML = '';
          const groups = {};
          
          eps.forEach(e => {
              let g = "Videos";
              const m = e.label.match(/^(Season \\d+|S\\d+)/i);
              if(m) g = m[0].replace(/^S/i, 'Season ');
              if(!groups[g]) groups[g] = [];
              groups[g].push(e);
          });
          
          Object.keys(groups).sort().forEach(k => {
              sec.innerHTML += \`<button class="accordion active">\${k}</button>
              <div class="ep-grid" style="max-height:1000px">\${groups[k].map(e=>
                  \`<div class="ep-btn" onclick="playVideo('\${e.link}')">\${e.label.replace(k,'').trim()||e.label}</div>\`
              ).join('')}</div>\`;
          });
      }

      function closePlayerInternal() {
          const v = document.getElementById('video');
          v.pause(); v.src = "";
          document.getElementById('playerModal').style.display = 'none';
          document.body.style.overflow = 'auto';
      }

      function closePlayer() {
          closePlayerInternal();
          const p = new URLSearchParams(window.location.search);
          p.delete('id');
          const u = window.location.pathname + (p.toString() ? '?'+p.toString() : '');
          window.history.pushState({},'',u);
      }

      // Infinite Scroll
      function setupInfiniteScroll() {
          new IntersectionObserver(e => {
              if(e[0].isIntersecting && !isLoading && hasMore) fetchMovies(currentPage+1, currentCategory, true);
          }).observe(document.getElementById('scroll-sentinel'));
      }
      function resetGrid() { currentPage=1; hasMore=true; document.getElementById('mainGrid').innerHTML=''; }

      // Auth & User
      function toggleUserPanel() { 
          const p = document.getElementById('userPanel');
          const o = document.getElementById('panelOverlay');
          if(p.classList.contains('open')) { p.classList.remove('open'); o.style.display='none'; }
          else { p.classList.add('open'); o.style.display='block'; }
      }
      
      function updateProfileUI() {
          if(currentUser) {
              document.getElementById('loginForm').classList.add('hidden');
              document.getElementById('profileView').classList.remove('hidden');
              document.getElementById('u_name').innerText = currentUser.username;
              // Date logic
              const d = new Date(currentUser.vipExpiry);
              if(d > Date.now()) document.getElementById('u_status').innerText = \`VIP until \${d.toLocaleDateString()}\`;
          }
      }

      async function doLogin() {
          const u = document.getElementById('reg_user').value;
          const p = document.getElementById('reg_pass').value;
          const res = await fetch('/api/auth/login', { method:'POST', body:JSON.stringify({username:u, password:p}) });
          if(res.ok) {
              currentUser = await res.json();
              localStorage.setItem('user_session', JSON.stringify(currentUser));
              updateProfileUI(); alert('Welcome!');
          } else alert('Error');
      }
      
      async function doRegister() { /* Use previous logic */ }
      async function doRedeem() { /* Use previous logic */ }
      function doLogout() { localStorage.removeItem('user_session'); currentUser=null; window.location.reload(); }
      
      // Favorites (Simplified)
      function updateFavState() {
         const favs = JSON.parse(localStorage.getItem('my_favs')||'[]');
         const btn = document.getElementById('favBtn');
         if(favs.includes(currentMovieId)) btn.classList.add('active');
         else btn.classList.remove('active');
      }
      
      window.toggleFavorite = function() {
          let favs = JSON.parse(localStorage.getItem('my_favs')||'[]');
          if(favs.includes(currentMovieId)) favs = favs.filter(i=>i!==currentMovieId);
          else favs.push(currentMovieId);
          localStorage.setItem('my_favs', JSON.stringify(favs));
          updateFavState();
      };
      
      async function openFavorites() {
         openCategory('FAVORITES'); // Custom logic needed in fetchMovies or separate func
         // For now, this just switches view. You can implement local array loading here.
      }
      
      // Controls Idle
      function setupPlayerIdle() {
          const o = document.getElementById('playerOverlay');
          let t;
          const reset = () => { o.style.opacity='1'; clearTimeout(t); t=setTimeout(()=>o.style.opacity='0',3000); };
          document.getElementById('videoWrapper').addEventListener('mousemove', reset);
          document.getElementById('videoWrapper').addEventListener('click', reset);
      }
      function toggleFullScreen() {
           const v = document.getElementById('videoWrapper');
           if(!document.fullscreenElement) v.requestFullscreen(); else document.exitFullscreen();
      }
      
      // Search
      function handleSearchKey(e) { if(e.key==='Enter') {
          const q = e.target.value;
          closeSearch();
          openCategory('SEARCH: '+q); // Needs backend support
          // Implement search logic here
      }}

    </script>
  </body>
  </html>
  `;
}
