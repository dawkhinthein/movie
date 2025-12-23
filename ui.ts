
export function renderWebsite() {
  function getServerSkeleton() { 
    return Array(6).fill(`
      <div class="card skeleton-card">
        <div class="poster-ratio skeleton"></div>
        <div class="text-line skeleton" style="width: 80%;"></div>
        <div class="text-line skeleton" style="width: 60%; height: 10px; margin-top:5px;"></div>
      </div>
    `).join(''); 
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Stream X</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
    <meta name="theme-color" content="#000000">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Padauk:wght@400;700&display=swap" rel="stylesheet">
    <style>
      :root {
        --primary: #00b894;
        --red-btn: #ff4757;
        --bg-body: #121212;
        --bg-card: #1e1e1e;
        --text-main: #ffffff;
        --text-sec: #b3b3b3;
        --border-color: #333;
        --shadow: 0 4px 12px rgba(0,0,0,0.3);
        --nav-height: 65px;
        --header-height: 60px;
      }

      * { 
          box-sizing: border-box; 
          -webkit-tap-highlight-color: transparent; 
          outline: none;
          overscroll-behavior: none !important; 
          -ms-overflow-style: none; 
          scrollbar-width: none; 
      }
      ::-webkit-scrollbar { display: none; }
      
      html, body { 
          background: var(--bg-body); 
          color: var(--text-main); 
          font-family: 'Padauk', 'Inter', sans-serif; 
          margin:0; padding:0;
          width: 100%; height: 100%;
          overflow: hidden; position: fixed;
          user-select: none; -webkit-user-select: none;
      }
      
      img { pointer-events: none; -webkit-user-drag: none; user-select: none; }

      /* Headers */
      header { 
        position: fixed; top: 0; left: 0; width: 100%; height: var(--header-height);
        background: rgba(18, 18, 18, 0.98); backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(255,255,255,0.1); 
        display:flex; justify-content: center; align-items: center; 
        z-index: 50; transition: opacity 0.2s;
      }
      .brand { color: var(--primary); font-weight: 900; font-size: 22px; letter-spacing: 1px; }

      .back-nav { 
          position: fixed; top: 0; left: 0; width: 100%; height: var(--header-height);
          background: rgba(18, 18, 18, 0.98); backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.1); 
          display: none; align-items: center; padding: 0 20px;
          z-index: 60;
      }

      /* Views */
      .scroll-view, .full-view {
          position: absolute; top: var(--header-height); left: 0; width: 100%; bottom: var(--nav-height);
          overflow-y: auto; overflow-x: hidden;
          background: var(--bg-body);
          -webkit-overflow-scrolling: touch;
          padding-top: 10px;
          display: none; 
      }
      #homeView { display: block; }

      /* Bottom Nav */
      .bottom-nav {
          position: fixed; bottom: 0; left: 0; width: 100%; height: var(--nav-height);
          background: #1a1a1a; border-top: 1px solid #333;
          display: flex; justify-content: space-around; align-items: center;
          z-index: 100; box-shadow: 0 -5px 20px rgba(0,0,0,0.5);
      }
      .nav-item {
          background: none; border: none; color: #777;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 600; width: 25%; height: 100%;
          cursor: pointer; transition: color 0.2s;
      }
      .nav-icon { font-size: 20px; margin-bottom: 4px; }
      .nav-item.active { color: var(--primary); }
      .nav-item.active .nav-icon { transform: scale(1.1); transition: transform 0.2s; }

      #global-loader { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-body); z-index: 9999; display: flex; justify-content: center; align-items: center; transition: opacity 0.3s; }
      .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .hidden-loader { opacity: 0; pointer-events: none; }

      .home-section { padding: 10px 0 10px 20px; }
      .section-head { display: flex; justify-content: space-between; align-items: center; padding-right: 20px; margin-bottom: 15px; }
      .section-title { color: #fff; font-size: 17px; font-weight: 700; border-left: 4px solid var(--primary); padding-left: 10px; }
      .see-more { 
          color: var(--primary); font-size: 11px; cursor: pointer; font-weight: 600; 
          border: 1px solid var(--primary); padding: 4px 10px; border-radius: 20px;
      }
      .scroll-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 20px; padding-right: 20px; scroll-behavior: smooth; }
      .card { position: relative; background: var(--bg-card); border-radius: 8px; overflow: hidden; cursor: pointer; box-shadow: var(--shadow); transition: transform 0.1s; }
      .card:active { transform: scale(0.97); }
      .scroll-row .card { min-width: 110px; max-width: 110px; }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; display: block; background: #222; }
      .title { padding: 8px 5px; font-size: 11px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ddd; font-weight: 600; }
      .prem-tag { position: absolute; top: 6px; left: 6px; background: #ffd700; color: #000; font-size: 9px; font-weight: 800; padding: 2px 5px; border-radius: 4px; z-index: 2; }
      .year-tag { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.8); color: #fff; font-size: 9px; font-weight: 700; padding: 2px 5px; border-radius: 4px; z-index: 2; border: 1px solid rgba(255,255,255,0.2); }

      /* Profiles */
      .profile-card { margin: 20px; padding: 25px; background: linear-gradient(135deg, var(--primary), #00b894, #006266); border-radius: 20px; color: white; text-align: center; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255,255,255,0.1); }
      .profile-avatar { width: 70px; height: 70px; background: rgba(0,0,0,0.2); border-radius: 50%; margin: 0 auto 10px; display:flex; align-items:center; justify-content:center; font-size:30px; border: 2px solid rgba(255,255,255,0.3); }
      .panel-body { padding: 0 20px; }
      .auth-input { width: 100%; padding: 15px; margin-bottom: 15px; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 12px; font-size: 14px; font-family: inherit; }
      .menu-btn { width: 100%; padding: 15px; border-radius: 12px; border: none; background: #2a2a2a; color: #ddd; text-align: left; font-weight: 600; font-size: 14px; margin-bottom: 10px; cursor: pointer; display: flex; align-items: center; gap: 10px; border: 1px solid #333; }
      .auth-btn-solid { width: 100%; padding: 15px; background: var(--primary); color: white; border: none; font-weight: bold; border-radius: 50px; font-size: 15px; cursor: pointer; box-shadow: 0 5px 15px rgba(0,184,148,0.3); margin-top:10px; }
      .checkbox-container { display: flex; align-items: center; margin-bottom: 20px; }
      .custom-checkbox { width: 18px; height: 18px; accent-color: var(--primary); margin-right: 10px; cursor: pointer; }
      .checkbox-label { color: #ccc; font-size: 13px; cursor: pointer; }
      .search-bar-large { width: 90%; margin: 20px 5%; padding: 15px 20px; background: #2a2a2a; border: 1px solid #444; border-radius: 30px; color: white; font-size: 16px; outline:none; }

      #custom-alert { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; align-items: flex-start; justify-content: center; padding-top: 20px; }
      .alert-box { background: #222; padding: 20px 25px; border-radius: 15px; text-align: center; width: 90%; max-width: 350px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); border: 1px solid #444; animation: slideDown 0.4s; }
      @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background: var(--bg-body); z-index:200; overflow-y: auto; overscroll-behavior: none !important; padding-bottom: 80px; }
      .details-header { position: sticky; top: 0; left: 0; width: 100%; padding: 15px 20px; display: flex; justify-content: space-between; z-index: 20; background: linear-gradient(to bottom, #121212 0%, rgba(18,18,18,0.9) 70%, rgba(18,18,18,0) 100%); }
      .nav-circle-btn { width: 40px; height: 40px; border-radius: 50%; background: rgba(40, 40, 40, 0.8); backdrop-filter: blur(5px); border: 1px solid #444; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff; cursor: pointer; }
      .modal-body-content { padding: 10px 20px 40px 20px; }
      .top-info-section { display: flex; gap: 20px; margin-bottom: 25px; align-items: flex-start; }
      .poster-img-sidebar { width: 110px; height: 160px; border-radius: 10px; object-fit: cover; box-shadow: 0 8px 20px rgba(0,0,0,0.5); flex-shrink: 0; background: #222; }
      .meta-col-sidebar { flex: 1; display: flex; flex-direction: column; justify-content: flex-start; padding-top: 5px; }
      .movie-title { font-size: 20px; font-weight: 800; color: #fff; margin: 0 0 10px 0; line-height: 1.2; }
      .stats-row { display: flex; align-items: center; gap: 15px; color: #bbb; font-size: 12px; margin-bottom: 15px; }
      .actions-container { display: flex; flex-direction: column; gap: 10px; margin-bottom: 25px; }
      .btn-play { width: 100%; padding: 14px; border-radius: 50px; border: none; background: var(--red-btn); color: white; font-weight: 700; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 6px 20px rgba(255, 71, 87, 0.2); }
      .btn-fav { width: 100%; padding: 14px; border-radius: 50px; background: transparent; color: #bbb; border: 1px solid #444; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
      .btn-fav.active { color: var(--primary); border-color: var(--primary); background: rgba(0, 184, 148, 0.1); }
      .desc-text { color: #ccc; font-size: 14px; line-height: 1.6; margin-bottom: 30px; opacity: 0.9; }
      .container { max-width: 1200px; margin: 0 auto; padding: 15px; display: none; padding-bottom: 80px; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 0 15px; }
      @media (min-width: 600px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 15px; } }
      #scroll-loader { grid-column: 1/-1; text-align: center; padding: 20px; display: none; }
      .small-spinner { width: 25px; height: 25px; border: 3px solid #333; border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }

      .video-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: black; z-index: 300; display: none; flex-direction: column; }
      .video-wrapper { width: 100%; height: 100%; background: black; position: relative; }
      .artplayer-app { width: 100%; height: 100%; display: block; }
      
      /* 🔥 CUSTOM CONTROLS OVERLAY */
      .custom-controls {
          position: absolute; top: 20px; right: 20px; z-index: 310;
          display: flex; gap: 15px;
      }
      .custom-btn {
          width: 45px; height: 45px; border-radius: 50%;
          background: rgba(255, 255, 255, 0.15); 
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255,255,255,0.3);
          color: white; font-size: 20px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; -webkit-tap-highlight-color: transparent;
      }
      .custom-btn:active { transform: scale(0.9); background: rgba(255,255,255,0.3); }

      .fallback-box { position:absolute; top:0; left:0; width:100%; height:100%; background:#000; display:none; flex-direction:column; align-items:center; justify-content:center; z-index:20; }
      .big-play-btn { width: 70px; height: 70px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 30px; color: white; cursor: pointer; box-shadow: 0 0 20px rgba(0, 184, 148, 0.5); animation: pulse 2s infinite; }
      @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }

      .accordion { background-color: #1e1e1e; color: #eee; padding: 15px; width: 100%; border: none; text-align: left; font-weight: 700; border-radius: 12px; display: flex; justify-content: space-between; margin-top:10px; border-bottom: 1px solid #333; }
      .panel { padding: 0 5px; background-color: transparent; max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
      .episode-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 10px; padding: 15px 5px; }
      .ep-btn { background: #2a2a2a; border: 1px solid #444; color: #ccc; padding: 12px 5px; cursor: pointer; border-radius: 10px; font-size: 12px; font-weight: 600; }
      .ep-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
      .genre-tag { background: #222; color: #ccc; font-size: 10px; padding: 4px 10px; border-radius: 8px; font-weight: 600; border: 1px solid #444; margin-right:5px; margin-bottom:5px; display:inline-block; }
      .skeleton-card { background: transparent; pointer-events: none; }
      .skeleton { animation: shimmer 2s infinite linear; background: linear-gradient(to right, #222 4%, #333 25%, #222 36%); background-size: 1000px 100%; border-radius: 6px; }
      .poster-ratio { width: 100%; aspect-ratio: 2/3; margin-bottom: 8px; }
      .text-line { height: 12px; border-radius: 4px; }
      @keyframes shimmer { 0% { background-position: -500px 0; } 100% { background-position: 500px 0; } }
    </style>
  </head>
  <body>

    <div id="custom-alert">
        <div class="alert-box">
            <h3 id="alert-title" style="color:#fff; margin-top:0;"></h3><p id="alert-msg" style="color:#aaa; margin-bottom:20px;"></p>
            <button onclick="document.getElementById('custom-alert').style.display='none'" class="auth-btn-solid">OK</button>
        </div>
    </div>
    <div id="global-loader"><div class="spinner"></div></div>

    <header id="mainHeader">
      <div class="brand" onclick="switchTab('home')">Stream X</div>
    </header>

    <div id="backNav" class="back-nav">
        <button class="nav-circle-btn" onclick="switchTab('home')" style="border:none;">⬅</button>
        <span id="gridTitle" style="color:white; font-weight:bold; margin-left:10px;">MOVIES</span>
    </div>

    <div id="homeView" class="scroll-view" style="display:block;">
        <div class="home-section"><div class="section-head"><span class="section-title">Movies</span><a class="see-more" onclick="openCategory('movies')">See All</a></div><div class="scroll-row" id="row_movies">${getServerSkeleton()}</div></div>
        <div class="home-section"><div class="section-head"><span class="section-title">Series</span><a class="see-more" onclick="openCategory('series')">See All</a></div><div class="scroll-row" id="row_series">${getServerSkeleton()}</div></div>
        
        <div style="height:20px;"></div>
    </div>

    <div id="searchView" class="full-view">
        <input type="text" id="searchInput" class="search-bar-large" placeholder="Search movies..." onkeypress="handleSearchKey(event)">
        <div class="grid" id="searchGrid"></div>
    </div>

    <div class="full-view" id="gridViewContainer">
        <div class="grid" id="mainGrid"></div>
        <div id="scroll-loader"><div class="small-spinner"></div></div>
    </div>

    <div id="profileViewContainer" class="full-view">
        <div id="loginForm" class="panel-body" style="padding-top:20px;">
            <h3 style="color:white; margin-bottom:20px;">Login</h3>
            <input type="text" id="reg_user" class="auth-input" placeholder="Username">
            <input type="password" id="reg_pass" class="auth-input" placeholder="Password">
            <div class="checkbox-container">
                <input type="checkbox" id="remember_me" class="custom-checkbox">
                <label for="remember_me" class="checkbox-label">Remember Me</label>
            </div>
            <button class="auth-btn-solid" onclick="doLogin()">Log In</button>
            <button class="auth-btn-solid" style="background:#555;" onclick="doRegister()">Create Account</button>
        </div>

        <div id="profileView" style="display:none; flex-direction:column;">
            <div class="profile-card">
                <div class="profile-avatar">👤</div>
                <h3 id="u_name" class="profile-name">User</h3>
                <p id="u_status" class="profile-status">Free Plan</p>
            </div>
            <div class="panel-body">
                <div style="display:flex; gap:10px; margin-bottom:20px;">
                    <input type="text" id="vip_code" class="auth-input" style="margin:0;" placeholder="Redeem Code">
                    <button class="auth-btn-solid" style="margin:0; width:auto; border-radius:12px;" onclick="doRedeem()">Go</button>
                </div>
                <button class="menu-btn" onclick="switchTab('fav')">❤️ &nbsp; My Favorites</button>
                <button class="menu-btn" onclick="doLogout()" style="color:#ff4757; border-color:#ff4757;">🚪 &nbsp; Log Out</button>
            </div>
        </div>
    </div>

    <div class="bottom-nav">
        <button class="nav-item active" onclick="switchTab('home')" id="nav_home">
            <span class="nav-icon">🏠</span>Home
        </button>
        <button class="nav-item" onclick="switchTab('search')" id="nav_search">
            <span class="nav-icon">🔍</span>Search
        </button>
        <button class="nav-item" onclick="switchTab('fav')" id="nav_fav">
            <span class="nav-icon">❤️</span>Favs
        </button>
        <button class="nav-item" onclick="switchTab('profile')" id="nav_profile">
            <span class="nav-icon">👤</span>Account
        </button>
    </div>

    <div id="playerModal">
      <div class="details-header">
        <button class="nav-circle-btn" onclick="closePlayer()">⬅</button>
      </div>

      <div class="modal-body-content">
          <div class="top-info-section">
              <img id="dt_poster" class="poster-img-sidebar" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
              <div class="meta-col-sidebar">
                  <h1 id="dt_title" class="movie-title">Loading...</h1>
                  <div class="stats-row">
                      <div class="stats-item">📅 <span id="dt_year">...</span></div>
                  </div>
                  <div id="dt_genres" class="genre-row"></div>
              </div>
          </div>

          <div class="actions-container">
              <button class="btn-play" onclick="launchVideo()">▶ Play Video</button>
              <div style="display:flex; gap:10px;">
                  <button id="favBtn" class="btn-fav" onclick="toggleFavorite()" style="width:100%;">🤍 Add to List</button>
              </div>
          </div>

          <div id="ep_section"></div>
          <div class="desc-text" style="margin-top:20px;"><span id="dt_desc"></span></div>
          <div style="height:50px;"></div>
      </div>

      <div id="videoOverlay" class="video-overlay">
         <div class="custom-controls">
             <button class="custom-btn" onclick="toggleFullScreen()" ontouchstart="toggleFullScreen()">⛶</button>
             <button class="custom-btn" onclick="closeVideo()" ontouchstart="closeVideo()">✕</button>
         </div>

         <div class="video-wrapper">
            <div id="artplayer-app" class="artplayer-app"></div>

            <div id="vip-lock" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:#000; align-items:center; justify-content:center; flex-direction:column; z-index:500;">
                <div style="font-size:40px;">👑</div><p style="color:#ffd700;">VIP Required</p>
                <button class="auth-btn-solid" style="width:auto; padding:8px 30px;" onclick="closeVideo(); toggleUserPanel();">Unlock</button>
            </div>
            
            <div id="fallback-box" class="fallback-box">
                <div class="big-play-btn" onclick="openExternalLink()">▶</div>
                <p style="color:#aaa; margin-top:15px; font-size:12px;">Tap to Start Video</p>
            </div>
         </div>
      </div>
    </div>

    <script>
      let currentUser = JSON.parse(localStorage.getItem('user_session') || 'null');
      let currentMovieId = "";
      let activeVideoLink = ""; 
      let activeIsPremium = false;
      let globalMovieCache = [];
      let currentCat = '';
      let pageNum = 1;
      let isLoading = false;
      let hasMore = true;
      let art = null;

      const loader = document.getElementById('global-loader');
      function showLoader() { loader.classList.remove('hidden-loader'); }
      window.hideLoader = function() { if(loader) loader.classList.add('hidden-loader'); }
      function showAlert(t, m) { 
          const alert = document.getElementById('custom-alert');
          document.getElementById('alert-title').innerText=t; 
          document.getElementById('alert-msg').innerText=m;
          alert.style.display='flex';
      }

      window.onload = async () => {
        setTimeout(() => window.hideLoader(), 3000);

        try {
            loadSession(); 
            updateProfileUI(); 
            await Promise.allSettled([
                fetchRow('movies', 'row_movies'), 
                fetchRow('series', 'row_series')
            ]);
        } catch(e) { console.error("Init Error", e); } 
        finally { window.hideLoader(); }
        
        const p = new URLSearchParams(window.location.search);
        const movieId = p.get('id');
        const view = p.get('view');
        
        if (movieId) { fetchSingleMovie(movieId); } 
        else if (view === 'profile') { switchTab('profile', false); }
        else if (view === 'search') { switchTab('search', false); }
        else if (view === 'fav') { switchTab('fav', false); }
        else if (view === 'grid') { openCategory(p.get('cat') || 'movies', false); }
        else { switchTab('home', false); }
        
        document.querySelectorAll('.scroll-view, .full-view').forEach(el => {
            el.addEventListener('scroll', (e) => {
                if(e.target.id === 'gridViewContainer') {
                    if ((e.target.scrollTop + e.target.clientHeight) >= e.target.scrollHeight - 300) {
                        if(!isLoading && hasMore) { pageNum++; fetchMovies(pageNum, currentCat, true); }
                    }
                }
            });
        });
      };

      window.onpopstate = function() {
          const p = new URLSearchParams(window.location.search);
          const id = p.get('id');
          const view = p.get('view');
          const cat = p.get('cat');
          
          if (!id) {
              closePlayerInternal();
          } else if(document.getElementById('playerModal').style.display === 'none') {
              fetchSingleMovie(id);
          }

          if(view === 'profile') switchTabInternal('profile');
          else if(view === 'search') switchTabInternal('search');
          else if(view === 'fav') switchTabInternal('fav');
          else if(view === 'grid') {
              if (cat) openCategory(cat, false);
          }
          else if(!id) switchTabInternal('home');
      };

      function switchTab(tab, push = true) {
          if(push) {
              const u = tab === 'home' ? window.location.pathname : \`?view=\${tab}\`;
              window.history.pushState({path:u},'',u);
          }
          switchTabInternal(tab);
      }

      function switchTabInternal(tab) {
          document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
          const btn = document.getElementById('nav_' + tab);
          if(btn) btn.classList.add('active');

          document.getElementById('mainHeader').style.display = 'flex';
          document.getElementById('backNav').style.display = 'none';

          document.getElementById('homeView').style.display='none';
          document.getElementById('searchView').style.display='none';
          document.getElementById('gridViewContainer').style.display='none';
          document.getElementById('profileViewContainer').style.display='none';

          if(tab === 'home') document.getElementById('homeView').style.display='block';
          else if(tab === 'search') { 
              document.getElementById('searchView').style.display='block';
              document.getElementById('searchInput').focus();
          }
          else if(tab === 'fav') openFavoritesInternal();
          else if(tab === 'profile') document.getElementById('profileViewContainer').style.display='block';
      }

      function goHome(){ switchTab('home'); }
      
      async function openCategory(c, pushState = true){
          currentCat = c; pageNum = 1; hasMore = true;
          document.getElementById('mainGrid').innerHTML = ""; 
          showLoader(); 
          
          document.getElementById('homeView').style.display='none'; 
          document.getElementById('gridViewContainer').style.display='block'; 
          document.getElementById('mainHeader').style.display='none';
          document.getElementById('backNav').style.display='flex';
          
          document.getElementById('gridTitle').innerText = c.toUpperCase();
          if(pushState) { const u = \`?view=grid&cat=\${encodeURIComponent(c)}\`; window.history.pushState({path:u},'',u); }
          await fetchMovies(1,c, true); hideLoader();
      }

      function closePlayer() { window.history.back(); }
      function closePlayerInternal(){ closeVideo(); document.getElementById('playerModal').style.display='none'; }

      async function launchVideo() {
    console.log("Playing ID:", activeMovieId); // Debug လုပ်ဖို့ log ထည့်ကြည့်ပါ
    
    if (!activeMovieId) {
        return showAlert("Error", "Movie ID မတွေ့ပါ။ စာမျက်နှာကို Refresh လုပ်ပြီး ပြန်ကြိုးစားပါ။");
    }

    showLoader();
    try {
        const response = await fetch("/api/sign_url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                movieId: activeMovieId,
                username: currentUser ? currentUser.username : null
            })
        });

        // Response status တွေကို စစ်ဆေးတာ
        if (response.status === 401) return showAlert("Login", "Login အရင်ဝင်ပါ");
        if (response.status === 403) return showAlert("VIP", "VIP ဝယ်ယူရန် လိုအပ်ပါသည်");

        const data = await response.json();
        if (data.token) {
            const maskedLink = \`/api/play?t=\${data.token}\`;
            document.getElementById('videoOverlay').style.display = 'flex';
            playViaArtPlayer(maskedLink);
        } else {
            showAlert("Error", "ဗီဒီယို လင့်ခ် မရရှိနိုင်ပါ");
        }
    } catch (e) {
        showAlert("Error", "ချိတ်ဆက်မှု အမှားအယွင်း ရှိနေပါသည်");
    } finally {
        hideLoader();
    }
}
      
      function closeVideo() {
          if (art) { art.destroy(false); art = null; }
          document.querySelectorAll('video').forEach(v => { v.pause(); v.src = ""; });
          // Ensure we exit fullscreen if active
          if (document.fullscreenElement) {
              document.exitFullscreen().catch(e => {});
          }
          document.getElementById('videoOverlay').style.display='none';
      }
      
      // 🔥 Custom Fullscreen Logic with Immersive Hack
      function toggleFullScreen() {
          const wrapper = document.querySelector('.video-wrapper');
          const video = document.querySelector('video');
          
          // 1. Try Native Android Interface (Best for WebViews)
          if(video && video.webkitEnterFullScreen) {
              video.webkitEnterFullScreen();
              return;
          }

          // 2. Fallback to Standard API
          if (!document.fullscreenElement) {
              if (wrapper.requestFullscreen) wrapper.requestFullscreen().catch(e => {});
              else if (wrapper.webkitRequestFullscreen) wrapper.webkitRequestFullscreen();
              
              // Try locking orientation
              if (screen.orientation && screen.orientation.lock) {
                  screen.orientation.lock('landscape').catch(e => {});
              }
          } else {
              if (document.exitFullscreen) document.exitFullscreen();
              if (screen.orientation && screen.orientation.unlock) {
                  screen.orientation.unlock();
              }
          }
      }
      
      function openExternalLink() { if(activeVideoLink) window.open(activeVideoLink, '_blank'); }
      
      function playViaArtPlayer(url) {
          if(art) art.destroy(false);
          art = new Artplayer({
              container: '#artplayer-app',
              url: url,
              type: url.includes('.m3u8') ? 'm3u8' : 'auto',
              autoplay: true,
              muted: false,
              // 🔥 Disable Native Controls so we use Custom Ones
              fullscreen: false, 
              fullscreenWeb: false,
              setting: true,
              playbackRate: true,
              aspectRatio: true,
              miniProgressBar: true,
              autoOrientation: true,
              theme: '#00b894',
              customType: {
                  m3u8: function (video, url) {
                      if (Hls.isSupported()) {
                          const hls = new Hls();
                          hls.loadSource(url);
                          hls.attachMedia(video);
                          hls.on(Hls.Events.MANIFEST_PARSED, function() {
                              video.play().catch(() => { video.muted = true; video.play(); });
                          });
                      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                          video.src = url; video.play();
                      } else {
                          art.notice.show = 'Unsupported M3U8';
                          document.getElementById('fallback-box').style.display = 'flex';
                      }
                  },
              },
          });
          art.on('ready', () => { art.play(); });
          art.on('error', () => { document.getElementById('fallback-box').style.display = 'flex'; });
      }

      async function fetchMovies(page, cat, append = false) { 
          if(isLoading) return; isLoading = true;
          if(page > 1) document.getElementById('scroll-loader').style.display = 'block';
          try {
              const res = await fetch(\`/api/movies?page=\${page}&cat=\${encodeURIComponent(cat)}\`); 
              const json = await res.json(); 
              if(json.data.length === 0) { hasMore = false; } else {
                  globalMovieCache = [...globalMovieCache, ...json.data];
                  globalMovieCache = [...new Map(globalMovieCache.map(item => [item.id, item])).values()];
                  const html = json.data.map(m => createCardHtml(m)).join('');
                  if(append) document.getElementById('mainGrid').innerHTML += html;
                  else document.getElementById('mainGrid').innerHTML = html;
              }
          } catch(e) { console.error(e); }
          isLoading = false; document.getElementById('scroll-loader').style.display = 'none';
      }
      
      async function fetchRow(c,id){
          try{
              const res=await fetch(\`/api/movies?page=1&cat=\${encodeURIComponent(c)}\`);
              const json=await res.json();
              if(json.data && json.data.length > 0) {
                  globalMovieCache = [...globalMovieCache, ...json.data];
                  globalMovieCache = [...new Map(globalMovieCache.map(item => [item.id, item])).values()];
                  document.getElementById(id).innerHTML=json.data.slice(0,10).map(m=>createCardHtml(m)).join('');
              }
          }catch(e){}
      }

      function createCardHtml(m) { 
          const tag = m.isPremium ? '<div class="prem-tag">VIP</div>' : '';
          const yearNum = (m.tags && m.tags.find(t => /^\\d{4}$/.test(t))) || ''; 
          const yearHtml = yearNum ? \`<div class="year-tag">\${yearNum}</div>\` : '';
          return \`<div class="card" onclick="openModalById('\${m.id}')"><img src="\${m.image}" loading="lazy">\${tag}\${yearHtml}<div class="title">\${m.title}</div></div>\`; 
      }

      function openModalById(id) { fetchSingleMovie(id); const u = \`?id=\${id}\`; window.history.pushState({path:u},'',u); }

      function resetDetailsUI() {
           const spacer = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
           document.getElementById('dt_poster').src = spacer; document.getElementById('dt_title').innerText = "Loading..."; document.getElementById('dt_year').innerText = "..."; document.getElementById('dt_desc').innerText = ""; document.getElementById('dt_genres').innerHTML = ""; document.getElementById('ep_section').innerHTML = "";
      }

      async function fetchSingleMovie(id){
          showLoader(); resetDetailsUI(); document.getElementById('playerModal').style.display='block';
          const res=await fetch(\`/api/get_movie?id=\${id}\`); const m=await res.json();
          hideLoader(); if(m&&m.title) setupDetailsPage(m);
      }

      function setupDetailsPage(m){
          currentMovieId=m.id;
          document.getElementById('dt_poster').src = m.image; document.getElementById('dt_title').innerText = m.title; document.getElementById('dt_desc').innerText = m.description || "No description available.";
          const year = (m.tags && m.tags.find(t => /^\\d{4}$/.test(t))) || "N/A"; document.getElementById('dt_year').innerText = year;
          if(m.tags) document.getElementById('dt_genres').innerHTML = m.tags.filter(t => !/^\\d{4}$/.test(t)).map(t=>\`<span class="genre-tag">\${t}</span>\`).join('');
          
          const epSec = document.getElementById('ep_section'); epSec.innerHTML = "";
          if(!m.episodes || m.episodes.length <= 1) { const link = (m.episodes && m.episodes[0]) ? m.episodes[0].link : m.link; activeVideoLink = link; activeIsPremium = m.isPremium; } else { activeVideoLink = m.episodes[0].link; activeIsPremium = m.isPremium; renderAccordion(m.episodes, m.isPremium); }
          updateFavBtnState();
      }

      function renderAccordion(episodes, isPremium) { 
        const container = document.getElementById('ep_section'); const seasons = {}; 
        episodes.forEach(ep => { let g = "Episodes"; if(ep.label.includes("Season")) g = ep.label.split(" ")[0] + " " + ep.label.split(" ")[1]; if(!seasons[g]) seasons[g] = []; seasons[g].push(ep); }); 
        Object.keys(seasons).forEach(key => { const btn = document.createElement('button'); btn.className = "accordion"; btn.innerHTML = key + ' <span>▼</span>'; const panel = document.createElement('div'); panel.className = "panel"; const grid = document.createElement('div'); grid.className = "episode-grid"; grid.innerHTML = seasons[key].map(ep => \`<button class="ep-btn" onclick="switchEpisode(this, '\${ep.link}', \${isPremium})">\${ep.label.replace(key,'').trim() || ep.label}</button>\`).join(''); panel.appendChild(grid); container.appendChild(btn); container.appendChild(panel); btn.onclick = () => { panel.style.maxHeight = panel.style.maxHeight ? null : "400px"; }; }); 
      }

      window.switchEpisode = function(btn, link, isPrem) {
          document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); activeVideoLink = link; activeIsPremium = isPrem; launchVideo();
      }

      function toggleFavorite(){
          if(!currentMovieId)return; let f=JSON.parse(localStorage.getItem('my_favs')||'[]'); if(f.includes(currentMovieId))f=f.filter(x=>x!==currentMovieId); else f.push(currentMovieId); localStorage.setItem('my_favs',JSON.stringify(f)); updateFavBtnState();
      }
      function updateFavBtnState(){ const f=JSON.parse(localStorage.getItem('my_favs')||'[]'); document.getElementById('favBtn').innerText=f.includes(currentMovieId)?"❤️ Saved":"🤍 Add to List"; }

      function loadSession(){
          const s = localStorage.getItem('user_session');
          if (s) {
              const user = JSON.parse(s);
              if (user.sessionExpiry && Date.now() > user.sessionExpiry) { doLogout(); return; }
              currentUser = user;
          }
      }

      function toggleUserPanel(){document.getElementById('userPanel').classList.toggle('open');}
      
      function updateProfileUI(){
         if(currentUser){
            document.getElementById('loginForm').style.display='none'; document.getElementById('profileView').style.display='flex';
            document.getElementById('u_name').innerText=currentUser.username;
            if(currentUser.vipExpiry > Date.now()) {
                const d = new Date(currentUser.vipExpiry); const dStr = d.getDate().toString().padStart(2,'0') + "/" + (d.getMonth()+1).toString().padStart(2,'0') + "/" + d.getFullYear(); document.getElementById('u_status').innerHTML = 'VIP Ends: ' + dStr;
            } else { document.getElementById('u_status').innerText = "Free Plan"; }
         } else { document.getElementById('loginForm').style.display='block'; document.getElementById('profileView').style.display='none'; }
      }
      async function doRegister(){const u=document.getElementById('reg_user').value,p=document.getElementById('reg_pass').value; if(!u||!p)return; showLoader(); await fetch('/api/auth/register',{method:'POST',body:JSON.stringify({username:u,password:p})}); hideLoader(); showAlert("Success","Created");}
      
      async function doLogin(){
          const u=document.getElementById('reg_user').value,p=document.getElementById('reg_pass').value; 
          showLoader(); 
          const res=await fetch('/api/auth/login',{method:'POST',body:JSON.stringify({username:u,password:p})}); 
          hideLoader(); 
          if(res.ok){ 
              const user=await res.json(); 
              user.vipExpiry=user.vipExpiry||0; 
              const remember = document.getElementById('remember_me').checked;
              const days = remember ? 15 : 1;
              user.sessionExpiry = Date.now() + (days * 24 * 60 * 60 * 1000);
              currentUser=user; 
              localStorage.setItem('user_session',JSON.stringify(user)); 
              updateProfileUI(); 
          } else showAlert("Error","Fail");
      }

      function doLogout(){localStorage.removeItem('user_session'); currentUser=null; updateProfileUI();}
      async function doRedeem(){const c=document.getElementById('vip_code').value; showLoader(); const res=await fetch('/api/auth/redeem',{method:'POST',body:JSON.stringify({username:currentUser.username,code:c})}); hideLoader(); if(res.ok){const u=await res.json(); currentUser=u; localStorage.setItem('user_session',JSON.stringify(u)); updateProfileUI(); showAlert("Success","VIP Added");}}
      
      function openFavoritesInternal(){
          document.getElementById('mainGrid').innerHTML = "";
          document.getElementById('mainHeader').style.display = 'none';
          document.getElementById('backNav').style.display = 'flex';
          document.getElementById('homeView').style.display='none'; document.getElementById('searchView').style.display='none';
          document.getElementById('gridViewContainer').style.display='block'; 
          document.getElementById('gridTitle').innerText = "MY LIST";
          const f=JSON.parse(localStorage.getItem('my_favs')||'[]'); 
          if(f.length){ Promise.all(f.map(id=>fetch(\`/api/get_movie?id=\${id}\`).then(r=>r.json()))).then(res => renderGrid(res, 'mainGrid')); } 
          else document.getElementById('mainGrid').innerHTML='<p style="grid-column:1/-1; text-align:center; padding:20px; color:#aaa;">No favorites yet.</p>';
      }
      
      function renderGrid(data, id = 'mainGrid') { document.getElementById(id).innerHTML = data.map(m => createCardHtml(m)).join(''); }

      async function executeSearch(){
          const q=document.getElementById('searchInput').value.trim(); 
          if(!q) return; 
          const grid = document.getElementById('searchGrid'); grid.innerHTML = '<div class="small-spinner"></div>';
          const qLower = q.toLowerCase();
          const localResults = globalMovieCache.filter(m => m.title.toLowerCase().includes(qLower));
          if(localResults.length > 0) { renderGrid(localResults, 'searchGrid'); return; }
          try {
              const res = await fetch(\`/api/search?q=\${encodeURIComponent(q)}\`);
              if (res.status === 404) { grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#aaa;">No results found.</div>'; return; }
              const json = await res.json();
              let results = [];
              if (Array.isArray(json)) results = json; else if (json.data && Array.isArray(json.data)) results = json.data;
              if (results.length === 0) { grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#aaa;">No results found.</div>'; } else { renderGrid(results, 'searchGrid'); }
          } catch(e) { grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#aaa;">No results found.</div>'; }
      }
      function handleSearchKey(e){if(e.key==='Enter')executeSearch();}
    </script>
  </body>
  </html>
  `;
}
