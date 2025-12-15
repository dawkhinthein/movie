export function renderWebsite() {
  function getServerSkeleton() { 
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
    <meta name="theme-color" content="#121212">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Padauk:wght@400;700&display=swap" rel="stylesheet">
    <style>
      :root {
        --primary: #00b894;
        --bg-main: #121212;
        --bg-card: #1e1e1e;
        --text-main: #ffffff;
      }

      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; outline: none; }
      
      html, body { 
          overscroll-behavior-y: none; 
          background: var(--bg-main); 
          color: var(--text-main); 
          font-family: 'Inter', 'Padauk', sans-serif; 
          margin:0; 
          padding-bottom: 70px; 
          user-select: none; /* Text selection off */
          -webkit-user-select: none;
          overflow-x: hidden; 
      }
      
      /* 🔥 FIX: Image Saving Prevention */
      img { 
          pointer-events: none; /* Disables right click/long press context menu on images */
          -webkit-user-drag: none; /* Prevents dragging */
          user-select: none;
      }

      header { 
        background: rgba(18, 18, 18, 0.95); backdrop-filter: blur(10px);
        padding: 15px 20px; position: sticky; top:0; z-index:50; 
        border-bottom: 1px solid rgba(255,255,255,0.1); 
        display:flex; justify-content: space-between; align-items: center; 
      }
      .brand { color: var(--primary); font-weight: 900; font-size: 24px; cursor:pointer; }
      .search-box { display: flex; align-items: center; background: rgba(255,255,255,0.1); border-radius: 50px; padding: 6px 15px; width: 50%; }
      .search-input { background: transparent; border: none; color: white; width: 100%; font-size: 14px; }
      .icon-btn { background: none; border: none; color: white; font-size: 22px; cursor: pointer; padding: 5px; }

      #global-loader { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-main); z-index: 9999; display: flex; justify-content: center; align-items: center; transition: opacity 0.3s; }
      .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .hidden-loader { opacity: 0; pointer-events: none; }

      .home-section { padding: 20px 0 10px 20px; }
      .section-head { display: flex; justify-content: space-between; align-items: center; padding-right: 20px; margin-bottom: 15px; }
      .section-title { color: #fff; font-size: 17px; font-weight: 700; border-left: 3px solid var(--primary); padding-left: 10px; }
      .see-more { color: var(--primary); font-size: 12px; cursor: pointer; font-weight: 600; }
      .scroll-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px; padding-right: 20px; scroll-behavior: smooth; }
      .scroll-row::-webkit-scrollbar { display: none; } 
      
      .card { position: relative; background: var(--bg-card); border-radius: 8px; overflow: hidden; cursor: pointer; }
      .scroll-row .card { min-width: 110px; max-width: 110px; }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; display: block; }
      .title { padding: 8px; font-size: 11px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ddd; }
      .prem-tag { position: absolute; top: 5px; left: 5px; background: #ffd700; color: #000; font-size: 9px; font-weight: 800; padding: 2px 5px; border-radius: 4px; z-index: 2; }

      .user-panel { 
        position: fixed; top: 0; right: 0; width: 300px; height: 100%; 
        background: #1a1a1a; z-index: 100; transform: translateX(100%); 
        transition: transform 0.3s ease; padding: 25px; 
        box-shadow: -10px 0 30px rgba(0,0,0,0.8); display: flex; flex-direction: column; 
      }
      .user-panel.open { transform: translateX(0); }
      .auth-input { width: 100%; padding: 14px; margin: 10px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 8px; }
      .auth-btn { width: 100%; padding: 14px; background: var(--primary); color: white; border: none; font-weight: bold; cursor: pointer; border-radius: 25px; margin-top: 15px; }
      .auth-btn.secondary { background: #333; margin-top: 10px; }

      .container { max-width: 1200px; margin: 0 auto; padding: 15px; display: none; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      @media (min-width: 600px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 15px; } }
      .back-nav { display: none; padding: 10px 20px; align-items: center; background: rgba(18,18,18,0.95); position: sticky; top: 60px; z-index: 40; border-bottom: 1px solid #333; }
      .back-nav-btn { background: none; border: none; color: white; font-size: 24px; cursor: pointer; }

      #playerModal { 
          display: none; position: fixed; top:0; left:0; width:100%; height:100%; 
          background: #121212; z-index:200; overflow-y: auto; overscroll-behavior: contain; 
      }
      
      .details-header { position: absolute; top: 0; left: 0; width: 100%; padding: 15px 20px; display: flex; justify-content: space-between; z-index: 10; pointer-events: none; }
      .details-header button { pointer-events: auto; background: rgba(0,0,0,0.5); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); cursor: pointer; }

      .backdrop-container { position: relative; width: 100%; height: 260px; }
      .backdrop-img { width: 100%; height: 100%; object-fit: cover; mask-image: linear-gradient(to bottom, black 80%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%); }
      
      .info-container { padding: 0 20px; position: relative; display: flex; flex-direction: column; }
      
      .top-info-row { display: flex; gap: 15px; margin-top: -50px; position: relative; z-index: 5; margin-bottom: 20px; }
      .poster-img-large { width: 110px; height: 160px; border-radius: 8px; object-fit: cover; box-shadow: 0 5px 15px rgba(0,0,0,0.6); flex-shrink: 0; background: #222; }
      
      .meta-col { padding-top: 55px; flex: 1; }
      .movie-title { font-size: 20px; font-weight: bold; color: white; margin: 0 0 8px 0; line-height: 1.2; }
      
      .stats-row { display: flex; align-items: center; gap: 15px; color: #bbb; font-size: 12px; margin-bottom: 10px; }
      
      .genre-row { display: flex; flex-wrap: wrap; gap: 5px; }
      .genre-tag { border: 1px solid #444; color: #ccc; font-size: 10px; padding: 4px 10px; border-radius: 20px; }

      .desc-text { color: #ccc; font-size: 14px; line-height: 1.6; margin-bottom: 25px; }

      .actions-container { display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px; }
      .action-btn { width: 100%; padding: 14px; border-radius: 30px; border: none; font-weight: bold; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; color: white; }
      .btn-play { background: var(--primary); box-shadow: 0 4px 15px rgba(0, 184, 148, 0.3); }
      .btn-dl { background: transparent; border: 2px solid var(--primary); color: var(--primary); }

      .video-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: black; z-index: 300; display: none; flex-direction: column; }
      .video-wrapper { width: 100%; aspect-ratio: 16/9; background: black; margin: auto 0; position: relative; }
      video { width: 100%; height: 100%; }
      .close-video-btn { position: absolute; top: 20px; right: 20px; color: white; background: rgba(0,0,0,0.5); border: none; padding: 10px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; z-index: 310; }

      .accordion { background-color: #1e1e1e; color: #eee; padding: 15px; width: 100%; border: none; text-align: left; font-weight: 600; border-bottom: 1px solid #333; margin-top: 8px; border-radius: 8px; display: flex; justify-content: space-between; }
      .panel { padding: 0 5px; background-color: #121212; max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
      .episode-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 10px; padding: 15px 5px; }
      .ep-btn { background: #2a2a2a; border: 1px solid #333; color: #ccc; padding: 10px 5px; cursor: pointer; border-radius: 6px; font-size: 12px; }
      .ep-btn.active { background: var(--primary); color: white; border: none; }
      
      .skeleton-card { background: transparent; pointer-events: none; }
      .skeleton { animation: shimmer 2s infinite linear; background: linear-gradient(to right, #222 4%, #333 25%, #222 36%); background-size: 1000px 100%; border-radius: 6px; }
      .poster-ratio { width: 100%; aspect-ratio: 2/3; margin-bottom: 8px; }
      .text-line { height: 12px; border-radius: 4px; }
      @keyframes shimmer { 0% { background-position: -500px 0; } 100% { background-position: 500px 0; } }
    </style>
  </head>
  <body>

    <div id="custom-alert" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:10000; align-items:center; justify-content:center;">
        <div style="background:#222; padding:30px; border-radius:12px; text-align:center; width:80%;">
            <h3 id="alert-title" style="color:white;"></h3><p id="alert-msg" style="color:#aaa;"></p>
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
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;"><h3 style="margin:0; color:white;">Account</h3><button class="icon-btn" onclick="toggleUserPanel()">✕</button></div>
        <div id="loginForm">
            <input type="text" id="reg_user" class="auth-input" placeholder="Username">
            <input type="password" id="reg_pass" class="auth-input" placeholder="Password">
            <button class="auth-btn" onclick="doLogin()">Log In</button><button class="auth-btn secondary" onclick="doRegister()">Register</button>
        </div>
        <div id="profileView" style="display:none;">
            <h3 id="u_name" style="color:#fff;">User</h3>
            <p id="u_status" style="color:#aaa; font-size:13px;">Free Plan</p>
            <div style="display:flex; gap:8px; margin-top:10px;"><input type="text" id="vip_code" class="auth-input" style="margin:0;" placeholder="Code"><button class="auth-btn" style="margin:0; width:auto;" onclick="doRedeem()">Go</button></div>
            <button class="auth-btn secondary" onclick="openFavorites(); toggleUserPanel();">❤️ My List</button>
            <button class="auth-btn secondary" onclick="doLogout()" style="color:#ff4b55;">Log Out</button>
        </div>
    </div>

    <div id="homeView">
        <div class="home-section"><div class="section-head"><span class="section-title">Movies</span><a class="see-more" onclick="openCategory('movies')">See All</a></div><div class="scroll-row" id="row_movies">${getServerSkeleton()}</div></div>
        <div class="home-section"><div class="section-head"><span class="section-title">Series</span><a class="see-more" onclick="openCategory('series')">See All</a></div><div class="scroll-row" id="row_series">${getServerSkeleton()}</div></div>
        <div class="home-section"><div class="section-head"><span class="section-title">Adult</span><a class="see-more" onclick="openCategory('Adult')">See All</a></div><div class="scroll-row" id="row_18">${getServerSkeleton()}</div></div>
    </div>

    <div class="back-nav" id="backNav">
        <button class="back-nav-btn" onclick="goHome()">⬅</button>
        <span id="gridTitle" style="color:white; font-weight:bold; margin-left:10px;">MOVIES</span>
    </div>
    <div class="container" id="gridViewContainer"><div class="grid" id="mainGrid"></div><div style="height:50px;"></div></div>

    <div id="playerModal">
      <div class="details-header">
        <button onclick="closePlayer()">⬅</button>
        <button id="favBtn" onclick="toggleFavorite()">🤍</button>
      </div>

      <div class="backdrop-container">
        <img id="dt_backdrop" class="backdrop-img" src="">
      </div>

      <div class="info-container">
          <div class="top-info-row">
              <img id="dt_poster" class="poster-img-large" src="">
              <div class="meta-col">
                  <h1 id="dt_title" class="movie-title">Title</h1>
                  <div class="stats-row">
                      <div class="stats-item">⏱ <span id="dt_year">2025</span></div>
                      <div class="stats-item">⭐️ <span id="dt_rate">0.0</span></div>
                  </div>
                  <div id="dt_genres" class="genre-row"></div>
              </div>
          </div>

          <div class="desc-text">
              <span id="dt_desc"></span>
          </div>

          <div class="actions-container">
              <button class="action-btn btn-play" onclick="launchVideo()">
                  ▶ Play Video (Server 1)
              </button>
              <a id="dt_dl_link" href="#" target="_blank" class="action-btn btn-dl">
                  ⬇ Download (Server 1)
              </a>
          </div>

          <div id="ep_section"></div>
          <div style="height:50px;"></div>
      </div>

      <div id="videoOverlay" class="video-overlay">
         <button class="close-video-btn" onclick="closeVideo()">✕ Close Player</button>
         <div class="video-wrapper">
            <div id="vip-lock" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:#000; align-items:center; justify-content:center; flex-direction:column; z-index:10;">
                <div style="font-size:40px;">👑</div><p style="color:#ffd700;">VIP Required</p>
                <button class="auth-btn" style="width:auto; padding:8px 20px;" onclick="closeVideo(); toggleUserPanel();">Unlock</button>
            </div>
            <video id="video" controls playsinline controlsList="nodownload"></video>
         </div>
      </div>

    </div>

    <script>
      let allMoviesData = [];
      let currentUser = JSON.parse(localStorage.getItem('user_session') || 'null');
      let currentMovieId = "";
      let activeVideoLink = ""; 
      let activeIsPremium = false;

      const loader = document.getElementById('global-loader');
      function showLoader() { loader.classList.remove('hidden-loader'); }
      function hideLoader() { loader.classList.add('hidden-loader'); }
      function showAlert(t, m) { document.getElementById('custom-alert').style.display='flex'; document.getElementById('alert-title').innerText=t; document.getElementById('alert-msg').innerText=m; }

      window.onpopstate = function() {
          const p = new URLSearchParams(window.location.search);
          if(!p.get('id')) closePlayerInternal();
          if(!p.get('view')) goHomeInternal();
      };

      window.onload = async () => {
        loadSession(); updateProfileUI(); 
        await Promise.all([fetchRow('movies', 'row_movies'), fetchRow('series', 'row_series'), fetchRow('Adult', 'row_18')]);
        hideLoader();
        const p = new URLSearchParams(window.location.search);
        if(p.get('id')) fetchSingleMovie(p.get('id'));
      };

      // --- Navigation ---
      function goHome(){ goHomeInternal(); }
      function goHomeInternal(){
          document.getElementById('homeView').style.display='block';
          document.getElementById('gridViewContainer').style.display='none';
          document.getElementById('backNav').style.display='none';
      }
      
      // 🔥 FIX: Loading Animation & Title Change
      async function openCategory(c){
          showLoader(); // Start spinner
          
          document.getElementById('homeView').style.display='none';
          document.getElementById('gridViewContainer').style.display='block';
          document.getElementById('backNav').style.display='flex'; 
          
          // Update Title
          document.getElementById('gridTitle').innerText = c.toUpperCase();
          
          // Wait for data then hide loader
          await fetchMovies(1,c);
          hideLoader();
      }

      function closePlayer() {
          closePlayerInternal();
          window.history.pushState(null, '', window.location.pathname);
      }
      function closePlayerInternal(){
          closeVideo();
          document.getElementById('playerModal').style.display='none';
      }

      // --- Video Logic ---
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
          document.getElementById('video').style.display='block';
          playViaSecureToken(activeVideoLink);
      }
      function closeVideo() {
          const v = document.getElementById('video'); v.pause(); v.src="";
          document.getElementById('videoOverlay').style.display='none';
      }
      async function playViaSecureToken(u){
          const v=document.getElementById('video');
          if(u.includes('.m3u8')){
             if(Hls.isSupported()){
                 const h=new Hls(); h.loadSource(u); h.attachMedia(v); h.on(Hls.Events.MANIFEST_PARSED,()=>v.play());
             } else { v.src=u; v.play(); }
             return;
          }
          try{
             const res=await fetch('/api/sign_url',{method:'POST',body:JSON.stringify({url:u,movieId:currentMovieId,username:currentUser?currentUser.username:null})});
             const j=await res.json();
             if(j.token){ v.src="/api/play?t="+j.token; v.play(); } else { v.src=u; }
          }catch(e){ v.src=u; }
      }

      // --- Data Fetching ---
      async function fetchMovies(page, cat) { 
          const res = await fetch(\`/api/movies?page=\${page}&cat=\${encodeURIComponent(cat)}\`); 
          const json = await res.json(); renderGrid(json.data); 
      }
      function renderGrid(data) { document.getElementById('mainGrid').innerHTML = data.map(m => createCardHtml(m)).join(''); }
      function createCardHtml(m) { 
          return \`<div class="card" onclick="openModalById('\${m.id}')"><img src="\${m.image}" loading="lazy"><div class="prem-tag">\${m.isPremium?'VIP':''}</div><div class="title">\${m.title}</div></div>\`; 
      }

      function openModalById(id) {
          fetchSingleMovie(id);
          const u = \`?id=\${id}\`; window.history.pushState({path:u},'',u);
      }

      async function fetchSingleMovie(id){
          showLoader(); 
          document.getElementById('playerModal').style.display='block';
          const res=await fetch(\`/api/get_movie?id=\${id}\`); const m=await res.json();
          hideLoader();
          if(m&&m.title) setupDetailsPage(m);
      }

      function setupDetailsPage(m){
          currentMovieId=m.id;
          
          document.getElementById('dt_backdrop').src = m.cover || m.image;
          document.getElementById('dt_poster').src = m.image;
          document.getElementById('dt_title').innerText = m.title;
          document.getElementById('dt_desc').innerText = m.description || "No description available.";
          
          // 🔥 FIX: Year Display Logic (Finds 4-digit number in tags)
          const year = (m.tags && m.tags.find(t => /^\\d{4}$/.test(t))) || "2025";
          document.getElementById('dt_year').innerText = year;
          document.getElementById('dt_rate').innerText = "8.5"; 
          
          if(m.tags) {
              // Show only non-number tags as genre
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
      
      // 🔥 FIX: VIP Date Display
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
      async function fetchRow(c,id){try{const res=await fetch(\`/api/movies?page=1&cat=\${encodeURIComponent(c)}\`);const json=await res.json();document.getElementById(id).innerHTML=json.data.slice(0,10).map(m=>createCardHtml(m)).join('');}catch(e){}}
      async function openFavorites(){document.getElementById('homeView').style.display='none';document.getElementById('gridViewContainer').style.display='block';document.getElementById('backNav').style.display='flex'; document.getElementById('gridTitle').innerText = "MY LIST"; const f=JSON.parse(localStorage.getItem('my_favs')||'[]'); if(f.length){const res=await Promise.all(f.map(id=>fetch(\`/api/get_movie?id=\${id}\`).then(r=>r.json()))); renderGrid(res);} else document.getElementById('mainGrid').innerHTML="Empty";}
      async function executeSearch(){const q=document.getElementById('searchInput').value; if(!q)return; openCategory('search'); document.getElementById('gridTitle').innerText = "SEARCH"; const res=await fetch(\`/api/search?q=\${q}\`); const j=await res.json(); renderGrid(j);}
      function handleSearchKey(e){if(e.key==='Enter')executeSearch();}
    </script>
  </body>
  </html>
  `;
}
