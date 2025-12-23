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

      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; outline: none; scrollbar-width: none; }
      ::-webkit-scrollbar { display: none; }
      
      html, body { 
          background: var(--bg-body); color: var(--text-main); font-family: 'Padauk', 'Inter', sans-serif; 
          margin:0; padding:0; width: 100%; height: 100%; overflow: hidden; position: fixed;
      }
      
      header { 
        position: fixed; top: 0; left: 0; width: 100%; height: var(--header-height);
        background: rgba(18, 18, 18, 0.98); backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(255,255,255,0.1); display:flex; justify-content: center; align-items: center; z-index: 50;
      }
      .brand { color: var(--primary); font-weight: 900; font-size: 22px; cursor: pointer; }

      .back-nav { 
          position: fixed; top: 0; left: 0; width: 100%; height: var(--header-height);
          background: rgba(18, 18, 18, 0.98); backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.1); display: none; align-items: center; padding: 0 20px; z-index: 60;
      }

      .scroll-view, .full-view {
          position: absolute; top: var(--header-height); left: 0; width: 100%; bottom: var(--nav-height);
          overflow-y: auto; overflow-x: hidden; background: var(--bg-body); -webkit-overflow-scrolling: touch; padding-top: 10px; display: none; 
      }
      #homeView { display: block; }

      .bottom-nav {
          position: fixed; bottom: 0; left: 0; width: 100%; height: var(--nav-height);
          background: #1a1a1a; border-top: 1px solid #333; display: flex; justify-content: space-around; align-items: center; z-index: 100;
      }
      .nav-item { background: none; border: none; color: #777; display: flex; flex-direction: column; align-items: center; font-size: 10px; width: 25%; cursor: pointer; }
      .nav-item.active { color: var(--primary); }

      #global-loader { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-body); z-index: 9999; display: flex; justify-content: center; align-items: center; transition: opacity 0.3s; }
      .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .hidden-loader { opacity: 0; pointer-events: none; }

      .home-section { padding: 10px 0 10px 20px; }
      .section-title { color: #fff; font-size: 17px; font-weight: 700; border-left: 4px solid var(--primary); padding-left: 10px; }
      .scroll-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 20px; padding-right: 20px; }
      .card { min-width: 110px; max-width: 110px; background: var(--bg-card); border-radius: 8px; overflow: hidden; cursor: pointer; position: relative; }
      .card img { width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; }
      .title { padding: 8px 5px; font-size: 11px; text-align: center; color: #ddd; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background: var(--bg-body); z-index:200; overflow-y: auto; padding-bottom: 80px; }
      .details-header { position: sticky; top: 0; left: 0; width: 100%; padding: 15px 20px; display: flex; justify-content: space-between; z-index: 20; background: #121212; }
      .nav-circle-btn { width: 40px; height: 40px; border-radius: 50%; background: rgba(40, 40, 40, 0.8); border: 1px solid #444; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
      .modal-body-content { padding: 10px 20px 40px 20px; }
      .top-info-section { display: flex; gap: 20px; margin-bottom: 25px; }
      .poster-img-sidebar { width: 110px; height: 160px; border-radius: 10px; object-fit: cover; }
      .movie-title { font-size: 20px; font-weight: 800; color: #fff; margin: 0; }
      .btn-play { width: 100%; padding: 14px; border-radius: 50px; border: none; background: var(--red-btn); color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }

      .video-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: black; z-index: 300; display: none; flex-direction: column; }
      .video-wrapper { width: 100%; height: 100%; position: relative; }
      .artplayer-app { width: 100%; height: 100%; }

      .custom-controls { position: absolute; top: 20px; right: 20px; z-index: 310; display: flex; gap: 15px; }
      .custom-btn { width: 45px; height: 45px; border-radius: 50%; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255,255,255,0.3); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; }

      .accordion { background: #1e1e1e; color: #eee; padding: 15px; width: 100%; border: none; text-align: left; font-weight: 700; border-radius: 12px; margin-top:10px; display: flex; justify-content: space-between; }
      .panel { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
      .episode-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 10px; padding: 15px 5px; }
      .ep-btn { background: #2a2a2a; border: 1px solid #444; color: #ccc; padding: 12px 5px; border-radius: 10px; cursor: pointer; }
      .ep-btn.active { background: var(--primary); color: white; }
      .genre-tag { background: #222; color: #ccc; font-size: 10px; padding: 4px 10px; border-radius: 8px; margin-right:5px; border: 1px solid #444; }

      .skeleton { animation: shimmer 2s infinite linear; background: linear-gradient(to right, #222 4%, #333 25%, #222 36%); background-size: 1000px 100%; }
      @keyframes shimmer { 0% { background-position: -500px 0; } 100% { background-position: 500px 0; } }

      .auth-input { width: 100%; padding: 15px; margin-bottom: 15px; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 12px; }
      .auth-btn-solid { width: 100%; padding: 15px; background: var(--primary); color: white; border: none; font-weight: bold; border-radius: 50px; margin-top:10px; cursor: pointer; }
      #custom-alert { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; align-items: center; justify-content: center; }
      .alert-box { background: #222; padding: 20px; border-radius: 15px; text-align: center; width: 90%; max-width: 350px; border: 1px solid #444; }
    </style>
  </head>
  <body>

    <div id="custom-alert"><div class="alert-box"><h3 id="alert-title" style="color:#fff;"></h3><p id="alert-msg" style="color:#aaa;"></p><button onclick="document.getElementById('custom-alert').style.display='none'" class="auth-btn-solid">OK</button></div></div>
    <div id="global-loader"><div class="spinner"></div></div>

    <header id="mainHeader"><div class="brand" onclick="switchTab('home')">Stream X</div></header>
    <div id="backNav" class="back-nav"><button class="nav-circle-btn" onclick="switchTab('home')">⬅</button><span id="gridTitle" style="color:white; font-weight:bold; margin-left:10px;">MOVIES</span></div>

    <div id="homeView" class="scroll-view">
        <div class="home-section"><div style="margin-bottom:15px;"><span class="section-title">Movies</span></div><div class="scroll-row" id="row_movies">${getServerSkeleton()}</div></div>
        <div class="home-section"><div style="margin-bottom:15px;"><span class="section-title">Series</span></div><div class="scroll-row" id="row_series">${getServerSkeleton()}</div></div>
    </div>

    <div id="searchView" class="full-view">
        <input type="text" id="searchInput" style="width:90%; margin:20px 5%; padding:15px; background:#2a2a2a; border:1px solid #444; color:white; border-radius:30px;" placeholder="Search..." onkeypress="if(event.key==='Enter')executeSearch()">
        <div class="grid" id="searchGrid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; padding:15px;"></div>
    </div>

    <div class="full-view" id="gridViewContainer"><div class="grid" id="mainGrid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; padding:15px;"></div></div>

    <div id="profileViewContainer" class="full-view">
        <div id="loginForm" style="padding:20px;">
            <h3 style="color:white;">Login</h3>
            <input type="text" id="reg_user" class="auth-input" placeholder="Username">
            <input type="password" id="reg_pass" class="auth-input" placeholder="Password">
            <button class="auth-btn-solid" onclick="doLogin()">Log In</button>
        </div>
        <div id="profileView" style="display:none; padding:20px; text-align:center;">
            <h3 id="u_name" style="color:white;">User</h3>
            <p id="u_status" style="color:var(--primary);">Free Plan</p>
            <button class="auth-btn-solid" style="background:#ff4757;" onclick="doLogout()">Log Out</button>
        </div>
    </div>

    <div class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('home')" id="nav_home"><span>🏠</span>Home</div>
        <div class="nav-item" onclick="switchTab('search')" id="nav_search"><span>🔍</span>Search</div>
        <div class="nav-item" onclick="switchTab('fav')" id="nav_fav"><span>❤️</span>Favs</div>
        <div class="nav-item" onclick="switchTab('profile')" id="nav_profile"><span>👤</span>Account</div>
    </div>

    <div id="playerModal">
      <div class="details-header"><button class="nav-circle-btn" onclick="closePlayer()">⬅</button></div>
      <div class="modal-body-content">
          <div class="top-info-section">
              <img id="dt_poster" class="poster-img-sidebar">
              <div class="meta-col-sidebar">
                  <h1 id="dt_title" class="movie-title">Loading...</h1>
                  <div id="dt_genres" style="margin-top:10px;"></div>
              </div>
          </div>
          <button class="btn-play" onclick="launchVideo()">▶ Play Video</button>
          <div id="ep_section" style="margin-top:20px;"></div>
          <p id="dt_desc" style="color:#ccc; font-size:14px; line-height:1.6; margin-top:20px;"></p>
      </div>

      <div id="videoOverlay" class="video-overlay">
         <div class="custom-controls">
             <button class="custom-btn" onclick="toggleFullScreen()">⛶</button>
             <button class="custom-btn" onclick="closeVideo()">✕</button>
         </div>
         <div class="video-wrapper"><div id="artplayer-app" class="artplayer-app"></div></div>
      </div>
    </div>

    <script>
      let currentUser = JSON.parse(localStorage.getItem('user_session') || 'null');
      let currentMovieId = "";
      let activeVideoLink = ""; 
      let activeIsPremium = false;
      let art = null;

      function showLoader() { document.getElementById('global-loader').classList.remove('hidden-loader'); }
      function hideLoader() { document.getElementById('global-loader').classList.add('hidden-loader'); }
      function showAlert(t, m) { 
          document.getElementById('alert-title').innerText=t; 
          document.getElementById('alert-msg').innerText=m;
          document.getElementById('custom-alert').style.display='flex';
      }

      window.onload = async () => {
        updateProfileUI();
        await Promise.all([fetchRow('movies', 'row_movies'), fetchRow('series', 'row_series')]);
        hideLoader();
      };

      function switchTab(tab) {
          document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
          document.getElementById('nav_' + tab).classList.add('active');
          document.querySelectorAll('.scroll-view, .full-view').forEach(el => el.style.display='none');
          document.getElementById('mainHeader').style.display = 'flex';
          document.getElementById('backNav').style.display = 'none';

          if(tab === 'home') document.getElementById('homeView').style.display='block';
          else if(tab === 'search') document.getElementById('searchView').style.display='block';
          else if(tab === 'profile') document.getElementById('profileViewContainer').style.display='block';
          else if(tab === 'fav') openFavorites();
      }

      // 🔥 FIX: play_url ကို Token တောင်းတဲ့ စနစ်သို့ ပြောင်းလဲခြင်း
      async function launchVideo(epIndex = undefined) {
          if(!currentMovieId) return;
          showLoader();
          try {
              const username = currentUser ? currentUser.username : "";
              const res = await fetch('/api/sign_url', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                      movieId: currentMovieId, 
                      epIndex: epIndex, 
                      username: username 
                  })
              });

              if (!res.ok) {
                  const err = await res.text();
                  throw new Error(err || "Access Denied");
              }

              const data = await res.json();
              // Backend က ပေးလိုက်တဲ့ token နဲ့ play link တည်ဆောက်ခြင်း (ဒါကြောင့် downloader မှာ deno link ပဲပေါ်မှာပါ)
              activeVideoLink = window.location.origin + "/api/play?t=" + data.token;

              document.getElementById('videoOverlay').style.display='flex';
              playViaArtPlayer(activeVideoLink);
          } catch(e) {
              showAlert("Error", e.message);
          } finally {
              hideLoader();
          }
      }

      function playViaArtPlayer(url) {
          if(art) art.destroy();
          art = new Artplayer({
              container: '#artplayer-app',
              url: url,
              autoplay: true,
              fullscreen: true,
              theme: '#00b894',
              moreVideoAttr: { crossorigin: 'anonymous' },
              type: url.includes('.m3u8') ? 'm3u8' : 'auto',
              customType: {
                  m3u8: function (video, url) {
                      if (Hls.isSupported()) {
                          const hls = new Hls();
                          hls.loadSource(url);
                          hls.attachMedia(video);
                      } else { video.src = url; }
                  },
              },
          });
      }

      function closeVideo() { if(art) art.destroy(); document.getElementById('videoOverlay').style.display='none'; }
      function closePlayer() { document.getElementById('playerModal').style.display='none'; closeVideo(); }
      function toggleFullScreen() { if(art) art.fullscreen = !art.fullscreen; }

      async function fetchRow(c,id){
          const res=await fetch(\`/api/movies?page=1&cat=\${c}\`);
          const json=await res.json();
          document.getElementById(id).innerHTML=json.data.map(m=>\`<div class="card" onclick="openMovie('\${m.id}')"><img src="\${m.image}"><div class="title">\${m.title}</div></div>\`).join('');
      }

      async function openMovie(id){
          showLoader();
          currentMovieId = id;
          const res = await fetch(\`/api/get_movie?id=\${id}\`);
          const m = await res.json();
          document.getElementById('dt_poster').src = m.image;
          document.getElementById('dt_title').innerText = m.title;
          document.getElementById('dt_desc').innerText = m.description || "";
          document.getElementById('dt_genres').innerHTML = (m.tags || []).map(t=>\`<span class="genre-tag">\${t}</span>\`).join('');
          
          const epSec = document.getElementById('ep_section');
          epSec.innerHTML = "";
          if(m.episodes && m.episodes.length > 1) {
              renderAccordion(m.episodes, m.isPremium);
          }
          
          document.getElementById('playerModal').style.display='block';
          hideLoader();
      }

      function renderAccordion(episodes, isPremium) {
          const container = document.getElementById('ep_section');
          const btn = document.createElement('button');
          btn.className = "accordion";
          btn.innerHTML = "Episodes <span>▼</span>";
          const panel = document.createElement('div');
          panel.className = "panel";
          const grid = document.createElement('div');
          grid.className = "episode-grid";
          
          // idx ကိုပါ ထည့်ပေးထားလို့ launchVideo ဆီကို epIndex မှန်မှန်ရောက်မှာပါ
          grid.innerHTML = episodes.map((ep, idx) => \`<button class="ep-btn" onclick="switchEpisode(this, \${idx})">\${ep.label}</button>\`).join('');
          
          panel.appendChild(grid);
          container.appendChild(btn);
          container.appendChild(panel);
          btn.onclick = () => { panel.style.maxHeight = panel.style.maxHeight ? null : "500px"; };
      }

      window.switchEpisode = function(btn, idx) {
          document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          launchVideo(idx);
      }

      function updateProfileUI(){
          if(currentUser){
              document.getElementById('loginForm').style.display='none';
              document.getElementById('profileView').style.display='block';
              document.getElementById('u_name').innerText = currentUser.username;
          } else {
              document.getElementById('loginForm').style.display='block';
              document.getElementById('profileView').style.display='none';
          }
      }

      async function doLogin(){
          const u=document.getElementById('reg_user').value, p=document.getElementById('reg_pass').value;
          const res=await fetch('/api/auth/login',{method:'POST',body:JSON.stringify({username:u,password:p})});
          if(res.ok){
              currentUser = await res.json();
              localStorage.setItem('user_session', JSON.stringify(currentUser));
              updateProfileUI();
          } else showAlert("Error", "Login Fail");
      }

      function doLogout(){ localStorage.removeItem('user_session'); currentUser=null; updateProfileUI(); }
    </script>
  </body>
  </html>
  `;
}
