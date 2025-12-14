export function renderWebsite() {
  function getServerSkeleton() { 
    // Skeleton UI ကိုပိုလှအောင် HTML structure ပြင်ထားသည်
    return Array(6).fill(`
      <div class="card skeleton-card">
        <div class="poster-ratio skeleton"></div>
        <div class="text-line skeleton" style="width: 80%;"></div>
      </div>
    `).join(''); 
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Stream X</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="theme-color" content="#141414">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Padauk:wght@400;700&display=swap" rel="stylesheet">
    <style>
      :root {
        --primary: #E50914;
        --primary-hover: #b2070f;
        --bg-main: #141414;
        --bg-card: #181818;
        --text-main: #ffffff;
        --text-sec: #b3b3b3;
        --glass: rgba(20, 20, 20, 0.85);
        --glass-border: 1px solid rgba(255, 255, 255, 0.1);
        --radius: 8px;
      }

      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; outline: none; }
      body { background: var(--bg-main); color: var(--text-main); font-family: 'Inter', 'Padauk', sans-serif; margin:0; padding-bottom: 70px; user-select: none; overflow-x: hidden; }
      
      /* --- Header & Nav --- */
      header { 
        background: var(--glass); 
        backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
        padding: 15px 20px; position: sticky; top:0; z-index:50; 
        border-bottom: var(--glass-border); 
        display:flex; justify-content: space-between; align-items: center; 
        transition: all 0.3s ease;
      }
      .brand { 
        color: var(--primary); font-weight: 900; font-size: 24px; 
        text-transform: uppercase; letter-spacing: 1px; cursor:pointer; 
        text-shadow: 0 0 15px rgba(229, 9, 20, 0.4);
      }
      
      .search-box { 
        display: flex; align-items: center; background: rgba(255,255,255,0.1); 
        border: 1px solid rgba(255,255,255,0.1); border-radius: 50px; 
        padding: 6px 15px; width: 45%; max-width: 250px; 
        transition: 0.3s;
      }
      .search-box:focus-within { background: rgba(0,0,0,0.5); border-color: var(--primary); }
      .search-input { background: transparent; border: none; color: white; width: 100%; font-size: 14px; font-family: inherit; }
      .icon-btn { background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 5px; transition: transform 0.2s; }
      .icon-btn:active { transform: scale(0.9); }

      /* --- Loader --- */
      #global-loader { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-main); z-index: 9999; display: flex; justify-content: center; align-items: center; transition: opacity 0.4s; }
      .spinner { width: 45px; height: 45px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .hidden-loader { opacity: 0; pointer-events: none; }

      /* --- User Panel --- */
      .user-panel { 
        position: fixed; top: 0; right: 0; width: 300px; height: 100%; 
        background: #1a1a1a; z-index: 100; transform: translateX(100%); 
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); 
        padding: 25px; box-shadow: -10px 0 30px rgba(0,0,0,0.8); 
        display: flex; flex-direction: column; border-left: 1px solid #333;
      }
      .user-panel.open { transform: translateX(0); }
      .panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #333; padding-bottom: 15px; }
      
      .auth-input { width: 100%; padding: 14px; margin: 10px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: var(--radius); transition: 0.2s; font-family: inherit; }
      .auth-input:focus { border-color: var(--primary); background: #333; }
      
      .auth-btn { 
        width: 100%; padding: 14px; background: linear-gradient(45deg, var(--primary), #ff4b55); 
        color: white; border: none; font-weight: bold; cursor: pointer; 
        border-radius: var(--radius); margin-top: 15px; font-family: inherit; 
        box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3); transition: 0.2s;
      }
      .auth-btn:active { transform: scale(0.98); }
      .auth-btn.secondary { background: #333; margin-top: 10px; box-shadow: none; background: rgba(255,255,255,0.1); }

      /* --- Home Sections --- */
      .home-section { padding: 25px 0 10px 20px; }
      .section-head { display: flex; justify-content: space-between; align-items: center; padding-right: 20px; margin-bottom: 15px; }
      .section-title { color: #fff; font-size: 18px; font-weight: 700; display:flex; align-items:center; gap: 8px; }
      .section-title::before { content:''; display:block; width:4px; height:18px; background: var(--primary); border-radius: 2px; }
      .see-more { color: var(--primary); font-size: 12px; cursor: pointer; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
      
      .scroll-row { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 10px; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; padding-right: 20px; }
      .scroll-row::-webkit-scrollbar { display: none; } 
      
      /* --- Cards --- */
      .card { 
        position: relative; background: var(--bg-card); border-radius: var(--radius); 
        overflow: hidden; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; 
      }
      .scroll-row .card { min-width: 120px; max-width: 120px; }
      .scroll-row .card:active, .grid .card:active { transform: scale(0.95); opacity: 0.8; }
      
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; display: block; transition: 0.3s; }
      .title { padding: 10px 8px; font-size: 12px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ddd; font-weight: 500; }
      
      .prem-tag { position: absolute; top: 8px; left: 8px; background: linear-gradient(45deg, #ffd700, #ffaa00); color: #000; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; z-index: 2; box-shadow: 0 2px 5px rgba(0,0,0,0.5); }
      .year-tag { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); color: #fff; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; z-index: 2; border: 1px solid rgba(255,255,255,0.2); }

      /* --- Grid View --- */
      .container { max-width: 1200px; margin: 0 auto; padding: 15px; display: none; animation: fadeIn 0.3s ease; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      @media (min-width: 600px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }
      @media (min-width: 900px) { .grid { grid-template-columns: repeat(6, 1fr); } }

      .back-nav { display: none; padding: 10px 20px; align-items: center; gap: 15px; background: rgba(20,20,20,0.95); position: sticky; top: 60px; z-index: 40; border-bottom: 1px solid #333; backdrop-filter: blur(10px); }
      .back-btn { background: rgba(255,255,255,0.1); color: white; border: none; padding: 8px 18px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
      .back-btn:hover { background: rgba(255,255,255,0.2); }
      .grid-title { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: 1px; }

      /* --- Player & Modal --- */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:#000; z-index:200; overflow-y: auto; }
      .modal-content { width: 100%; max-width: 1100px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #111; }
      .video-area { position: sticky; top: 0; z-index: 10; background:black; width: 100%; aspect-ratio: 16/9; position: relative; box-shadow: 0 10px 50px rgba(0,0,0,0.5); }
      video { width: 100%; height: 100%; background: black; display: block; }
      
      .player-overlay { 
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
          display: none; flex-direction: column; justify-content: space-between;
          padding: 15px; box-sizing: border-box; 
          background: rgba(0,0,0,0.4);
          transition: opacity 0.3s; pointer-events: none; 
          z-index: 20;
      }
      .ctrl-group { display: flex; gap: 15px; pointer-events: auto; justify-content: flex-end; align-items: center; margin-top: auto; }
      .ctrl-btn { background: rgba(0,0,0,0.6); color: white; border: 1px solid rgba(255,255,255,0.3); width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 16px; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(4px); transition: 0.2s; }
      .ctrl-btn:hover { background: var(--primary); border-color: var(--primary); }
      .quality-select { pointer-events: auto; background: rgba(0,0,0,0.8); color: white; border: 1px solid #555; padding: 6px 12px; border-radius: 20px; font-size: 12px; outline: none; margin-right: auto; }

      .cover-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; }
      .cover-overlay::before { content:''; position:absolute; inset:0; background: rgba(0,0,0,0.3); }
      .play-btn-circle { width: 70px; height: 70px; background: rgba(229, 9, 20, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(229, 9, 20, 0.5); transition: transform 0.2s; backdrop-filter: blur(5px); z-index: 21; }
      .play-btn-circle:active { transform: scale(0.9); }
      .play-btn-circle::after { content: '▶'; color: white; font-size: 28px; margin-left: 4px; }

      #vip-lock { display: none; position: absolute; top:0; left:0; width:100%; height:100%; background: #080808; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; z-index: 25; }
      .lock-btn { background: linear-gradient(45deg, #ffd700, #ffaa00); color: #000; border: none; padding: 12px 35px; border-radius: 30px; font-weight: 800; font-size: 14px; margin-top: 15px; cursor: pointer; box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3); }

      #error-msg { display:none; position:absolute; top:0; left:0; width:100%; height:100%; background: #111; flex-direction: column; align-items: center; justify-content: center; z-index: 15; }
      .retry-btn { background: #333; border: 1px solid #555; color: white; padding: 12px 25px; border-radius: 30px; cursor: pointer; font-weight: bold; text-decoration: none; display:flex; align-items:center; gap:8px; margin-top:10px; }

      /* --- Info Section --- */
      .info-sec { padding: 25px; background: linear-gradient(to bottom, #111, #1a1a1a); min-height: 50vh; }
      #m_title { font-size: 22px; font-weight: 800; line-height: 1.3; margin-bottom: 10px; color: #fff; }
      .action-row { display: flex; gap: 12px; margin: 20px 0; align-items: center; }
      .fav-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 50px; cursor: pointer; font-size: 13px; font-weight: 600; display:flex; align-items:center; gap:6px; transition:0.2s; }
      .fav-btn.active { color: #fff; background: var(--primary); border-color: var(--primary); box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4); }
      .dl-btn { background: #00a8ff; color: #fff; padding: 10px 20px; border-radius: 50px; text-decoration: none; font-size: 13px; font-weight: bold; box-shadow: 0 4px 15px rgba(0, 168, 255, 0.3); }
      .tag-pill { background: #2a2a2a; color: #ccc; font-size: 11px; padding: 4px 10px; border-radius: 6px; border: 1px solid #333; }
      p.desc { color: #b3b3b3; font-size: 14px; line-height: 1.7; margin-top: 20px; }

      /* --- Episodes Accordion --- */
      .accordion { background-color: #222; color: #eee; cursor: pointer; padding: 16px; width: 100%; border: none; text-align: left; outline: none; font-size: 15px; font-weight: 600; border-bottom: 1px solid #333; display: flex; justify-content: space-between; margin-top: 8px; border-radius: 8px; font-family: inherit; transition:0.2s; }
      .accordion.active { background-color: #2a2a2a; color: var(--primary); }
      .panel { padding: 0 8px; background-color: #181818; max-height: 0; overflow: hidden; transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .episode-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 10px; padding: 15px 5px; max-height: 350px; overflow-y: auto; }
      .ep-btn { background: #2a2a2a; border: 1px solid #333; color: #ccc; padding: 12px 5px; cursor: pointer; border-radius: 6px; font-size: 12px; text-align: center; transition: 0.2s; }
      .ep-btn:hover { background: #333; }
      .ep-btn.active { background: var(--primary); color: white; border-color: var(--primary); font-weight: bold; box-shadow: 0 2px 8px rgba(229,9,20,0.4); }

      /* --- Custom Alert --- */
      #custom-alert { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; align-items: center; justify-content: center; backdrop-filter: blur(8px); animation: fadeIn 0.2s; }
      .alert-box { background: #1f1f1f; width: 85%; max-width: 320px; border-radius: 16px; padding: 30px 25px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); border: 1px solid #333; transform: scale(0.9); animation: popIn 0.3s forwards; }
      .alert-btn { background: var(--primary); color: white; border: none; padding: 12px 0; width: 100%; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 15px; margin-top: 10px; }

      @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      @keyframes popIn { from { transform:scale(0.8); opacity:0; } to { transform:scale(1); opacity:1; } }
      
      /* --- Skeleton Shimmer --- */
      @keyframes shimmer { 0% { background-position: -500px 0; } 100% { background-position: 500px 0; } }
      .skeleton-card { background: transparent; pointer-events: none; }
      .skeleton { animation: shimmer 2s infinite linear; background: linear-gradient(to right, #222 4%, #333 25%, #222 36%); background-size: 1000px 100%; border-radius: 6px; }
      .poster-ratio { width: 100%; aspect-ratio: 2/3; margin-bottom: 8px; }
      .text-line { height: 12px; border-radius: 4px; }
      
      #scroll-sentinel { height: 60px; display: flex; justify-content: center; align-items: center; }
      #bottom-spinner { width: 30px; height: 30px; border: 3px solid #333; border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; display: none; }
    </style>
  </head>
  <body>

    <div id="custom-alert"><div class="alert-box"><span id="alert-icon" style="font-size:45px; display:block; margin-bottom:15px;"></span><h3 id="alert-title" style="color:white; margin:0 0 8px;"></h3><p id="alert-msg" style="color:#aaa; font-size:14px; margin-bottom:25px; line-height:1.4;"></p><button class="alert-btn" onclick="closeCustomAlert()">OK</button></div></div>
    <div id="global-loader"><div class="spinner"></div></div>

    <header>
      <div class="brand" onclick="goHome()">STREAM<span style="color:white;">X</span></div>
      <div class="search-box"><input type="text" id="searchInput" class="search-input" placeholder="Search..." onkeypress="handleSearchKey(event)"><button class="icon-btn" onclick="executeSearch()">🔍</button></div>
      <button class="icon-btn" onclick="toggleUserPanel()" style="background:rgba(255,255,255,0.1); border-radius:50%; width:35px; height:35px; display:flex; align-items:center; justify-content:center;">👤</button>
    </header>

    <div id="userPanel" class="user-panel">
        <div class="panel-head"><h3 id="u_head" style="margin:0; color:#fff; font-size:20px;">Account</h3><button class="icon-btn" onclick="toggleUserPanel()">✕</button></div>
        <div id="loginForm">
            <input type="text" id="reg_user" class="auth-input" placeholder="Username">
            <input type="password" id="reg_pass" class="auth-input" placeholder="Password">
            <div style="margin:15px 0; display:flex; align-items:center;"><input type="checkbox" id="rememberMe" style="width:auto; margin-right:10px; accent-color:var(--primary);"><label for="rememberMe" style="color:#aaa; font-size:13px;">Remember me (15 Days)</label></div>
            <button class="auth-btn" onclick="doLogin()">Log In</button><button class="auth-btn secondary" onclick="doRegister()">Create Account</button>
        </div>
        <div id="profileView" style="display:none;">
            <div style="text-align:center; margin-bottom:20px;">
                <div style="width:70px; height:70px; background:#333; border-radius:50%; margin:0 auto 10px; display:flex; align-items:center; justify-content:center; font-size:30px;">👤</div>
                <h3 id="u_name" style="color:#fff; margin:0; font-size:18px;">User</h3>
                <p id="u_status" style="margin:5px 0; font-weight:bold; font-size:13px; color:#aaa;">Free Plan</p>
            </div>
            
            <p style="margin-bottom:8px; font-size:13px; color:#ccc;">Redeem VIP:</p>
            <div style="display:flex; gap:8px;"><input type="text" id="vip_code" class="auth-input" style="margin:0;" placeholder="Enter Code"><button class="auth-btn" style="margin:0; width:auto; padding:0 20px;" onclick="doRedeem()">Go</button></div>
            
            <div style="margin-top:25px; display:flex; flex-direction:column; gap:10px;">
                <button class="auth-btn secondary" onclick="openFavorites(); toggleUserPanel();" style="text-align:left; display:flex; align-items:center; gap:10px;">❤️ My Favorites</button>
                <button class="auth-btn secondary" onclick="doLogout()" style="text-align:left; color:#ff4b55;">🚪 Log Out</button>
            </div>
        </div>
        <div style="margin-top:auto; text-align:center; padding-top:20px; border-top:1px solid #333;"><a href="https://t.me/iqowoq" target="_blank" style="color:#0088cc; text-decoration:none; font-size:13px; display:flex; align-items:center; justify-content:center; gap:5px;">✈️ Contact Admin</a></div>
    </div>

    <div id="homeView">
        <div class="home-section"><div class="section-head"><span class="section-title">Trending Movies</span><a class="see-more" onclick="openCategory('movies')">See All</a></div><div class="scroll-row" id="row_movies">${getServerSkeleton()}</div></div>
        <div class="home-section"><div class="section-head"><span class="section-title">TV Series</span><a class="see-more" onclick="openCategory('series')">See All</a></div><div class="scroll-row" id="row_series">${getServerSkeleton()}</div></div>
        <div class="home-section"><div class="section-head"><span class="section-title">For Adults (18+)</span><a class="see-more" onclick="openCategory('Adult')">See All</a></div><div class="scroll-row" id="row_18">${getServerSkeleton()}</div></div>
    </div>

    <div class="back-nav" id="backNav"><button class="back-btn" onclick="goHome()">⬅ Back</button><span id="gridTitle" class="grid-title">MOVIES</span></div>
    <div class="container" id="gridViewContainer"><div class="grid" id="mainGrid"></div><div id="scroll-sentinel"><div id="bottom-spinner" class="spinner"></div><p id="end-msg" style="display:none; color:#555; font-size:12px; margin-top:20px;">You've reached the end.</p></div></div>

    <div id="playerModal">
      <div class="modal-content">
        <div class="video-area" id="videoWrapper">
            <div id="coverOverlay" class="cover-overlay" onclick="startPlayback()"><div class="play-btn-circle"></div></div>
            <video id="video" controls playsinline controlsList="nodownload"></video>
            
            <div id="vip-lock">
                <div style="font-size:50px; margin-bottom:15px;">👑</div>
                <h2 style="color:#ffd700; margin:0;">Premium Content</h2>
                <p style="color:#aaa; max-width:300px; margin:10px auto;">This video is reserved for VIP members.</p>
                <button class="lock-btn" onclick="closePlayer(); toggleUserPanel();">Login or Redeem Code</button>
            </div>
            
            <div id="error-msg">
                <p style="color:#fff; font-weight:bold;">Playback Error</p>
                <p style="color:#aaa; font-size:12px;">Stream failed to load.</p>
                <a id="fallback-btn" class="retry-btn" target="_blank">▶ Play via External Player</a>
            </div>
            
            <div class="player-overlay" id="playerOverlay">
                <div style="display:flex; justify-content:flex-end;"><button class="ctrl-btn" onclick="closePlayer()">✕</button></div>
                <div class="ctrl-group">
                    <select id="qualitySelect" class="quality-select" style="display:none;" onchange="changeQuality(this)"></select>
                    <button class="ctrl-btn" onclick="toggleFullScreen()">⛶</button>
                </div>
            </div>
        </div>
        
        <div class="info-sec">
          <h2 id="m_title">Loading...</h2>
          <div id="m_tags" style="margin:10px 0; display:flex; gap:8px; flex-wrap:wrap;"></div>
          <div class="action-row"><button id="favBtn" class="fav-btn" onclick="toggleFavorite()">🤍 Add to List</button><div id="dl_area"></div></div>
          <p id="m_desc" class="desc"></p>
          <div id="ep_section" style="margin-top:30px;"></div>
        </div>
      </div>
    </div>

    <script>
      let currentPage = 1, currentCategory = 'all', allMoviesData = [];
      let currentUser = JSON.parse(localStorage.getItem('user_session') || 'null');
      let currentMovieId = "";
      window.hlsInstance = null;
      let controlsTimeout;
      let isLoading = false, hasMore = true, observer;
      let activeVideoLink = ""; 
      let activeIsPremium = false;

      const loader = document.getElementById('global-loader');
      function showLoader() { loader.classList.remove('hidden-loader'); }
      function hideLoader() { loader.classList.add('hidden-loader'); }
      function getClientSkeleton(count) { 
          return Array(count).fill('<div class="card skeleton-card"><div class="poster-ratio skeleton"></div><div class="text-line skeleton" style="width:80%"></div></div>').join(''); 
      }
      function showAlert(title, msg, isSuccess = true) { const el = document.getElementById('custom-alert'); document.getElementById('alert-icon').innerText = isSuccess ? '✅' : '⚠️'; document.getElementById('alert-title').innerText = title; document.getElementById('alert-msg').innerText = msg; el.style.display = 'flex'; }
      function closeCustomAlert() { document.getElementById('custom-alert').style.display = 'none'; }

      window.addEventListener('popstate', function(event) {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const view = urlParams.get('view');
        const cat = urlParams.get('cat');
        
        if (movieId) {
             openModalById(movieId, false); 
        } else if (view === 'grid') {
             closePlayerInternal();
             if(currentCategory !== cat || document.getElementById('mainGrid').innerHTML === "") {
                 openCategory(cat || 'all', false); 
             } else {
                 showGridInternal();
             }
        } else {
             closePlayerInternal();
             goHomeInternal();
        }
      });

      window.onload = async () => {
        loadSession(); updateProfileUI(); 
        await Promise.all([
            fetchRow('movies', 'row_movies'),
            fetchRow('series', 'row_series'),
            fetchRow('Adult', 'row_18')
        ]);
        
        setupPlayerIdle(); hideLoader(); setupInfiniteScroll();
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const view = urlParams.get('view');
        const catParam = urlParams.get('cat');
        
        if(catParam) currentCategory = catParam;

        if (movieId) {
            fetchSingleMovie(movieId);
            if(view === 'grid') {
                document.getElementById('gridTitle').innerText = decodeURIComponent(currentCategory).toUpperCase();
                fetchMovies(1, currentCategory, false);
            }
        }
        else if (view === 'grid') { openCategory(catParam || 'all', false); }
      };

      function closePlayer() {
          closePlayerInternal();
          const currentParams = new URLSearchParams(window.location.search);
          currentParams.delete('id'); 
          let newUrl = window.location.pathname;
          if(currentParams.toString()) newUrl += '?' + currentParams.toString();
          window.history.pushState(null, '', newUrl);
          if(currentParams.get('view') === 'grid') showGridInternal();
          else goHomeInternal();
      }

      function openModalById(id, pushState = true) {
        const m = allMoviesData.find(x => x.id === id);
        if(m) { setupModal(m); } else { fetchSingleMovie(id); }
        if(pushState) {
            const currentParams = new URLSearchParams(window.location.search);
            currentParams.set('id', id);
            const newUrl = window.location.pathname + '?' + currentParams.toString();
            window.history.pushState({path:newUrl},'',newUrl);
        }
      }

      function setupPlayerIdle() {
          const w = document.getElementById('videoWrapper');
          const o = document.getElementById('playerOverlay');
          const v = document.getElementById('video');
          const show = () => {
              if(v.style.display === 'none') return;
              o.style.display = "flex"; o.style.opacity = "1";
              clearTimeout(controlsTimeout);
              if(!v.paused) controlsTimeout = setTimeout(() => { o.style.opacity = "0"; }, 3000);
          };
          w.addEventListener('mousemove', show); w.addEventListener('touchstart', show); w.addEventListener('click', show);
          v.addEventListener('play', show); v.addEventListener('pause', () => { o.style.opacity = "1"; clearTimeout(controlsTimeout); });
      }

      function renderAccordion(episodes, isPremium) { const container = document.getElementById('ep_section'); container.innerHTML = ""; const seasons = {}; episodes.forEach(ep => { let g = "Videos"; const match = ep.label.match(/^(Season \\d+|S\\d+)/i); if(match) { let s = match[0]; if(s.toUpperCase().startsWith('S') && !s.toUpperCase().startsWith('SEASON')) s = s.replace(/^S/i, 'Season '); g = s; if(g.match(/Season\s*Season/i)) g = g.replace(/Season\s*Season/i, 'Season'); } else if(ep.label === 'Movie') g = "Movie"; if(!seasons[g]) seasons[g] = []; seasons[g].push(ep); }); Object.keys(seasons).sort().forEach(key => { const btn = document.createElement('button'); btn.className = "accordion"; btn.innerHTML = key; const panel = document.createElement('div'); panel.className = "panel"; const grid = document.createElement('div'); grid.className = "episode-grid"; grid.innerHTML = seasons[key].map(ep => { let clean = ep.label.replace(key, '').trim(); if(!clean) clean = ep.label; return \`<button class="ep-btn" onclick="switchEpisode(this, '\${ep.link}', \${isPremium})">\${clean}</button>\`; }).join(''); panel.appendChild(grid); container.appendChild(btn); container.appendChild(panel); btn.onclick = () => { btn.classList.toggle("active"); if(panel.style.maxHeight) panel.style.maxHeight=null; else panel.style.maxHeight="400px"; }; }); }
      function setupInfiniteScroll() { const sentinel = document.getElementById('scroll-sentinel'); if(!sentinel) return; observer = new IntersectionObserver((entries) => { if(entries[0].isIntersecting && !isLoading && hasMore) { fetchMovies(currentPage + 1, currentCategory, true); } }, { rootMargin: '100px' }); observer.observe(sentinel); }
      async function fetchMovies(page, cat, append=false) { if(isLoading) return; isLoading = true; document.getElementById('bottom-spinner').style.display = 'block'; const encodedCat = (cat==='all'||cat==='movies'||cat==='series') ? cat : encodeURIComponent(cat); const res = await fetch(\`/api/movies?page=\${page}&cat=\${encodedCat}\`); const json = await res.json(); isLoading = false; document.getElementById('bottom-spinner').style.display = 'none'; if(json.data.length === 0) { hasMore = false; if(append) document.getElementById('end-msg').style.display = 'block'; return; } allMoviesData = append ? allMoviesData.concat(json.data) : json.data; renderGrid(json.data, append); currentPage = page; }
      function renderGrid(data, append) { const grid = document.getElementById('mainGrid'); const html = data.map(m => createCardHtml(m)).join(''); if(append) grid.innerHTML += html; else grid.innerHTML = html; }
      function createCardHtml(m) { const tag = m.isPremium ? '<div class="prem-tag">VIP</div>' : ''; const yearTag = (m.tags && m.tags.find(t => /^\\d{4}$/.test(t))) || ''; const yearHtml = yearTag ? \`<div class="year-tag">\${yearTag}</div>\` : ''; return \`<div class="card" onclick="openModalById('\${m.id}')"><img src="\${m.image}" loading="lazy" onerror="this.src='https://via.placeholder.com/150x225?text=No+Img'" oncontextmenu="return false;">\${tag}\${yearHtml}<div class="title">\${m.title}</div></div>\`; }
      function loadSession(){const s=localStorage.getItem('user_session');if(s) currentUser=JSON.parse(s);}
      function toggleUserPanel(){document.getElementById('userPanel').classList.toggle('open');}
      function updateProfileUI(){if(currentUser){document.getElementById('loginForm').style.display='none';document.getElementById('profileView').style.display='block';document.getElementById('u_name').innerText=currentUser.username;const exp=currentUser.vipExpiry;if(exp>Date.now()){const date=new Date(exp);const dStr=date.toLocaleString('en-GB',{timeZone:'Asia/Yangon',day:'2-digit',month:'2-digit',year:'numeric'});const daysLeft=Math.ceil((exp-Date.now())/(1000*60*60*24));document.getElementById('u_status').innerHTML=\`<span style="color:#ffd700">👑 VIP Active (Ends: \${dStr})</span>\`;}else{document.getElementById('u_status').innerText='Free Plan';}}else{document.getElementById('loginForm').style.display='block';document.getElementById('profileView').style.display='none';}}
      async function doRegister(){const u=document.getElementById('reg_user').value;const p=document.getElementById('reg_pass').value;if(!u||!p)return showAlert("Error", "Missing fields", false);showLoader();const res=await fetch('/api/auth/register',{method:'POST',body:JSON.stringify({username:u,password:p})});hideLoader();if(res.ok)showAlert("Success", "Account created!");else showAlert("Error", "Username taken", false);}
      async function doLogin(){const u=document.getElementById('reg_user').value;const p=document.getElementById('reg_pass').value;const remember=document.getElementById('rememberMe').checked;showLoader();const res=await fetch('/api/auth/login',{method:'POST',body:JSON.stringify({username:u,password:p})});hideLoader();if(res.ok){const user=await res.json();user.sessionExpiry=Date.now()+(remember?15:1)*24*60*60*1000;currentUser=user;localStorage.setItem('user_session',JSON.stringify(currentUser));updateProfileUI();showAlert("Welcome Back", "Login Successful");}else showAlert("Error", "Invalid Credentials", false);}
      function doLogout(){localStorage.removeItem('user_session');currentUser=null;updateProfileUI();showAlert("Logged Out", "See you soon!");}
      async function doRedeem(){const code=document.getElementById('vip_code').value;showLoader();const res=await fetch('/api/auth/redeem',{method:'POST',body:JSON.stringify({username:currentUser.username,code})});hideLoader();if(res.ok){const updatedUser=await res.json();updatedUser.sessionExpiry=currentUser.sessionExpiry;currentUser=updatedUser;localStorage.setItem('user_session',JSON.stringify(currentUser));showAlert("Premium Unlocked!", "VIP Extended");updateProfileUI();}else showAlert("Error", "Invalid or Used Code", false);}
      
      async function fetchRow(c,id){try{const res=await fetch(\`/api/movies?page=1&cat=\${encodeURIComponent(c)}\`);const json=await res.json();document.getElementById(id).innerHTML=json.data.slice(0,10).map(m=>createCardHtml(m)).join('');}catch(e){}}
      
      function goHome(){showLoader();setTimeout(()=>{const u=window.location.protocol+"//"+window.location.host+window.location.pathname;window.history.pushState({path:u},'',u);goHomeInternal();hideLoader();},300);}
      function goHomeInternal(){document.getElementById('homeView').style.display='block';document.getElementById('gridViewContainer').style.display='none';document.getElementById('backNav').style.display='none';document.getElementById('searchInput').value='';}
      function showGridInternal(){document.getElementById('homeView').style.display='none';document.getElementById('gridViewContainer').style.display='block';document.getElementById('backNav').style.display='flex';}
      
      function openCategory(c,p=true){
          showLoader(); 
          currentCategory=c; 
          showGridInternal(); 
          document.getElementById('gridTitle').innerText=decodeURIComponent(c).toUpperCase();
          if(p){const u=\`?view=grid&cat=\${encodeURIComponent(c)}\`;window.history.pushState({path:u},'',u);}
          resetGridState();
          fetchMovies(1,c,true).then(hideLoader);
      }
      async function openFavorites(){showLoader();showGridInternal();document.getElementById('gridTitle').innerText="MY LIST";resetGridState();document.getElementById('mainGrid').innerHTML=getClientSkeleton(6);window.history.pushState({},'','?view=grid&cat=fav');const favs=JSON.parse(localStorage.getItem('my_favs')||'[]');if(favs.length===0){document.getElementById('mainGrid').innerHTML='<p style="grid-column:1/-1; text-align:center; margin-top:50px;">No favorites yet.</p>';hideLoader();return;}let html='';for(const id of favs){try{const res=await fetch(\`/api/get_movie?id=\${id}\`);const m=await res.json();if(m&&m.title){html+=createCardHtml(m);if(!allMoviesData.find(x=>x.id===m.id))allMoviesData.push(m);}}catch(e){}}document.getElementById('mainGrid').innerHTML=html;hideLoader();}
      async function executeSearch(){const q=document.getElementById('searchInput').value;if(!q)return goHome();showLoader();showGridInternal();document.getElementById('gridTitle').innerText="SEARCH: "+q;window.history.pushState({},'','?view=grid&q='+encodeURIComponent(q));resetGridState();document.getElementById('mainGrid').innerHTML=getClientSkeleton(10);try{const res=await fetch(\`/api/search?q=\${encodeURIComponent(q)}\`);const results=await res.json();allMoviesData=results;if(results.length===0)document.getElementById('mainGrid').innerHTML='<p style="grid-column:1/-1;text-align:center;padding:50px;">No results found.</p>';else renderGrid(results,false);}catch(e){document.getElementById('mainGrid').innerHTML='<p style="grid-column:1/-1;text-align:center;">Error.</p>';}finally{hideLoader();}}
      function handleSearchKey(e){if(e.key==='Enter')executeSearch();}
      async function fetchSingleMovie(id){showLoader();resetPlayerUI();document.getElementById('playerModal').style.display='block';const res=await fetch(\`/api/get_movie?id=\${id}\`);const movie=await res.json();if(movie&&movie.title)setupModal(movie);hideLoader();}
      function resetPlayerUI(){document.getElementById('m_title').innerText="Loading...";document.getElementById('m_desc').innerText="";document.getElementById('m_tags').innerHTML="";document.getElementById('ep_section').innerHTML="";document.getElementById('dl_area').innerHTML="";document.getElementById('coverOverlay').style.backgroundImage="";document.getElementById('vip-lock').style.display="none";document.getElementById('error-msg').style.display="none";document.getElementById('video').style.display="block";document.getElementById('playerOverlay').style.display='none';}
      function setupModal(m){currentMovieId=m.id;document.getElementById('playerModal').style.display='block';document.body.style.overflow='hidden';document.getElementById('m_title').innerText=m.title;document.getElementById('m_desc').innerText=m.description||"";document.getElementById('coverOverlay').style.backgroundImage=\`url('\${m.cover||m.image}')\`;document.getElementById('coverOverlay').style.display='flex';document.getElementById('video').style.display='none';document.getElementById('video').pause();if(m.tags)document.getElementById('m_tags').innerHTML=m.tags.map(t=>\`<span class="tag-pill">\${t}</span>\`).join('');updateFavBtnState();const dl=document.getElementById('dl_area');dl.innerHTML="";if(m.downloadLink)dl.innerHTML=\`<a href="\${m.downloadLink}" target="_blank" class="dl-btn">📥 Download</a>\`;if(!m.episodes||m.episodes.length<=1){document.getElementById('ep_section').style.display='none';const l=(m.episodes&&m.episodes[0])?m.episodes[0].link:m.link;setupPlayButton(l,m.isPremium);}else{document.getElementById('ep_section').style.display='block';renderAccordion(m.episodes,m.isPremium);const f=m.episodes[0].link;setupPlayButton(f,m.isPremium);}}
      function updateFavBtnState(){const f=JSON.parse(localStorage.getItem('my_favs')||'[]');const b=document.getElementById('favBtn');if(f.includes(currentMovieId)){b.innerHTML="❤️ Saved";b.classList.add('active');}else{b.innerHTML="🤍 Add to List";b.classList.remove('active');}}
      window.toggleFavorite=function(){if(!currentMovieId)return;let f=JSON.parse(localStorage.getItem('my_favs')||'[]');if(f.includes(currentMovieId))f=f.filter(i=>i!==currentMovieId);else f.push(currentMovieId);localStorage.setItem('my_favs',JSON.stringify(f));updateFavBtnState();}
      function setupPlayButton(l,p){activeVideoLink=l;activeIsPremium=p;}
      window.switchEpisode=function(b,l,p){document.querySelectorAll('.ep-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');setupPlayButton(l,p);if(document.getElementById('video').style.display!=='none')startPlayback();else startPlayback();}
      
      window.startPlayback=function(){
          if(activeIsPremium){
              if(!currentUser||currentUser.vipExpiry<Date.now()){
                  document.getElementById('vip-lock').style.display='flex';
                  document.getElementById('video').style.display='none';
                  return;
              }
          }
          document.getElementById('coverOverlay').style.display='none';
          document.getElementById('playerOverlay').style.display='flex';
          const v=document.getElementById('video');
          setupPlayerIdle();
          playViaSecureToken(activeVideoLink);
      }

      async function playViaSecureToken(u){const v=document.getElementById('video');v.style.display='block';document.getElementById('error-msg').style.display='none';const qSelect = document.getElementById('qualitySelect'); qSelect.innerHTML = ""; qSelect.style.display = "none"; const sf=()=>{v.style.display='none';document.getElementById('error-msg').style.display='flex';document.getElementById('fallback-btn').href=u;};if(u.includes('.m3u8')){v.src="";if(v.canPlayType('application/vnd.apple.mpegurl')){v.src=u;v.addEventListener('loadedmetadata',()=>{v.play().catch(e=>{});});v.onerror=()=>tryHlsJs(v,u,sf);}else{tryHlsJs(v,u,sf);}return;}try{const res=await fetch('/api/sign_url',{method:'POST',body:JSON.stringify({url:u,movieId:currentMovieId,username:currentUser?currentUser.username:null})});if(res.status===403){document.getElementById('vip-lock').style.display='flex';v.style.display='none';return;}const j=await res.json();if(j.token){v.src="/api/play?t="+j.token;v.play().catch(sf);v.onerror=sf;}else sf();}catch(e){sf();}}
      function tryHlsJs(v,u,cb){if(Hls.isSupported()){if(window.hlsInstance)window.hlsInstance.destroy();const h=new Hls();window.hlsInstance=h;h.loadSource(u);h.attachMedia(v);h.on(Hls.Events.MANIFEST_PARSED,()=>{v.play().catch(()=>{});const l=h.levels;const s=document.getElementById('qualitySelect');if(l.length>1){s.innerHTML="";const a=document.createElement('option');a.value=-1;a.text="Auto";s.appendChild(a);l.forEach((x,i)=>{const o=document.createElement('option');o.value=i;o.text=x.height+"p";s.appendChild(o);});s.style.display="block";}});h.on(Hls.Events.ERROR,(e,d)=>{if(d.fatal){h.destroy();cb();}});}else{cb();}}
      window.changeQuality=function(s){if(window.hlsInstance)window.hlsInstance.currentLevel=parseInt(s.value);}
      function closePlayerInternal(){const v=document.getElementById('video');v.pause();v.src="";if(window.hlsInstance){window.hlsInstance.destroy();window.hlsInstance=null;}document.getElementById('playerModal').style.display='none';document.body.style.overflow='auto';if(document.fullscreenElement)document.exitFullscreen();}
      function toggleFullScreen(){const w=document.getElementById('videoWrapper');if(!document.fullscreenElement){if(w.requestFullscreen)w.requestFullscreen();if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(e=>{});}else{if(document.exitFullscreen)document.exitFullscreen();}}
      function resetGridState(){currentPage=1;isLoading=false;hasMore=true;allMoviesData=[];document.getElementById('mainGrid').innerHTML="";document.getElementById('end-msg').style.display="none";document.getElementById('bottom-spinner').style.display="none";}
    </script>
  </body>
  </html>
  `;
}
