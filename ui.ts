export function renderWebsite() {
  function getServerSkeleton() { return Array(4).fill('<div class="card skeleton" style="aspect-ratio: 2/3;"></div>').join(''); }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Stream App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Padauk:wght@400;700&display=swap');
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      body { background: #121212; color: #e0e0e0; font-family: 'Padauk', sans-serif; margin:0; padding-bottom: 70px; user-select: none; overflow-x: hidden; }
      
      /* --- HEADER --- */
      header { background: rgba(18, 18, 18, 0.95); backdrop-filter: blur(10px); padding: 10px 15px; position: sticky; top:0; z-index:50; border-bottom: 1px solid #333; display:flex; justify-content: space-between; align-items: center; }
      .brand { color: #e50914; font-weight: 900; font-size: 20px; text-decoration: none; }
      .search-box { display: flex; align-items: center; background: #222; border: 1px solid #444; border-radius: 20px; padding: 5px 10px; width: 45%; }
      .search-input { background: transparent; border: none; color: white; outline: none; width: 100%; font-size: 13px; font-family: 'Padauk', sans-serif; }
      .icon-btn { background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 5px; }

      /* --- 🔥 FIXED: COMPACT BANNER (Announcement Style) --- */
      .hero-banner {
          margin: 10px 15px;
          height: 160px; /* Smaller Height */
          border-radius: 8px;
          background: linear-gradient(to right, #111, transparent), url('https://image.tmdb.org/t/p/w500/mXLOHHc1Zeuwsl4xYKjKh2280oL.jpg') center/cover;
          display: flex; flex-direction: column; justify-content: center; padding: 15px;
          border: 1px solid #333;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      }
      .hero-title { font-size: 18px; font-weight: bold; color: #fff; margin: 0 0 5px 0; text-shadow: 1px 1px 2px black; }
      .hero-desc { font-size: 12px; color: #ddd; max-width: 70%; line-height: 1.4; text-shadow: 1px 1px 2px black; }
      
      /* --- SECTIONS --- */
      .home-section { padding: 15px 0 5px 15px; }
      .section-head { display: flex; justify-content: space-between; align-items: center; padding-right: 15px; margin-bottom: 10px; }
      .section-title { color: #fff; font-size: 15px; font-weight: 700; border-left: 3px solid #e50914; padding-left: 8px; }
      .see-more { color: #aaa; font-size: 11px; cursor: pointer; font-weight: 600; }
      
      .scroll-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; }
      .scroll-row::-webkit-scrollbar { display: none; } 
      .scroll-row .card { min-width: 90px; max-width: 90px; } /* Smaller scroll cards */

      /* --- 🔥 FIXED: 4 COLUMNS GRID --- */
      .container { max-width: 1200px; margin: 0 auto; padding: 10px; display: none; }
      .grid { 
          display: grid; 
          grid-template-columns: repeat(4, 1fr); /* 4 Columns on Phone */
          gap: 6px; /* Tighter gap */
      }
      @media (min-width: 600px) { .grid { grid-template-columns: repeat(6, 1fr); } }

      /* --- CARD DESIGN --- */
      .card { background: #1f1f1f; border-radius: 4px; overflow: hidden; cursor: pointer; position: relative; }
      .card img { width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; }
      .title { padding: 5px; font-size: 10px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ccc; }
      
      .prem-tag { position: absolute; top: 0; left: 0; background: #ffd700; color: #000; font-size: 8px; font-weight: bold; padding: 1px 4px; border-bottom-right-radius: 4px; z-index: 2; }
      .year-tag { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.8); color: #fff; font-size: 8px; font-weight: bold; padding: 1px 3px; border-radius: 2px; z-index: 2; }

      /* --- PLAYER --- */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:black; z-index:200; overflow-y: auto; }
      .modal-content { width: 100%; max-width: 1000px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #111; }
      .video-area { position: sticky; top: 0; z-index: 10; background:black; width: 100%; aspect-ratio: 16/9; position: relative; }
      
      /* 🔥 VIDEO FIX */
      video { width: 100%; height: 100%; background: black; display: block; }
      
      .player-overlay { 
          position: absolute; top: 0; left: 0; width: 100%; height: 50px; 
          display: flex; justify-content: flex-end; align-items: center; 
          padding: 10px; pointer-events: none; 
          background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); z-index: 20;
      }
      .ctrl-btn { pointer-events: auto; background: rgba(255,255,255,0.1); color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-left: 10px; font-size: 16px; backdrop-filter: blur(4px); }
      
      .cover-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 15; }
      .play-btn-circle { width: 50px; height: 50px; background: rgba(229, 9, 20, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(0,0,0,0.5); }
      .play-btn-circle::after { content: '▶'; color: white; font-size: 20px; margin-left: 3px; }

      .info-sec { padding: 15px; }
      #m_title { margin: 0; font-size: 16px; color: white; }
      #m_desc { font-size: 12px; color: #999; margin-top: 10px; line-height: 1.4; }
      
      /* Episode Grid */
      .episode-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; padding: 10px 0; }
      .ep-btn { background: #333; color: #ccc; border: 1px solid #444; padding: 8px 0; text-align: center; border-radius: 4px; font-size: 11px; cursor: pointer; }
      .ep-btn.active { background: #e50914; color: white; border-color: #e50914; }
      
      /* User Panel & Nav */
      .back-nav { display: none; padding: 10px; background: #121212; position: sticky; top: 58px; z-index: 40; border-bottom: 1px solid #222; align-items: center; gap: 10px; }
      .user-panel { position: fixed; top: 0; right: 0; width: 260px; height: 100%; background: #1a1a1a; z-index: 100; transform: translateX(100%); transition: transform 0.3s; padding: 20px; box-shadow: -5px 0 20px rgba(0,0,0,0.8); }
      .user-panel.open { transform: translateX(0); }
      
      /* Loader & Sentinel */
      #global-loader { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #121212; z-index: 9999; display: flex; justify-content: center; align-items: center; transition: opacity 0.3s; }
      .spinner { width: 30px; height: 30px; border: 3px solid #333; border-top: 3px solid #e50914; border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .hidden-loader { opacity: 0; pointer-events: none; }
      #scroll-sentinel { height: 50px; display: flex; justify-content: center; align-items: center; }
      #bottom-spinner { width: 20px; height: 20px; display: none; }
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
        <h3 style="margin-top:0; color:white;">Account</h3>
        <button class="icon-btn" style="position:absolute; top:10px; right:10px;" onclick="toggleUserPanel()">✕</button>
        <div id="loginForm">
            <input type="text" id="reg_user" class="search-input" placeholder="Username" style="border:1px solid #444; padding:10px; width:100%; margin-bottom:10px; border-radius:5px;">
            <input type="password" id="reg_pass" class="search-input" placeholder="Password" style="border:1px solid #444; padding:10px; width:100%; margin-bottom:10px; border-radius:5px;">
            <button onclick="doLogin()" style="width:100%; padding:10px; background:#e50914; color:white; border:none; border-radius:5px;">Login</button>
        </div>
        <div id="profileView" style="display:none;">
            <p style="color:white; font-weight:bold;" id="u_name"></p>
            <p style="color:#e50914; font-size:12px;" id="u_status"></p>
            <button onclick="doLogout()" style="width:100%; padding:10px; background:#333; color:white; border:none; border-radius:5px; margin-top:10px;">Logout</button>
        </div>
    </div>

    <div id="homeView">
        <div class="hero-banner">
            <div class="hero-title">New Arrivals</div>
            <div class="hero-desc">Watch the latest movies and series in HD. Updated daily!</div>
        </div>

        <div class="home-section"><div class="section-head"><span class="section-title">Latest</span><a class="see-more" onclick="openCategory('movies')">More ></a></div><div class="scroll-row" id="row_movies">${getServerSkeleton()}</div></div>
        <div class="home-section"><div class="section-head"><span class="section-title">Series</span><a class="see-more" onclick="openCategory('series')">More ></a></div><div class="scroll-row" id="row_series">${getServerSkeleton()}</div></div>
        <div class="home-section"><div class="section-head"><span class="section-title">Adult</span><a class="see-more" onclick="openCategory('Adult')">More ></a></div><div class="scroll-row" id="row_18">${getServerSkeleton()}</div></div>
    </div>

    <div class="back-nav" id="backNav"><button class="icon-btn" onclick="goHome()">⬅</button><span id="gridTitle" style="color:white; font-weight:bold;"></span></div>
    <div class="container" id="gridViewContainer">
        <div class="grid" id="mainGrid"></div>
        <div id="scroll-sentinel"><div id="bottom-spinner" class="spinner"></div></div>
    </div>

    <div id="playerModal">
      <div class="modal-content">
        <div class="video-area" id="videoWrapper">
            <div id="coverOverlay" class="cover-overlay" onclick="startPlayback()"><div class="play-btn-circle"></div></div>
            
            <video id="video" controls playsinline controlsList="nodownload"></video>
            
            <div class="player-overlay" id="playerOverlay">
                <button class="ctrl-btn" onclick="toggleFullScreen()">⛶</button>
                <button class="ctrl-btn" onclick="closePlayer()">✕</button>
            </div>
        </div>
        
        <div class="info-sec">
          <div id="ep_section"></div>
          
          <h2 id="m_title">Loading...</h2>
          <div id="m_tags" style="display:flex; gap:5px; flex-wrap:wrap; margin:5px 0;"></div>
          <p id="m_desc"></p>
        </div>
      </div>
    </div>

    <script>
      let currentPage = 1, currentCategory = 'all', allMoviesData = [];
      let currentUser = JSON.parse(localStorage.getItem('user_session') || 'null');
      let currentMovieId = "", activeVideoLink = "", activeIsPremium = false;
      let isLoading = false, hasMore = true;

      window.onload = async () => {
        if(currentUser) {
            document.getElementById('loginForm').style.display='none';
            document.getElementById('profileView').style.display='block';
            document.getElementById('u_name').innerText = currentUser.username;
            document.getElementById('u_status').innerText = currentUser.vipExpiry > Date.now() ? "VIP Member" : "Free User";
        }
        
        await Promise.all([fetchRow('movies','row_movies'),fetchRow('series','row_series'),fetchRow('Adult','row_18')]);
        document.getElementById('global-loader').style.display='none';
        
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('id')) fetchSingleMovie(urlParams.get('id'));
        else if (urlParams.get('view') === 'grid') openCategory(urlParams.get('cat') || 'all', false);

        setupInfiniteScroll();
      };

      async function fetchRow(cat, id) {
          try {
              const res = await fetch(\`/api/movies?page=1&cat=\${encodeURIComponent(cat)}\`);
              const json = await res.json();
              document.getElementById(id).innerHTML = json.data.slice(0,10).map(m => createCardHtml(m, true)).join('');
          } catch(e) {}
      }

      function createCardHtml(m, isRow) {
          const tag = m.isPremium ? '<div class="prem-tag">VIP</div>' : '';
          const year = (m.tags && m.tags.find(t => /^\\d{4}$/.test(t))) || '';
          const yTag = year ? \`<div class="year-tag">\${year}</div>\` : '';
          // 🔥 FIX: Small card for ScrollRow, Normal for Grid
          const style = isRow ? 'min-width:100px; max-width:100px;' : ''; 
          return \`<div class="card" style="\${style}" onclick="openModalById('\${m.id}')">
              <img src="\${m.image}" loading="lazy" onerror="this.src='https://via.placeholder.com/150x225'">
              \${tag}\${yTag}
              <div class="title">\${m.title}</div>
          </div>\`;
      }

      function openCategory(cat, push=true) {
          if(cat.trim()==='18'||cat.includes('18 ')) cat='Adult';
          currentCategory=cat;
          document.getElementById('homeView').style.display='none';
          document.getElementById('gridViewContainer').style.display='block';
          document.getElementById('backNav').style.display='flex';
          document.getElementById('gridTitle').innerText=cat.toUpperCase();
          if(push) window.history.pushState({},'',\`?view=grid&cat=\${encodeURIComponent(cat)}\`);
          
          document.getElementById('mainGrid').innerHTML="";
          currentPage=1; hasMore=true;
          fetchMovies(1, cat, true);
      }

      async function fetchMovies(page, cat, append) {
          if(isLoading) return; isLoading=true;
          document.getElementById('bottom-spinner').style.display='block';
          const res = await fetch(\`/api/movies?page=\${page}&cat=\${encodeURIComponent(cat)}\`);
          const json = await res.json();
          isLoading=false; document.getElementById('bottom-spinner').style.display='none';
          
          if(json.data.length===0) { hasMore=false; return; }
          allMoviesData = append ? allMoviesData.concat(json.data) : json.data;
          
          const html = json.data.map(m => createCardHtml(m, false)).join('');
          document.getElementById('mainGrid').innerHTML += html;
          currentPage=page;
      }

      function setupInfiniteScroll() {
          new IntersectionObserver(entries => {
              if(entries[0].isIntersecting && !isLoading && hasMore) fetchMovies(currentPage+1, currentCategory, true);
          }).observe(document.getElementById('scroll-sentinel'));
      }

      // --- PLAYER LOGIC ---
      function openModalById(id) {
          const m = allMoviesData.find(x => x.id === id);
          if(m) setupModal(m); else fetchSingleMovie(id);
          const u = new URLSearchParams(window.location.search); u.set('id',id);
          window.history.pushState({},'', window.location.pathname + '?' + u.toString());
      }

      async function fetchSingleMovie(id) {
          document.getElementById('global-loader').style.display='flex';
          const res = await fetch(\`/api/get_movie?id=\${id}\`);
          const m = await res.json();
          document.getElementById('global-loader').style.display='none';
          if(m && m.title) setupModal(m);
      }

      function setupModal(m) {
          currentMovieId = m.id;
          document.getElementById('playerModal').style.display='block';
          document.body.style.overflow='hidden';
          
          // Reset UI
          document.getElementById('m_title').innerText = m.title;
          document.getElementById('m_desc').innerText = m.description || '';
          document.getElementById('coverOverlay').style.backgroundImage = \`url('\${m.cover || m.image}')\`;
          document.getElementById('coverOverlay').style.display='flex';
          document.getElementById('video').style.display='none';
          document.getElementById('video').pause();
          
          // Tags
          if(m.tags) document.getElementById('m_tags').innerHTML = m.tags.map(t=>\`<span style="background:#333; color:#ccc; font-size:10px; padding:2px 6px; border-radius:4px;">\${t}</span>\`).join('');

          // Episodes
          if(!m.episodes || m.episodes.length <= 1) {
              document.getElementById('ep_section').innerHTML = '';
              const link = (m.episodes && m.episodes[0]) ? m.episodes[0].link : m.link;
              setupPlayButton(link, m.isPremium);
          } else {
              renderEpisodes(m.episodes, m.isPremium);
              setupPlayButton(m.episodes[0].link, m.isPremium);
          }
      }

      function setupPlayButton(link, isPrem) {
          activeVideoLink = link; activeIsPremium = isPrem;
      }

      function renderEpisodes(eps, isPrem) {
          let html = "";
          // Simple grouping logic (can be improved)
          html = \`<div class="episode-grid">\${eps.map(e => 
              \`<div class="ep-btn" onclick="playEp(this, '\${e.link}', \${isPrem})">\${e.label}</div>\`
          ).join('')}</div>\`;
          document.getElementById('ep_section').innerHTML = html;
      }
      
      window.playEp = function(btn, link, isPrem) {
          document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          setupPlayButton(link, isPrem);
          startPlayback();
      }

      window.startPlayback = function() {
          // VIP Check
          if(activeIsPremium && (!currentUser || currentUser.vipExpiry < Date.now())) {
              alert("VIP Required!"); return;
          }
          
          const v = document.getElementById('video');
          document.getElementById('coverOverlay').style.display='none';
          v.style.display='block';
          
          if(Hls.isSupported() && activeVideoLink.includes('.m3u8')) {
              const hls = new Hls();
              hls.loadSource(activeVideoLink);
              hls.attachMedia(v);
              hls.on(Hls.Events.MANIFEST_PARSED, () => v.play());
          } else {
              v.src = activeVideoLink;
              v.play();
          }
      }

      function closePlayer() {
          const v = document.getElementById('video');
          v.pause(); v.src = "";
          document.getElementById('playerModal').style.display='none';
          document.body.style.overflow='auto';
          
          const u = new URLSearchParams(window.location.search);
          u.delete('id');
          const newUrl = window.location.pathname + (u.toString() ? '?' + u.toString() : '');
          window.history.pushState({},'',newUrl);
          
          if(u.get('view') === 'grid') document.getElementById('homeView').style.display='none';
          else goHome();
      }
      
      function goHome() {
          document.getElementById('homeView').style.display='block';
          document.getElementById('gridViewContainer').style.display='none';
          document.getElementById('backNav').style.display='none';
          window.scrollTo(0,0);
          window.history.pushState({},'','/');
      }

      function toggleUserPanel() { document.getElementById('userPanel').classList.toggle('open'); }
      function toggleFullScreen() {
           const v = document.getElementById('videoWrapper');
           if(!document.fullscreenElement) v.requestFullscreen(); else document.exitFullscreen();
      }
      // Simplified search & auth for brevity (add back if needed)
      function handleSearchKey(e){ if(e.key==='Enter') alert('Search: '+e.target.value); }
      async function doLogin(){ alert('Login Logic Here'); } 
      function doLogout(){ localStorage.removeItem('user_session'); window.location.reload(); }

    </script>
  </body>
  </html>
  `;
}
