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
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="theme-color" content="#ffffff">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Padauk:wght@400;700&display=swap" rel="stylesheet">
    <style>
      :root {
        --primary: #00b894; /* Green/Teal color */
        --bg-main: #f8f9fa; /* Light Gray Background */
        --bg-card: #ffffff; /* White Card Background */
        --text-main: #333333; /* Dark Text */
        --text-sec: #666666; /* Secondary Text */
        --border-color: #e9ecef;
      }

      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; outline: none; }
      
      html, body { 
          overscroll-behavior-y: none; 
          background: var(--bg-main); 
          color: var(--text-main); 
          font-family: 'Padauk', 'Inter', sans-serif; /* Padauk First */
          margin:0; 
          padding-bottom: 70px; 
          user-select: none;
          -webkit-user-select: none;
          overflow-x: hidden; 
      }
      
      img { pointer-events: none; -webkit-user-drag: none; user-select: none; }

      /* --- Light Theme Header --- */
      header { 
        background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);
        padding: 15px 20px; position: sticky; top:0; z-index:50; 
        border-bottom: 1px solid var(--border-color); 
        display:flex; justify-content: space-between; align-items: center; 
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      }
      .brand { color: var(--primary); font-weight: 900; font-size: 24px; cursor:pointer; }
      .search-box { display: flex; align-items: center; background: #f1f3f5; border-radius: 50px; padding: 6px 15px; width: 50%; border: 1px solid var(--border-color); }
      .search-input { background: transparent; border: none; color: var(--text-main); width: 100%; font-size: 14px; font-family: inherit; }
      .icon-btn { background: none; border: none; color: var(--text-main); font-size: 22px; cursor: pointer; padding: 5px; }

      /* --- Loader (Light Theme) --- */
      #global-loader { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-card); z-index: 9999; display: flex; justify-content: center; align-items: center; transition: opacity 0.3s; }
      .spinner { width: 40px; height: 40px; border: 3px solid #e9ecef; border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .hidden-loader { opacity: 0; pointer-events: none; }

      /* --- Home Section --- */
      .home-section { padding: 20px 0 10px 20px; }
      .section-head { display: flex; justify-content: space-between; align-items: center; padding-right: 20px; margin-bottom: 15px; }
      .section-title { color: var(--text-main); font-size: 18px; font-weight: 700; border-left: 3px solid var(--primary); padding-left: 10px; }
      .see-more { color: var(--primary); font-size: 13px; cursor: pointer; font-weight: 600; }
      .scroll-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 15px; padding-right: 20px; scroll-behavior: smooth; }
      .scroll-row::-webkit-scrollbar { display: none; } 
      
      /* --- Cards (Light Theme) --- */
      .card { position: relative; background: var(--bg-card); border-radius: 10px; overflow: hidden; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.1s; border: 1px solid var(--border-color); }
      .card:active { transform: scale(0.98); }
      .scroll-row .card { min-width: 115px; max-width: 115px; }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; display: block; background: #eee; }
      .title { padding: 8px; font-size: 12px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-main); font-weight: 600; }
      
      .prem-tag { position: absolute; top: 6px; left: 6px; background: #ffd700; color: #000; font-size: 9px; font-weight: 800; padding: 3px 6px; border-radius: 4px; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
      .year-tag { position: absolute; top: 6px; right: 6px; background: rgba(255,255,255,0.9); color: #000; font-size: 9px; font-weight: bold; padding: 3px 6px; border-radius: 4px; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

      /* --- User Panel (Light Theme) --- */
      .user-panel { 
        position: fixed; top: 0; right: 0; width: 300px; height: 100%; 
        background: var(--bg-card); z-index: 100; transform: translateX(100%); 
        transition: transform 0.3s ease; padding: 25px; border-left: 1px solid var(--border-color);
        box-shadow: -5px 0 20px rgba(0,0,0,0.05); display: flex; flex-direction: column; color: var(--text-main);
      }
      .user-panel.open { transform: translateX(0); }
      .auth-input { width: 100%; padding: 14px; margin: 10px 0; background: #f8f9fa; border: 1px solid var(--border-color); color: var(--text-main); border-radius: 8px; font-family: inherit; }
      .auth-btn { width: 100%; padding: 14px; background: var(--primary); color: white; border: none; font-weight: bold; cursor: pointer; border-radius: 25px; margin-top: 15px; font-family: inherit; font-size: 15px; box-shadow: 0 4px 10px rgba(0, 184, 148, 0.2); }
      .auth-btn.secondary { background: #e9ecef; color: var(--text-main); margin-top: 10px; box-shadow: none; border: 1px solid var(--border-color); }

      /* --- Grid View --- */
      .container { max-width: 1200px; margin: 0 auto; padding: 15px; display: none; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      @media (min-width: 600px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 15px; } }
      .back-nav { display: none; padding: 10px 20px; align-items: center; background: rgba(255,255,255,0.95); position: sticky; top: 60px; z-index: 40; border-bottom: 1px solid var(--border-color); box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
      .back-nav-btn { background: none; border: none; color: var(--text-main); font-size: 24px; cursor: pointer; }

      /* --- Infinite Scroll Spinner --- */
      #scroll-loader { grid-column: 1/-1; text-align: center; padding: 20px; display: none; }
      .small-spinner { width: 25px; height: 25px; border: 3px solid #eee; border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }

      /* ===============================
         NEW LIGHT THEME DETAILS PAGE 
      =============================== */
      #playerModal { 
          display: none; position: fixed; top:0; left:0; width:100%; height:100%; 
          background: var(--bg-card); /* White background */
          z-index:200; overflow-y: auto; overscroll-behavior: contain; 
      }
      
      /* Header with dark icons for light background */
      .details-header { 
          position: sticky; top: 0; left: 0; width: 100%; padding: 10px 15px; 
          display: flex; justify-content: space-between; z-index: 20; 
          background: rgba(255,255,255,0.9); backdrop-filter: blur(5px);
          border-bottom: 1px solid var(--border-color);
      }
      .details-header button { 
          background: transparent; border: none; color: var(--text-main); 
          width: 40px; height: 40px; border-radius: 50%; font-size: 22px; 
          display: flex; align-items: center; justify-content: center; cursor: pointer; 
      }

      /* Content Body - Removed Backdrop */
      .modal-body-content { padding: 25px 20px; }

      /* New Top Section: Side-by-Side Layout */
      .top-info-section { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 25px; }
      
      /* Sidebar Poster */
      .poster-img-sidebar { 
          width: 130px; height: 195px; border-radius: 12px; object-fit: cover; 
          box-shadow: 0 5px 15px rgba(0,0,0,0.15); flex-shrink: 0; background: #eee; 
      }
      
      /* Sidebar Metadata */
      .meta-col-sidebar { flex: 1; display: flex; flex-direction: column; justify-content: center; }
      .movie-title { font-size: 22px; font-weight: bold; color: var(--text-main); margin: 0 0 10px 0; line-height: 1.3; }
      .stats-row { display: flex; align-items: center; gap: 15px; color: var(--text-sec); font-size: 13px; margin-bottom: 12px; font-weight: 500; }
      .stats-item { display: flex; align-items: center; gap: 5px; }
      .genre-row { display: flex; flex-wrap: wrap; gap: 8px; }
      .genre-tag { background: #f1f3f5; color: var(--text-sec); font-size: 11px; padding: 5px 12px; border-radius: 15px; font-weight: 600; }

      /* Buttons - Stacked like example */
      .actions-container { display: flex; flex-direction: column; gap: 12px; margin-bottom: 25px; }
      .action-btn { 
          width: 100%; padding: 15px; border-radius: 12px; border: none; 
          font-weight: bold; font-size: 16px; cursor: pointer; 
          display: flex; align-items: center; justify-content: center; gap: 10px;
          color: white; font-family: inherit; transition: transform 0.1s;
      }
      .action-btn:active { transform: scale(0.98); }
      .btn-play { background: var(--primary); box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3); }
      .btn-dl { background: transparent; border: 2px solid var(--primary); color: var(--primary); }

      /* Description text */
      .desc-text { color: var(--text-main); font-size: 15px; line-height: 1.7; margin-bottom: 30px; }

      /* Video Player Overlay (Dark) */
      .video-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: black; z-index: 300; display: none; flex-direction: column; }
      .video-wrapper { width: 100%; aspect-ratio: 16/9; background: black; margin: auto 0; position: relative; }
      video { width: 100%; height: 100%; }
      .close-video-btn { position: absolute; top: 20px; right: 20px; color: white; background: rgba(0,0,0,0.5); border: none; padding: 10px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; z-index: 310; }
      
      .fallback-box { position:absolute; top:0; left:0; width:100%; height:100%; background:#000; display:none; flex-direction:column; align-items:center; justify-content:center; z-index:20; }
      .big-play-btn { width: 70px; height: 70px; border-radius: 50%; background: rgba(0, 184, 148, 0.9); display: flex; align-items: center; justify-content: center; font-size: 30px; color: white; cursor: pointer; box-shadow: 0 0 20px rgba(0, 184, 148, 0.5); animation: pulse 2s infinite; }
      @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }

      /* Episodes (Light Theme) */
      .accordion { background-color: #f8f9fa; color: var(--text-main); padding: 15px; width: 100%; border: none; text-align: left; font-weight: 700; border-bottom: 1px solid var(--border-color); margin-top: 8px; border-radius: 8px; display: flex; justify-content: space-between; font-family: inherit; }
      .panel { padding: 0 5px; background-color: #ffffff; max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
      .episode-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 10px; padding: 15px 5px; }
      .ep-btn { background: #f1f3f5; border: 1px solid var(--border-color); color: var(--text-main); padding: 12px 5px; cursor: pointer; border-radius: 8px; font-size: 13px; font-weight: 600; }
      .ep-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
      
      /* Skeleton (Light Theme) */
      .skeleton-card { background: transparent; pointer-events: none; }
      .skeleton { animation: shimmer 2s infinite linear; background: linear-gradient(to right, #eee 4%, #ddd 25%, #eee 36%); background-size: 1000px 100%; border-radius: 6px; }
      .poster-ratio { width: 100%; aspect-ratio: 2/3; margin-bottom: 8px; }
      .text-line { height: 12px; border-radius: 4px; }
      @keyframes shimmer { 0% { background-position: -500px 0; } 100% { background-position: 500px 0; } }
    </style>
  </head>
  <body>

    <div id="custom-alert" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:10000; align-items:center; justify-content:center;">
        <div style="background:var(--bg-card); padding:30px; border-radius:12px; text-align:center; width:80%; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 id="alert-title" style="color:var(--text-main);"></h3><p id="alert-msg" style="color:var(--text-sec);"></p>
            <button onclick="document.getElementById('custom-alert').style.display='none'" class="auth-btn">OK</button>
        </div>
    </div>
    <div id="global-loader"><div class="spinner"></div></div>

    <header>
      <div class="brand" onclick="goHome()">Stream X</div>
      <div class="search-box"><input type="text" id="searchInput" class="search-input" placeholder="Search..." onkeypress="handleSearchKey(event)"><button class="icon-btn" onclick="executeSearch()">🔍</button></div>
      <button class="icon-btn" onclick="toggleUserPanel()">👤</button>
    </header>

    <div id="userPanel" class="user-panel">
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;"><h3 style="margin:0;">Account</h3><button class="icon-btn" onclick="toggleUserPanel()" style="color:var(--text-main);">✕</button></div>
        <div id="loginForm">
            <input type="text" id="reg_user" class="auth-input" placeholder="Username">
            <input type="password" id="reg_pass" class="auth-input" placeholder="Password">
            <button class="auth-btn" onclick="doLogin()">Log In</button><button class="auth-btn secondary" onclick="doRegister()">Register</button>
        </div>
        <div id="profileView" style="display:none;">
            <h3 id="u_name">User</h3>
            <p id="u_status" style="color:var(--text-sec); font-size:13px;">Free Plan</p>
            <div style="display:flex; gap:8px; margin-top:10px;"><input type="text" id="vip_code" class="auth-input" style="margin:0;" placeholder="Code"><button class="auth-btn" style="margin:0; width:auto;" onclick="doRedeem()">Go</button></div>
            <button class="auth-btn secondary" onclick="openFavorites(); toggleUserPanel();">❤️ My List</button>
            <button class="auth-btn secondary" onclick="doLogout()" style="color:#ff4b55; border-color:#ff4b55;">Log Out</button>
        </div>
    </div>

    <div id="homeView">
        <div class="home-section"><div class="section-head"><span class="section-title">Movies</span><a class="see-more" onclick="openCategory('movies')">See All</a></div><div class="scroll-row" id="row_movies">${getServerSkeleton()}</div></div>
        <div class="home-section"><div class="section-head"><span class="section-title">Series</span><a class="see-more" onclick="openCategory('series')">See All</a></div><div class="scroll-row" id="row_series">${getServerSkeleton()}</div></div>
        <div class="home-section"><div class="section-head"><span class="section-title">Adult</span><a class="see-more" onclick="openCategory('Adult')">See All</a></div><div class="scroll-row" id="row_18">${getServerSkeleton()}</div></div>
    </div>

    <div class="back-nav" id="backNav">
        <button class="back-nav-btn" onclick="goHome()">⬅</button>
        <span id="gridTitle" style="color:var(--text-main); font-weight:bold; margin-left:10px;">MOVIES</span>
    </div>
    <div class="container" id="gridViewContainer">
        <div class="grid" id="mainGrid"></div>
        <div id="scroll-loader"><div class="small-spinner"></div></div>
        <div style="height:50px;"></div>
    </div>

    <div id="playerModal">
      <div class="details-header">
        <button onclick="closePlayer()">⬅</button>
        <button id="favBtn" onclick="toggleFavorite()">🤍</button>
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
              <button class="action-btn btn-play" onclick="launchVideo()">
                  ▶ Play Video
              </button>
              <a id="dt_dl_link" href="#" target="_blank" class="action-btn btn-dl">
                  ⬇ Download
              </a>
          </div>

          <div class="desc-text">
              <span id="dt_desc"></span>
          </div>

          <div id="ep_section"></div>
          <div style="height:50px;"></div>
      </div>

      <div id="videoOverlay" class="video-overlay">
         <button class="close-video-btn" onclick="closeVideo()">✕ Close</button>
         <div class="video-wrapper">
            <div id="vip-lock" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:#000; align-items:center; justify-content:center; flex-direction:column; z-index:10;">
                <div style="font-size:40px;">👑</div><p style="color:#ffd700;">VIP Required</p>
                <button class="auth-btn" style="width:auto; padding:8px 20px;" onclick="closeVideo(); toggleUserPanel();">Unlock</button>
            </div>
            
            <div id="fallback-box" class="fallback-box">
                <div class="big-play-btn" onclick="openExternalLink()">▶</div>
                <p style="color:#aaa; margin-top:15px; font-size:12px;">Tap to Start Video</p>
            </div>

            <video id="video" controls playsinline controlsList="nodownload"></video>
         </div>
      </div>

    </div>

    <script>
      let currentUser = JSON.parse(localStorage.getItem('user_session') || 'null');
      let currentMovieId = "";
      let activeVideoLink = ""; 
      let activeIsPremium = false;
      
      let currentCat = '';
      let pageNum = 1;
      let isLoading = false;
      let hasMore = true;

      const loader = document.getElementById('global-loader');
      function showLoader() { loader.classList.remove('hidden-loader'); }
      function hideLoader() { loader.classList.add('hidden-loader'); }
      function showAlert(t, m) { document.getElementById('custom-alert').style.display='flex'; document.getElementById('alert-title').innerText=t; document.getElementById('alert-msg').innerText=m; }

      window.onload = async () => {
        loadSession(); updateProfileUI(); 
        await Promise.all([fetchRow('movies', 'row_movies'), fetchRow('series', 'row_series'), fetchRow('Adult', 'row_18')]);
        hideLoader();
        
        const p = new URLSearchParams(window.location.search);
        const movieId = p.get('id');
        const view = p.get('view');
        const cat = p.get('cat');
        
        if (movieId) {
             fetchSingleMovie(movieId);
        } else if (view === 'grid' && cat) {
             openCategory(cat); 
        }
        
        window.addEventListener('scroll', () => {
            if(document.getElementById('gridViewContainer').style.display === 'block') {
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
                    if(!isLoading && hasMore) {
                        pageNum++;
                        fetchMovies(pageNum, currentCat, true);
                    }
                }
            }
        });
      };

      window.onpopstate = function() {
          const p = new URLSearchParams(window.location.search);
          if(!p.get('id')) closePlayerInternal();
          if(!p.get('view')) {
              goHomeInternal();
          } else {
              const cat = p.get('cat');
              if(cat) openCategory(cat, false);
          }
      };

      function goHome(){ 
          const u = window.location.pathname;
          window.history.pushState({path:u},'',u);
          goHomeInternal(); 
      }
      function goHomeInternal(){
          document.getElementById('homeView').style.display='block';
          document.getElementById('gridViewContainer').style.display='none';
          document.getElementById('backNav').style.display='none';
      }
      
      async function openCategory(c, pushState = true){
          currentCat = c;
          pageNum = 1;
          hasMore = true;
          document.getElementById('mainGrid').innerHTML = ""; 
          
          showLoader(); 
          document.getElementById('homeView').style.display='none';
          document.getElementById('gridViewContainer').style.display='block';
          document.getElementById('backNav').style.display='flex'; 
          document.getElementById('gridTitle').innerText = c.toUpperCase();
          
          if(pushState) {
              const u = \`?view=grid&cat=\${encodeURIComponent(c)}\`;
              window.history.pushState({path:u},'',u);
          }
          await fetchMovies(1,c, true); 
          hideLoader();
      }

      function closePlayer() {
          closePlayerInternal();
          const p = new URLSearchParams(window.location.search);
          const cat = p.get('cat');
          if(cat) {
              const u = \`?view=grid&cat=\${encodeURIComponent(cat)}\`;
              window.history.pushState({path:u},'',u);
          } else {
              window.history.pushState(null, '', window.location.pathname);
          }
      }
      function closePlayerInternal(){
          closeVideo();
          document.getElementById('playerModal').style.display='none';
      }

      function launchVideo() {
          if(!activeVideoLink) return showAlert("Error", "No video source");
          if(activeIsPremium && (!currentUser || currentUser.vipExpiry < Date.now())) {
             document.getElementById('videoOverlay').style.display='flex';
             document.getElementById('vip-lock').style.display='flex';
             document.getElementById('video').style.display='none';
             return;
          }
          document.getElementById('videoOverlay').style.display='flex';
          document.getElementById('vip-lock').style.display='none';
          document.getElementById('fallback-box').style.display='none';
          document.getElementById('video').style.display='block';
          playViaSecureToken(activeVideoLink);
      }
      
      function closeVideo() {
          const v = document.getElementById('video'); v.pause(); v.src="";
          if(window.hlsInstance) { window.hlsInstance.destroy(); window.hlsInstance = null; }
          document.getElementById('videoOverlay').style.display='none';
      }
      
      function openExternalLink() {
          if(activeVideoLink) window.open(activeVideoLink, '_blank');
      }
      
      async function playViaSecureToken(u){
          const v=document.getElementById('video');
          const onFail = () => {
              v.style.display = 'none';
              document.getElementById('fallback-box').style.display = 'flex'; 
          };

          if(u.includes('.m3u8')){
             if(Hls.isSupported()){
                 if(window.hlsInstance) window.hlsInstance.destroy();
                 const h=new Hls();
                 window.hlsInstance = h;
                 h.loadSource(u); 
                 h.attachMedia(v); 
                 h.on(Hls.Events.MANIFEST_PARSED,()=>v.play().catch(onFail));
                 h.on(Hls.Events.ERROR, (event, data) => {
                     if(data.fatal) {
                         h.destroy();
                         onFail(); 
                     }
                 });
             } else if (v.canPlayType('application/vnd.apple.mpegurl')) {
                 v.src=u; 
                 v.play().catch(onFail);
                 v.onerror = onFail;
             } else {
                 onFail();
             }
             return;
          }
          try{
             const res=await fetch('/api/sign_url',{method:'POST',body:JSON.stringify({url:u,movieId:currentMovieId,username:currentUser?currentUser.username:null})});
             const j=await res.json();
             if(j.token){ v.src="/api/play?t="+j.token; v.play().catch(onFail); v.onerror=onFail; } else { v.src=u; v.onerror=onFail; }
          }catch(e){ v.src=u; v.onerror=onFail; }
      }

      async function fetchMovies(page, cat, append = false) { 
          if(isLoading) return;
          isLoading = true;
          if(page > 1) document.getElementById('scroll-loader').style.display = 'block';

          try {
              const res = await fetch(\`/api/movies?page=\${page}&cat=\${encodeURIComponent(cat)}\`); 
              const json = await res.json(); 
              
              if(json.data.length === 0) {
                  hasMore = false;
              } else {
                  const html = json.data.map(m => createCardHtml(m)).join('');
                  if(append) {
                      document.getElementById('mainGrid').innerHTML += html;
                  } else {
                      document.getElementById('mainGrid').innerHTML = html;
                  }
              }
          } catch(e) { console.error(e); }
          
          isLoading = false;
          document.getElementById('scroll-loader').style.display = 'none';
      }
      
      async function fetchRow(c,id){try{const res=await fetch(\`/api/movies?page=1&cat=\${encodeURIComponent(c)}\`);const json=await res.json();document.getElementById(id).innerHTML=json.data.slice(0,10).map(m=>createCardHtml(m)).join('');}catch(e){}}

      function createCardHtml(m) { 
          const tag = m.isPremium ? '<div class="prem-tag">VIP</div>' : '';
          const yearNum = (m.tags && m.tags.find(t => /^\\d{4}$/.test(t))) || ''; 
          const yearHtml = yearNum ? \`<div class="year-tag">\${yearNum}</div>\` : '';
          return \`<div class="card" onclick="openModalById('\${m.id}')"><img src="\${m.image}" loading="lazy">\${tag}\${yearHtml}<div class="title">\${m.title}</div></div>\`; 
      }

      function openModalById(id) {
          fetchSingleMovie(id);
          const u = \`?id=\${id}\`; window.history.pushState({path:u},'',u);
      }

      function resetDetailsUI() {
           const spacer = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
           // Removed backdrop reset
           document.getElementById('dt_poster').src = spacer;
           document.getElementById('dt_title').innerText = "Loading...";
           document.getElementById('dt_year').innerText = "...";
           document.getElementById('dt_desc').innerText = "";
           document.getElementById('dt_genres').innerHTML = "";
           document.getElementById('ep_section').innerHTML = "";
      }

      async function fetchSingleMovie(id){
          showLoader(); 
          resetDetailsUI(); 
          document.getElementById('playerModal').style.display='block';
          const res=await fetch(\`/api/get_movie?id=\${id}\`); const m=await res.json();
          hideLoader();
          if(m&&m.title) setupDetailsPage(m);
      }

      function setupDetailsPage(m){
          currentMovieId=m.id;
          
          // Removed backdrop loading logic
          document.getElementById('dt_poster').src = m.image;
          document.getElementById('dt_title').innerText = m.title;
          document.getElementById('dt_desc').innerText = m.description || "No description available.";
          
          const year = (m.tags && m.tags.find(t => /^\\d{4}$/.test(t))) || "N/A";
          document.getElementById('dt_year').innerText = year;
          
          if(m.tags) {
              document.getElementById('dt_genres').innerHTML = m.tags.filter(t => !/^\\d{4}$/.test(t)).map(t=>\`<span class="genre-tag">\${t}</span>\`).join('');
          }

          const dlBtn = document.getElementById('dt_dl_link');
          if(m.downloadLink) {
              dlBtn.href = m.downloadLink; dlBtn.style.display = "flex";
          } else {
              dlBtn.style.display = "none";
          }

          const epSec = document.getElementById('ep_section');
          epSec.innerHTML = "";
          
          if(!m.episodes || m.episodes.length <= 1) {
              const link = (m.episodes && m.episodes[0]) ? m.episodes[0].link : m.link;
              activeVideoLink = link;
              activeIsPremium = m.isPremium;
          } else {
              activeVideoLink = m.episodes[0].link; 
              activeIsPremium = m.isPremium;
              renderAccordion(m.episodes, m.isPremium);
          }
          updateFavBtnState();
      }

      function renderAccordion(episodes, isPremium) { 
        const container = document.getElementById('ep_section'); 
        const seasons = {}; 
        episodes.forEach(ep => { 
            let g = "Episodes"; 
            if(ep.label.includes("Season")) g = ep.label.split(" ")[0] + " " + ep.label.split(" ")[1];
            if(!seasons[g]) seasons[g] = []; seasons[g].push(ep); 
        }); 
        Object.keys(seasons).forEach(key => { 
            const btn = document.createElement('button'); btn.className = "accordion"; btn.innerHTML = key + ' <span>▼</span>'; 
            const panel = document.createElement('div'); panel.className = "panel"; 
            const grid = document.createElement('div'); grid.className = "episode-grid"; 
            grid.innerHTML = seasons[key].map(ep => \`<button class="ep-btn" onclick="switchEpisode(this, '\${ep.link}', \${isPremium})">\${ep.label.replace(key,'').trim() || ep.label}</button>\`).join(''); 
            panel.appendChild(grid); container.appendChild(btn); container.appendChild(panel); 
            btn.onclick = () => { panel.style.maxHeight = panel.style.maxHeight ? null : "400px"; }; 
        }); 
      }

      window.switchEpisode = function(btn, link, isPrem) {
          document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeVideoLink = link;
          activeIsPremium = isPrem;
          launchVideo();
      }

      function toggleFavorite(){
          if(!currentMovieId)return; 
          let f=JSON.parse(localStorage.getItem('my_favs')||'[]'); 
          if(f.includes(currentMovieId))f=f.filter(x=>x!==currentMovieId); else f.push(currentMovieId); 
          localStorage.setItem('my_favs',JSON.stringify(f)); updateFavBtnState();
      }
      function updateFavBtnState(){
          const f=JSON.parse(localStorage.getItem('my_favs')||'[]'); 
          document.getElementById('favBtn').innerText=f.includes(currentMovieId)?"❤️":"🤍";
      }

      function loadSession(){const s=localStorage.getItem('user_session');if(s) currentUser=JSON.parse(s);}
      function toggleUserPanel(){document.getElementById('userPanel').classList.toggle('open');}
      
      function updateProfileUI(){
         if(currentUser){
            document.getElementById('loginForm').style.display='none'; document.getElementById('profileView').style.display='block';
            document.getElementById('u_name').innerText=currentUser.username;
            if(currentUser.vipExpiry > Date.now()) {
                const d = new Date(currentUser.vipExpiry);
                const dStr = d.getDate().toString().padStart(2,'0') + "/" + (d.getMonth()+1).toString().padStart(2,'0') + "/" + d.getFullYear();
                document.getElementById('u_status').innerHTML = '<span style="color:#ffd700">VIP Until: ' + dStr + '</span>';
            } else {
                document.getElementById('u_status').innerText = "Free Plan";
            }
         } else {
            document.getElementById('loginForm').style.display='block'; document.getElementById('profileView').style.display='none';
         }
      }
      async function doRegister(){const u=document.getElementById('reg_user').value,p=document.getElementById('reg_pass').value; if(!u||!p)return; showLoader(); await fetch('/api/auth/register',{method:'POST',body:JSON.stringify({username:u,password:p})}); hideLoader(); showAlert("Success","Created");}
      async function doLogin(){const u=document.getElementById('reg_user').value,p=document.getElementById('reg_pass').value; showLoader(); const res=await fetch('/api/auth/login',{method:'POST',body:JSON.stringify({username:u,password:p})}); hideLoader(); if(res.ok){ const user=await res.json(); user.vipExpiry=user.vipExpiry||0; currentUser=user; localStorage.setItem('user_session',JSON.stringify(user)); updateProfileUI(); } else showAlert("Error","Fail");}
      function doLogout(){localStorage.removeItem('user_session'); currentUser=null; updateProfileUI();}
      async function doRedeem(){const c=document.getElementById('vip_code').value; showLoader(); const res=await fetch('/api/auth/redeem',{method:'POST',body:JSON.stringify({username:currentUser.username,code:c})}); hideLoader(); if(res.ok){const u=await res.json(); currentUser=u; localStorage.setItem('user_session',JSON.stringify(u)); updateProfileUI(); showAlert("Success","VIP Added");}}
      async function openFavorites(){document.getElementById('homeView').style.display='none';document.getElementById('gridViewContainer').style.display='block';document.getElementById('backNav').style.display='flex'; document.getElementById('gridTitle').innerText = "MY LIST"; const f=JSON.parse(localStorage.getItem('my_favs')||'[]'); if(f.length){const res=await Promise.all(f.map(id=>fetch(\`/api/get_movie?id=\${id}\`).then(r=>r.json()))); renderGrid(res);} else document.getElementById('mainGrid').innerHTML="Empty";}
      async function executeSearch(){const q=document.getElementById('searchInput').value; if(!q)return; openCategory('search'); document.getElementById('gridTitle').innerText = "SEARCH"; const res=await fetch(\`/api/search?q=\${q}\`); const j=await res.json(); renderGrid(j);}
      function handleSearchKey(e){if(e.key==='Enter')executeSearch();}
    </script>
  </body>
  </html>
  `;
}
