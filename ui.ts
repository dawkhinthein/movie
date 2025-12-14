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
    <meta name="theme-color" content="#141414">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Padauk:wght@400;700&display=swap" rel="stylesheet">
    <style>
      :root {
        --primary: #E50914;
        --bg-main: #141414;
        --bg-card: #181818;
        --text-main: #ffffff;
        --glass: rgba(20, 20, 20, 0.9);
        --radius: 8px;
      }

      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; outline: none; }
      body { background: var(--bg-main); color: var(--text-main); font-family: 'Inter', 'Padauk', sans-serif; margin:0; padding-bottom: 70px; user-select: none; overflow-x: hidden; }
      
      /* --- Header --- */
      header { 
        background: var(--glass); backdrop-filter: blur(10px);
        padding: 15px 20px; position: sticky; top:0; z-index:50; 
        border-bottom: 1px solid rgba(255,255,255,0.1); 
        display:flex; justify-content: space-between; align-items: center; 
      }
      .brand { color: var(--primary); font-weight: 900; font-size: 24px; cursor:pointer; }
      .search-box { display: flex; align-items: center; background: rgba(255,255,255,0.1); border-radius: 50px; padding: 6px 15px; width: 45%; }
      .search-input { background: transparent; border: none; color: white; width: 100%; font-size: 14px; }
      .icon-btn { background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 5px; }

      /* --- Loader --- */
      #global-loader { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-main); z-index: 9999; display: flex; justify-content: center; align-items: center; transition: opacity 0.3s; }
      .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .hidden-loader { opacity: 0; pointer-events: none; }

      /* --- User Panel --- */
      .user-panel { 
        position: fixed; top: 0; right: 0; width: 300px; height: 100%; 
        background: #1a1a1a; z-index: 100; transform: translateX(100%); 
        transition: transform 0.3s ease; padding: 25px; 
        box-shadow: -10px 0 30px rgba(0,0,0,0.8); display: flex; flex-direction: column; 
      }
      .user-panel.open { transform: translateX(0); }
      .auth-input { width: 100%; padding: 14px; margin: 10px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: var(--radius); }
      .auth-btn { width: 100%; padding: 14px; background: var(--primary); color: white; border: none; font-weight: bold; cursor: pointer; border-radius: var(--radius); margin-top: 15px; }
      .auth-btn.secondary { background: #333; margin-top: 10px; }

      /* --- Home Layout --- */
      .home-section { padding: 20px 0 10px 20px; }
      .section-head { display: flex; justify-content: space-between; align-items: center; padding-right: 20px; margin-bottom: 15px; }
      .section-title { color: #fff; font-size: 18px; font-weight: 700; border-left: 4px solid var(--primary); padding-left: 10px; }
      .see-more { color: var(--primary); font-size: 12px; cursor: pointer; font-weight: 600; }
      .scroll-row { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 10px; padding-right: 20px; scroll-behavior: smooth; }
      .scroll-row::-webkit-scrollbar { display: none; } 
      
      .card { position: relative; background: var(--bg-card); border-radius: var(--radius); overflow: hidden; cursor: pointer; }
      .scroll-row .card { min-width: 120px; max-width: 120px; }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; display: block; }
      .title { padding: 8px; font-size: 12px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ddd; }
      .prem-tag { position: absolute; top: 5px; left: 5px; background: #ffd700; color: #000; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; z-index: 2; }

      /* --- Grid View --- */
      .container { max-width: 1200px; margin: 0 auto; padding: 15px; display: none; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      @media (min-width: 600px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }
      .back-nav { display: none; padding: 10px 20px; align-items: center; background: var(--glass); position: sticky; top: 60px; z-index: 40; border-bottom: 1px solid #333; }
      .back-btn { background: #333; color: white; border: none; padding: 8px 18px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: bold; }
      
      /* --- Player Modal --- */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:#000; z-index:200; overflow-y: auto; }
      .modal-content { width: 100%; max-width: 1100px; margin: 0 auto; min-height: 100vh; background: #111; }
      
      /* Video Wrapper & Close Button */
      .video-area { position: sticky; top: 0; z-index: 10; background:black; width: 100%; aspect-ratio: 16/9; position: relative; }
      video { width: 100%; height: 100%; background: black; display: block; }

      /* Fixed Close Button (Top Right of Video) */
      .modal-close-btn {
        position: absolute; top: 15px; right: 15px; 
        width: 35px; height: 35px; border-radius: 50%;
        background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.3);
        color: white; font-size: 18px; cursor: pointer; z-index: 100;
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(4px);
      }

      /* Clean Cover - No Icon */
      .cover-overlay { 
          position: absolute; top:0; left:0; width:100%; height:100%; 
          background-size: cover; background-position: center; 
          z-index: 20; 
      }
      /* Darken the cover slightly so video isn't too bright initially */
      .cover-overlay::after { content:''; position: absolute; inset:0; background: rgba(0,0,0,0.2); }

      /* Play Button Box Area */
      .play-box-container {
        padding: 20px 20px 0 20px;
        background: linear-gradient(to bottom, #111, #1a1a1a);
      }
      .hero-play-btn {
        width: 100%;
        padding: 16px;
        background: linear-gradient(45deg, #E50914, #ff5f6d);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4);
        transition: transform 0.2s;
        animation: pulse 2s infinite;
      }
      .hero-play-btn:active { transform: scale(0.97); }
      @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(229, 9, 20, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(229, 9, 20, 0); } 100% { box-shadow: 0 0 0 0 rgba(229, 9, 20, 0); } }

      /* Info & VIP Lock */
      .info-sec { padding: 20px; background: #1a1a1a; min-height: 400px; }
      #vip-lock { display: none; position: absolute; top:0; left:0; width:100%; height:100%; background: #080808; flex-direction: column; align-items: center; justify-content: center; z-index: 25; }
      
      .player-overlay { 
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
          display: none; justify-content: flex-end; align-items: flex-end; padding: 15px;
          background: rgba(0,0,0,0.5); z-index: 20;
      }
      .ctrl-btn { background: rgba(0,0,0,0.6); color: white; border: 1px solid rgba(255,255,255,0.3); width: 40px; height: 40px; border-radius: 50%; cursor: pointer; margin-left: 10px; }

      /* Episodes & Skeleton */
      .accordion { background-color: #222; color: #eee; padding: 15px; width: 100%; border: none; text-align: left; font-weight: 600; border-bottom: 1px solid #333; margin-top: 8px; border-radius: 8px; }
      .accordion.active { background-color: #333; color: var(--primary); }
      .panel { padding: 0 5px; background-color: #181818; max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
      .episode-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 10px; padding: 15px 5px; }
      .ep-btn { background: #2a2a2a; border: 1px solid #333; color: #ccc; padding: 12px 5px; cursor: pointer; border-radius: 6px; font-size: 12px; }
      .ep-btn.active { background: var(--primary); color: white; }

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
      <div class="brand" onclick="goHome()">STREAM<span style="color:white;">X</span></div>
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
        <div class="home-section"><div class="section-head"><span class="section-title">Trending Movies</span><a class="see-more" onclick="openCategory('movies')">See All</a></div><div class="scroll-row" id="row_movies">${getServerSkeleton()}</div></div>
        <div class="home-section"><div class="section-head"><span class="section-title">Series</span><a class="see-more" onclick="openCategory('series')">See All</a></div><div class="scroll-row" id="row_series">${getServerSkeleton()}</div></div>
        <div class="home-section"><div class="section-head"><span class="section-title">Adult 18+</span><a class="see-more" onclick="openCategory('Adult')">See All</a></div><div class="scroll-row" id="row_18">${getServerSkeleton()}</div></div>
    </div>

    <div class="back-nav" id="backNav"><button class="back-btn" onclick="goHome()">⬅ Back</button></div>
    <div class="container" id="gridViewContainer"><div class="grid" id="mainGrid"></div><div style="height:50px;"></div></div>

    <div id="playerModal">
      <div class="modal-content">
        <div class="video-area" id="videoWrapper">
            <button class="modal-close-btn" onclick="closePlayer()">✕</button>
            
            <div id="coverOverlay" class="cover-overlay"></div> <video id="video" controls playsinline controlsList="nodownload"></video>
            
            <div id="vip-lock"><div style="font-size:50px;">👑</div><h2 style="color:#ffd700;">Premium Only</h2><button class="auth-btn" onclick="closePlayer(); toggleUserPanel();" style="width:auto; padding:10px 30px;">Login / Redeem</button></div>
            
            <div class="player-overlay" id="playerOverlay">
                <button class="ctrl-btn" onclick="toggleFullScreen()">⛶</button>
            </div>
        </div>
        
        <div class="play-box-container" id="playBtnContainer">
             <button class="hero-play-btn" onclick="startPlayback()">
                ▶ Watch Now
             </button>
        </div>

        <div class="info-sec">
          <h2 id="m_title" style="color:white; margin-top:0;">Loading...</h2>
          <div id="m_tags" style="margin:10px 0; display:flex; gap:8px; flex-wrap:wrap;"></div>
          <div style="display:flex; gap:10px; margin:20px 0;">
             <button id="favBtn" class="auth-btn secondary" style="margin:0; width:auto;" onclick="toggleFavorite()">🤍 Add to List</button>
             <div id="dl_area"></div>
          </div>
          <p id="m_desc" style="color:#bbb; line-height:1.6;"></p>
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
      let activeVideoLink = ""; 
      let activeIsPremium = false;

      const loader = document.getElementById('global-loader');
      function showLoader() { loader.classList.remove('hidden-loader'); }
      function hideLoader() { loader.classList.add('hidden-loader'); }
      function showAlert(t, m) { document.getElementById('custom-alert').style.display='flex'; document.getElementById('alert-title').innerText=t; document.getElementById('alert-msg').innerText=m; }

      // Routing
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

      // Modal Logic
      function closePlayer() {
          closePlayerInternal();
          window.history.pushState(null, '', window.location.pathname);
          goHomeInternal(); // or showGridInternal based on state
      }

      function setupPlayerIdle() {
          const w = document.getElementById('videoWrapper');
          const o = document.getElementById('playerOverlay');
          const v = document.getElementById('video');
          const show = () => {
              if(v.style.display === 'none') return;
              o.style.display = "flex";
              clearTimeout(controlsTimeout);
              if(!v.paused) controlsTimeout = setTimeout(() => { o.style.display = "none"; }, 3000);
          };
          w.onclick = show;
          v.onplay = show;
      }

      function renderAccordion(episodes, isPremium) { 
        const container = document.getElementById('ep_section'); container.innerHTML = ""; 
        const seasons = {}; 
        episodes.forEach(ep => { 
            let g = "Videos"; 
            if(ep.label.includes("Season")) g = ep.label.split(" ")[0] + " " + ep.label.split(" ")[1];
            if(!seasons[g]) seasons[g] = []; seasons[g].push(ep); 
        }); 
        Object.keys(seasons).forEach(key => { 
            const btn = document.createElement('button'); btn.className = "accordion"; btn.innerHTML = key; 
            const panel = document.createElement('div'); panel.className = "panel"; 
            const grid = document.createElement('div'); grid.className = "episode-grid"; 
            grid.innerHTML = seasons[key].map(ep => \`<button class="ep-btn" onclick="switchEpisode(this, '\${ep.link}', \${isPremium})">\${ep.label}</button>\`).join(''); 
            panel.appendChild(grid); container.appendChild(btn); container.appendChild(panel); 
            btn.onclick = () => { btn.classList.toggle("active"); panel.style.maxHeight = panel.style.maxHeight ? null : "400px"; }; 
        }); 
      }

      async function fetchMovies(page, cat) { 
          const res = await fetch(\`/api/movies?page=\${page}&cat=\${encodeURIComponent(cat)}\`); 
          const json = await res.json(); 
          allMoviesData = json.data; renderGrid(json.data); 
      }
      function renderGrid(data) { document.getElementById('mainGrid').innerHTML = data.map(m => createCardHtml(m)).join(''); }
      function createCardHtml(m) { 
          return \`<div class="card" onclick="openModalById('\${m.id}')"><img src="\${m.image}" loading="lazy"><div class="prem-tag">\${m.isPremium?'VIP':''}</div><div class="title">\${m.title}</div></div>\`; 
      }
      
      function openModalById(id) {
          const m = allMoviesData.find(x => x.id === id);
          if(m) setupModal(m); else fetchSingleMovie(id);
          const u = \`?id=\${id}\`; window.history.pushState({path:u},'',u);
      }

      async function fetchSingleMovie(id){
          showLoader(); resetPlayerUI(); document.getElementById('playerModal').style.display='block';
          const res=await fetch(\`/api/get_movie?id=\${id}\`); const m=await res.json();
          if(m&&m.title) setupModal(m); hideLoader();
      }

      function resetPlayerUI(){
          document.getElementById('m_title').innerText="Loading...";
          document.getElementById('m_desc').innerText="";
          document.getElementById('m_tags').innerHTML="";
          document.getElementById('ep_section').innerHTML="";
          document.getElementById('dl_area').innerHTML="";
          document.getElementById('coverOverlay').style.backgroundImage="";
          document.getElementById('vip-lock').style.display="none";
          document.getElementById('video').style.display="none"; // Hide video initially
          document.getElementById('coverOverlay').style.display="block"; // Show cover
          document.getElementById('playBtnContainer').style.display="block"; // Show play button
      }

      function setupModal(m){
          currentMovieId=m.id; 
          document.getElementById('playerModal').style.display='block';
          document.body.style.overflow='hidden';
          document.getElementById('m_title').innerText=m.title;
          document.getElementById('m_desc').innerText=m.description||"";
          document.getElementById('coverOverlay').style.backgroundImage=\`url('\${m.cover||m.image}')\`;
          
          if(m.tags) document.getElementById('m_tags').innerHTML=m.tags.map(t=>\`<span style="background:#333; padding:2px 8px; font-size:12px; border-radius:4px; color:#ccc;">\${t}</span>\`).join('');
          
          const dl=document.getElementById('dl_area'); dl.innerHTML="";
          if(m.downloadLink) dl.innerHTML=\`<a href="\${m.downloadLink}" target="_blank" class="auth-btn secondary" style="width:auto; text-decoration:none;">📥 Download</a>\`;
          
          if(!m.episodes || m.episodes.length<=1){
             document.getElementById('ep_section').style.display='none';
             setupPlayButton(m.episodes && m.episodes[0] ? m.episodes[0].link : m.link, m.isPremium);
          } else {
             document.getElementById('ep_section').style.display='block';
             renderAccordion(m.episodes,m.isPremium);
             setupPlayButton(m.episodes[0].link, m.isPremium);
          }
          updateFavBtnState();
      }

      function setupPlayButton(l,p){ activeVideoLink=l; activeIsPremium=p; }
      window.switchEpisode=function(b,l,p){ 
          document.querySelectorAll('.ep-btn').forEach(x=>x.classList.remove('active'));
          b.classList.add('active'); setupPlayButton(l,p); startPlayback(); 
      }
      
      window.startPlayback=function(){
          if(activeIsPremium && (!currentUser || currentUser.vipExpiry<Date.now())){
              document.getElementById('vip-lock').style.display='flex';
              document.getElementById('coverOverlay').style.display='none'; // Hide cover to show lock
              document.getElementById('playBtnContainer').style.display='none'; // Hide button
              return;
          }
          // Hide cover and button, show video
          document.getElementById('coverOverlay').style.display='none';
          document.getElementById('playBtnContainer').style.display='none';
          
          const v=document.getElementById('video');
          v.style.display='block';
          setupPlayerIdle();
          playViaSecureToken(activeVideoLink);
      }

      async function playViaSecureToken(u){
          const v=document.getElementById('video');
          if(u.includes('.m3u8')){
             if(Hls.isSupported()){
                 const h=new Hls(); h.loadSource(u); h.attachMedia(v); h.on(Hls.Events.MANIFEST_PARSED,()=>v.play());
                 window.hlsInstance=h;
             } else { v.src=u; v.play(); }
             return;
          }
          try{
             const res=await fetch('/api/sign_url',{method:'POST',body:JSON.stringify({url:u,movieId:currentMovieId,username:currentUser?currentUser.username:null})});
             const j=await res.json();
             if(j.token){ v.src="/api/play?t="+j.token; v.play(); }
          }catch(e){console.error(e);}
      }

      function closePlayerInternal(){
          const v=document.getElementById('video'); v.pause(); v.src="";
          if(window.hlsInstance) { window.hlsInstance.destroy(); window.hlsInstance=null; }
          document.getElementById('playerModal').style.display='none';
          document.body.style.overflow='auto';
      }

      // Basic Funcs
      function loadSession(){const s=localStorage.getItem('user_session');if(s) currentUser=JSON.parse(s);}
      function toggleUserPanel(){document.getElementById('userPanel').classList.toggle('open');}
      function updateProfileUI(){
         if(currentUser){
            document.getElementById('loginForm').style.display='none'; document.getElementById('profileView').style.display='block';
            document.getElementById('u_name').innerText=currentUser.username;
            document.getElementById('u_status').innerText=currentUser.vipExpiry>Date.now()?"VIP Active":"Free Plan";
         } else {
            document.getElementById('loginForm').style.display='block'; document.getElementById('profileView').style.display='none';
         }
      }
      // Auth APIs
      async function doRegister(){const u=document.getElementById('reg_user').value,p=document.getElementById('reg_pass').value; if(!u||!p)return; showLoader(); await fetch('/api/auth/register',{method:'POST',body:JSON.stringify({username:u,password:p})}); hideLoader(); showAlert("Success","Created");}
      async function doLogin(){const u=document.getElementById('reg_user').value,p=document.getElementById('reg_pass').value; showLoader(); const res=await fetch('/api/auth/login',{method:'POST',body:JSON.stringify({username:u,password:p})}); hideLoader(); if(res.ok){ const user=await res.json(); user.vipExpiry=user.vipExpiry||0; currentUser=user; localStorage.setItem('user_session',JSON.stringify(user)); updateProfileUI(); } else showAlert("Error","Fail");}
      function doLogout(){localStorage.removeItem('user_session'); currentUser=null; updateProfileUI();}
      async function doRedeem(){const c=document.getElementById('vip_code').value; showLoader(); const res=await fetch('/api/auth/redeem',{method:'POST',body:JSON.stringify({username:currentUser.username,code:c})}); hideLoader(); if(res.ok){const u=await res.json(); currentUser=u; localStorage.setItem('user_session',JSON.stringify(u)); updateProfileUI(); showAlert("Success","VIP Added");}}
      
      // Fetch Rows
      async function fetchRow(c,id){try{const res=await fetch(\`/api/movies?page=1&cat=\${encodeURIComponent(c)}\`);const json=await res.json();document.getElementById(id).innerHTML=json.data.slice(0,10).map(m=>createCardHtml(m)).join('');}catch(e){}}
      function goHome(){goHomeInternal();}
      function goHomeInternal(){document.getElementById('homeView').style.display='block';document.getElementById('gridViewContainer').style.display='none';document.getElementById('backNav').style.display='none';}
      function openCategory(c){currentCategory=c; document.getElementById('homeView').style.display='none';document.getElementById('gridViewContainer').style.display='block';document.getElementById('backNav').style.display='flex'; fetchMovies(1,c);}
      async function openFavorites(){currentCategory='fav'; document.getElementById('homeView').style.display='none';document.getElementById('gridViewContainer').style.display='block';document.getElementById('backNav').style.display='flex'; const f=JSON.parse(localStorage.getItem('my_favs')||'[]'); if(f.length){const res=await Promise.all(f.map(id=>fetch(\`/api/get_movie?id=\${id}\`).then(r=>r.json()))); renderGrid(res);} else document.getElementById('mainGrid').innerHTML="Empty";}
      async function executeSearch(){const q=document.getElementById('searchInput').value; if(!q)return; openCategory('search'); const res=await fetch(\`/api/search?q=\${q}\`); const j=await res.json(); renderGrid(j);}
      function handleSearchKey(e){if(e.key==='Enter')executeSearch();}
      function toggleFavorite(){if(!currentMovieId)return; let f=JSON.parse(localStorage.getItem('my_favs')||'[]'); if(f.includes(currentMovieId))f=f.filter(x=>x!==currentMovieId); else f.push(currentMovieId); localStorage.setItem('my_favs',JSON.stringify(f)); updateFavBtnState();}
      function updateFavBtnState(){const f=JSON.parse(localStorage.getItem('my_favs')||'[]'); document.getElementById('favBtn').innerText=f.includes(currentMovieId)?"❤️ Saved":"🤍 Add to List";}
      function toggleFullScreen(){const w=document.getElementById('videoWrapper'); if(!document.fullscreenElement) w.requestFullscreen().catch(()=>{}); else document.exitFullscreen();}
    </script>
  </body>
  </html>
  `;
}
