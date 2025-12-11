export function renderWebsite() {
  function getServerSkeleton() { return Array(6).fill('<div class="card skeleton" style="min-width:110px; height:160px;"></div>').join(''); }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Stream App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <style>
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      body { background: #121212; color: #e0e0e0; font-family: 'Segoe UI', sans-serif; margin:0; padding-bottom: 60px; user-select: none; overflow-x: hidden; }
      
      header { background: rgba(18, 18, 18, 0.98); backdrop-filter: blur(10px); padding: 12px 15px; position: sticky; top:0; z-index:50; border-bottom: 1px solid #333; display:flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
      .brand { color: #e50914; font-weight: 900; font-size: 22px; text-decoration: none; cursor:pointer; }
      .search-box { display: flex; align-items: center; background: #222; border: 1px solid #444; border-radius: 25px; padding: 5px 12px; width: 50%; max-width: 200px; }
      .search-input { background: transparent; border: none; color: white; outline: none; width: 100%; font-size: 14px; }
      .icon-btn { background: none; border: none; color: white; font-size: 22px; cursor: pointer; padding: 5px; }

      /* Loader */
      #global-loader { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #121212; z-index: 9999; display: flex; justify-content: center; align-items: center; transition: opacity 0.3s; }
      .spinner { width: 40px; height: 40px; border: 4px solid #333; border-top: 4px solid #e50914; border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .hidden-loader { opacity: 0; pointer-events: none; }

      /* Sidebar & Auth */
      .user-panel { position: fixed; top: 0; right: 0; width: 280px; height: 100%; background: #1a1a1a; z-index: 100; transform: translateX(100%); transition: transform 0.3s ease; padding: 20px; box-shadow: -5px 0 20px rgba(0,0,0,0.7); display: flex; flex-direction: column; }
      .user-panel.open { transform: translateX(0); }
      .auth-input { width: 100%; padding: 12px; margin: 8px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 8px; outline: none; }
      .auth-btn { width: 100%; padding: 12px; background: #e50914; color: white; border: none; font-weight: bold; cursor: pointer; border-radius: 8px; margin-top: 10px; }
      .auth-btn.secondary { background: #333; margin-top: 5px; }

      /* Home */
      .home-section { padding: 20px 0 5px 15px; }
      .section-head { display: flex; justify-content: space-between; align-items: center; padding-right: 15px; margin-bottom: 12px; }
      .section-title { color: #fff; font-size: 16px; font-weight: 700; border-left: 4px solid #e50914; padding-left: 10px; }
      .see-more { color: #aaa; font-size: 12px; cursor: pointer; font-weight: 600; text-decoration: none; }
      .scroll-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 15px; scroll-behavior: smooth; }
      .scroll-row::-webkit-scrollbar { display: none; } 
      .scroll-row .card { min-width: 115px; max-width: 115px; }

      /* Grid */
      .container { max-width: 1200px; margin: 0 auto; padding: 15px; display: none; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      @media (min-width: 600px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 15px; } }
      .card { background: #1f1f1f; border-radius: 8px; overflow: hidden; cursor: pointer; position: relative; transition: transform 0.2s; }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; display: block; }
      .title { padding: 8px 5px; font-size: 11px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ddd; }
      .prem-tag { position: absolute; top: 0; left: 0; background: #ffd700; color: #000; font-size: 9px; font-weight: bold; padding: 2px 6px; border-bottom-right-radius: 6px; z-index: 2; }
      
      .back-nav { display: none; padding: 10px 15px; align-items: center; gap: 10px; background: #121212; position: sticky; top: 59px; z-index: 40; border-bottom: 1px solid #222; }
      .back-btn { background: #333; color: white; border: none; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: bold; display: flex; align-items: center; gap: 5px; }

      /* Player */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:black; z-index:200; overflow-y: auto; }
      .modal-content { width: 100%; max-width: 1000px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #111; }
      .video-area { position: sticky; top: 0; z-index: 10; background:black; width: 100%; aspect-ratio: 16/9; position: relative; }
      video { width: 100%; height: 100%; background: black; }
      
      /* 🔥 FIX: VIP Lock Button Style */
      #vip-lock { display: none; position: absolute; top:0; left:0; width:100%; height:100%; background: #000; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; z-index: 25; }
      #vip-lock h2 { color: #ffd700; margin-bottom: 10px; font-size: 24px; }
      .lock-btn { 
          background: #e50914; color: white; border: none; 
          padding: 10px 20px; border-radius: 30px; 
          font-weight: bold; font-size: 14px; cursor: pointer; 
          width: auto; min-width: 150px;
      }

      .info-sec { padding: 20px; }
      .action-row { display: flex; gap: 10px; margin: 15px 0; align-items: center; }
      .fav-btn { background: #222; border: 1px solid #444; color: #ccc; padding: 8px 15px; border-radius: 20px; cursor: pointer; font-size: 12px; }
      .fav-btn.active { color: #e50914; border-color: #e50914; }
      .accordion { background-color: #222; color: #eee; cursor: pointer; padding: 14px; width: 100%; border: none; text-align: left; outline: none; font-size: 15px; font-weight: bold; border-bottom: 1px solid #333; display: flex; justify-content: space-between; margin-top: 5px; border-radius: 6px; }
      .accordion.active { background-color: #333; color: #e50914; }
      .panel { padding: 0 5px; background-color: #151515; max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
      .episode-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 8px; padding: 15px 5px; }
      .ep-btn { background: #2a2a2a; border: 1px solid #444; color: #ddd; padding: 10px 5px; cursor: pointer; border-radius: 4px; font-size: 12px; text-align: center; }
      .ep-btn.active { background: #e50914; color: white; border-color: #e50914; font-weight: bold; }
      
      .player-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 15px; box-sizing: border-box; transition: opacity 0.3s; pointer-events: none; background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent 30%, transparent 70%, rgba(0,0,0,0.6)); }
      .ctrl-btn { pointer-events: auto; background: rgba(30,30,30,0.6); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold; }
      .top-controls { display: flex; justify-content: flex-end; }
      .bottom-controls { display: flex; justify-content: flex-end; gap: 10px; }
      .cover-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; }
      .play-btn-circle { width: 60px; height: 60px; background: rgba(229, 9, 20, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
      .play-btn-circle::after { content: '▶'; color: white; font-size: 24px; margin-left: 4px; }
      
      #error-msg { display:none; position:absolute; top:0; left:0; width:100%; height:100%; background: #000; flex-direction: column; align-items: center; justify-content: center; z-index: 15; }
      .retry-btn { background: #333; border: 1px solid #555; color: white; padding: 10px 20px; border-radius: 30px; cursor: pointer; font-weight: bold; text-decoration: none; }
      
      @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
      .skeleton { animation: shimmer 2s infinite linear; background: linear-gradient(to right, #222 4%, #333 25%, #222 36%); background-size: 1000px 100%; border-radius: 6px; }
    </style>
  </head>
  <body>

    <div id="global-loader"><div class="spinner"></div></div>

    <header>
      <div class="brand" onclick="goHome()">MY APP</div>
      <div class="search-box"><input type="text" id="searchInput" class="search-input" placeholder="Search..." onkeypress="handleSearchKey(event)"><button class="icon-btn" onclick="executeSearch()">🔍</button></div>
      <button class="icon-btn" onclick="toggleUserPanel()">👤</button>
    </header>

    <div id="userPanel" class="user-panel">
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;"><h3 style="margin:0; color:#fff;">Account</h3><button class="icon-btn" onclick="toggleUserPanel()">✕</button></div>
        <div id="loginForm">
            <input type="text" id="reg_user" class="auth-input" placeholder="Username">
            <input type="password" id="reg_pass" class="auth-input" placeholder="Password">
            <div style="margin:10px 0; display:flex; align-items:center;"><input type="checkbox" id="rememberMe" style="width:auto; margin-right:8px;"><label for="rememberMe" style="color:#aaa; font-size:13px;">Remember me</label></div>
            <button class="auth-btn" onclick="doLogin()">Login</button><button class="auth-btn secondary" onclick="doRegister()">Register</button>
        </div>
        <div id="profileView" style="display:none;">
            <h3 id="u_name" style="color:#e50914;">User</h3>
            <p id="u_status" style="margin:5px 0;">Free Plan</p>
            <input type="text" id="vip_code" class="auth-input" placeholder="Redeem Code">
            <button class="auth-btn" onclick="doRedeem()">Redeem</button>
            <button class="auth-btn secondary" onclick="doLogout()">Log Out</button>
        </div>
        <div style="margin-top:auto; text-align:center; padding-top:20px;"><a href="https://t.me/iqowoq" target="_blank" style="color:#0088cc; text-decoration:none;">✈️ Contact Admin</a></div>
    </div>

    <div id="homeView">
        <div class="home-section"><div class="section-head"><span class="section-title">Latest</span><a class="see-more" onclick="openCategory('movies')">More ></a></div><div class="scroll-row" id="row_movies">${getServerSkeleton()}</div></div>
        <div class="home-section"><div class="section-head"><span class="section-title">Series</span><a class="see-more" onclick="openCategory('series')">More ></a></div><div class="scroll-row" id="row_series">${getServerSkeleton()}</div></div>
        <div class="home-section"><div class="section-head"><span class="section-title">18+</span><a class="see-more" onclick="openCategory('18+')">More ></a></div><div class="scroll-row" id="row_18">${getServerSkeleton()}</div></div>
    </div>

    <div class="back-nav" id="backNav"><button class="back-btn" onclick="goHome()">⬅ Back</button><span id="gridTitle" style="color:#ccc; font-weight:bold;"></span></div>
    <div class="container" id="gridViewContainer"><div class="grid" id="mainGrid"></div><div id="scroll-sentinel" style="height:50px;"></div></div>

    <div id="playerModal">
      <div class="modal-content">
        <div class="video-area" id="videoWrapper">
            <div id="coverOverlay" class="cover-overlay" onclick="startPlayback()"><div class="play-btn-circle"></div></div>
            <video id="video" controls playsinline controlsList="nodownload"></video>
            <div id="vip-lock">
                <div style="font-size:40px; margin-bottom:10px;">👑</div>
                <h2 style="color:#ffd700;">Premium</h2>
                <p style="color:#ccc;">VIP subscription required.</p>
                <button class="lock-btn" onclick="closePlayer(); toggleUserPanel();">Login / Redeem</button>
            </div>
            <div id="error-msg"><p>Playback Error</p><a id="fallback-btn" class="retry-btn" target="_blank">▶ Play Original</a></div>
            <div class="player-overlay" id="playerOverlay"><div class="top-controls"><button class="ctrl-btn" onclick="closePlayer()">✕</button></div><div class="bottom-controls"><button class="ctrl-btn" onclick="toggleFullScreen()">⛶</button></div></div>
        </div>
        <div class="info-sec"><h2 id="m_title"></h2><div class="action-row"><button id="favBtn" class="fav-btn" onclick="toggleFavorite()">🤍 Fav</button><div id="dl_area"></div></div><div id="ep_section"></div></div>
      </div>
    </div>

    <script>
      let currentPage = 1, currentCategory = 'all', allMoviesData = [];
      let currentUser = JSON.parse(localStorage.getItem('user_session') || 'null');
      let currentMovieId = "";
      
      // ... (Auth/Loader/Init functions same as before) ...
      // Keeping it short for brevity, paste full logic here
      const loader = document.getElementById('global-loader');
      function showLoader() { loader.classList.remove('hidden-loader'); }
      function hideLoader() { loader.classList.add('hidden-loader'); }
      
      window.onload = async () => {
        loadSession(); updateProfileUI(); await loadHomeData(); hideLoader();
        setupInfiniteScroll(); setupPlayerIdle();
        
        const vid = document.getElementById('video');
        vid.addEventListener('timeupdate', () => { if(vid.currentTime>5 && currentMovieId) localStorage.setItem('watch_'+currentMovieId, vid.currentTime); });
      };

      // 🔥 FIX: Regex for Season Label
      function renderAccordion(episodes, isPremium) {
        const container = document.getElementById('ep_section');
        container.innerHTML = "";
        const seasons = {};
        
        episodes.forEach(ep => {
            let g = "Videos";
            // 🔥 Check if starts with S followed by digit (e.g. S1, S01)
            const match = ep.label.match(/^S(\d+)/i); 
            if(match) {
                // Replace S1 with Season 1
                g = "Season " + match[1];
            } else if(ep.label.toLowerCase().includes('season')) {
                // If it already says "Season 1", extract it or keep it as group
                const m2 = ep.label.match(/Season \d+/i);
                if(m2) g = m2[0];
            } else if(ep.label === 'Movie') g = "Movie";
            
            if(!seasons[g]) seasons[g] = [];
            seasons[g].push(ep);
        });

        Object.keys(seasons).sort().forEach(key => {
            const btn = document.createElement('button');
            btn.className = "accordion";
            btn.innerHTML = key;
            const panel = document.createElement('div');
            panel.className = "panel";
            const grid = document.createElement('div');
            grid.className = "episode-grid";
            
            grid.innerHTML = seasons[key].map(ep => {
                // Cleanup label: Remove the Group Name from the button label
                let clean = ep.label.replace(key, '').trim(); 
                if(!clean) clean = ep.label; // Fallback
                return \`<button class="ep-btn" onclick="switchEpisode(this, '\${ep.link}', \${isPremium})">\${clean}</button>\`;
            }).join('');
            
            panel.appendChild(grid);
            container.appendChild(btn);
            container.appendChild(panel);
            btn.onclick = () => { btn.classList.toggle("active"); if(panel.style.maxHeight) panel.style.maxHeight=null; else panel.style.maxHeight="400px"; };
        });
      }

      // ... (Paste rest of your functions: fetchMovies, auth, player logic here) ...
      // Ensure fetchMovies uses append mode for infinite scroll
      let isLoading = false;
      function setupInfiniteScroll() {
          const sentinel = document.getElementById('scroll-sentinel');
          new IntersectionObserver(e => {
              if(e[0].isIntersecting && !isLoading) fetchMovies(currentPage+1, currentCategory, true);
          }).observe(sentinel);
      }
      
      async function fetchMovies(page, cat, append=false) {
          if(isLoading) return; isLoading = true;
          const res = await fetch(\`/api/movies?page=\${page}&cat=\${encodeURIComponent(cat)}\`);
          const json = await res.json();
          isLoading = false;
          if(json.data.length === 0) return;
          
          if(append) {
              const html = json.data.map(m => createCardHtml(m)).join('');
              document.getElementById('mainGrid').innerHTML += html;
          } else {
              // ... normal load ...
          }
          currentPage = page;
      }
      
      function createCardHtml(m) {
          const tag = m.isPremium ? '<div class="prem-tag">👑</div>' : '';
          return \`<div class="card" onclick="openModalById('\${m.id}')"><img src="\${m.image}" loading="lazy">\${tag}<div class="title">\${m.title}</div></div>\`;
      }
      
      // Function Placeholders to complete the code structure
      function loadSession(){const s=localStorage.getItem('user_session');if(s) currentUser=JSON.parse(s);}
      function updateProfileUI(){/* Logic from previous response */}
      function doLogin(){/* ... */}
      function doRegister(){/* ... */}
      function doRedeem(){/* ... */}
      function doLogout(){/* ... */}
      async function loadHomeData(){await Promise.all([fetchRow('movies','row_movies'),fetchRow('series','row_series'),fetchRow('18+','row_18')]);}
      async function fetchRow(c,id){/* ... */}
      function goHome(){/* ... */}
      function openCategory(c,p){/* ... */}
      function openModalById(id){/* ... */}
      function fetchSingleMovie(id){/* ... */}
      function setupModal(m){/* ... */}
      function switchEpisode(b,l,p){/* ... */}
      function startPlayback(){/* ... */}
      function closePlayer(){document.getElementById('playerModal').style.display='none';document.getElementById('video').pause();}
      function setupPlayerIdle(){/* ... */}
      function toggleFullScreen(){/* ... */}
      function handleSearchKey(e){/* ... */}
      function executeSearch(){/* ... */}
      function toggleUserPanel(){document.getElementById('userPanel').classList.toggle('open');}
      function openFavorites(){/* ... */}
      function toggleFavorite(){/* ... */}
    </script>
  </body>
  </html>
  `;
}
