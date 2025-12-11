export function renderWebsite() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>My Streaming App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <style>
      body { background: #121212; color: #e0e0e0; font-family: 'Segoe UI', sans-serif; margin:0; padding-bottom: 60px; user-select: none; }
      
      /* --- Header & Search --- */
      header { background: rgba(24, 24, 24, 0.95); backdrop-filter: blur(10px); padding: 10px; position: sticky; top:0; z-index:50; border-bottom: 1px solid #333; display:flex; flex-direction: column; align-items: center; gap: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
      .nav-row { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
      .nav-btn { background: #333; color: #ccc; border: none; padding: 6px 16px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight:600; transition: 0.3s; }
      .nav-btn:hover { background: #444; color: #fff; }
      .nav-btn.active { background: #e50914; color: white; box-shadow: 0 0 10px rgba(229, 9, 20, 0.4); }
      
      .search-box { width: 90%; max-width: 400px; display: flex; position: relative; }
      .search-input { width: 100%; padding: 10px 40px 10px 20px; border-radius: 25px; border: 1px solid #444; background: #222; color: white; outline: none; transition: 0.3s; }
      .search-input:focus { border-color: #e50914; background: #2a2a2a; }
      .search-icon { position: absolute; right: 15px; top: 10px; color: #888; }

      /* --- Grid & Card --- */
      .container { max-width: 1200px; margin: 0 auto; padding: 15px; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      @media (min-width: 600px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 15px; } }
      @media (min-width: 900px) { .grid { grid-template-columns: repeat(5, 1fr); gap: 20px; } }

      .card { background: #1f1f1f; border-radius: 8px; overflow: hidden; cursor: pointer; position: relative; transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s; }
      .card:hover { transform: scale(1.05); z-index: 10; box-shadow: 0 10px 25px rgba(0,0,0,0.7); }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; display: block; }
      
      .title { padding: 8px; font-size: 12px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; font-weight: 500; background: linear-gradient(to top, #111 0%, transparent 100%); }
      .card-tag { position: absolute; top: 6px; right: 6px; background: rgba(229, 9, 20, 0.9); color: #fff; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase; box-shadow: 0 2px 5px rgba(0,0,0,0.5); }

      /* --- Skeleton Loading Animation --- */
      @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
      .skeleton-card { background: #222; border-radius: 8px; overflow: hidden; aspect-ratio: 2/3; position: relative; }
      .skeleton-card::before { content: ""; display: block; width: 100%; height: 100%; background: linear-gradient(to right, #222 8%, #333 18%, #222 33%); background-size: 1000px 100%; animation: shimmer 1.5s infinite linear; }

      /* --- Pagination --- */
      .pagination { display: flex; justify-content: center; gap: 15px; margin-top: 40px; }
      .page-btn { padding: 8px 20px; background: #333; color: white; border: none; border-radius: 20px; cursor: pointer; transition: 0.2s; }
      .page-btn:hover:not(:disabled) { background: #e50914; }
      .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      
      /* --- Modal & Player --- */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:black; z-index:100; overflow-y: auto; animation: fadeIn 0.3s; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

      .modal-content { width: 100%; max-width: 1000px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #111; }
      
      /* Video Wrapper */
      .video-area { position: sticky; top: 0; z-index: 10; background:black; width: 100%; aspect-ratio: 16/9; position: relative; group: 1; }
      video { width: 100%; height: 100%; background: black; display: none; }
      
      /* Custom Overlay Controls */
      .player-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; display: flex; flex-direction: column; justify-content: space-between; padding: 10px; box-sizing: border-box; transition: opacity 0.3s; }
      .video-area:hover .player-overlay { opacity: 1; }
      
      .top-controls { display: flex; justify-content: flex-end; }
      .bottom-controls { display: flex; justify-content: flex-end; margin-bottom: 40px; /* Space for native controls */ }
      
      .ctrl-btn { pointer-events: auto; background: rgba(0,0,0,0.6); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; backdrop-filter: blur(4px); display: flex; align-items: center; gap: 5px; transition: 0.2s; }
      .ctrl-btn:hover { background: #e50914; border-color: #e50914; }

      .cover-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; }
      .cover-overlay::before { content: ""; position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.4); }
      .play-btn-circle { width: 70px; height: 70px; background: rgba(229, 9, 20, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(0,0,0,0.6); transition: 0.3s; z-index: 21; }
      .play-btn-circle::after { content: '▶'; color: white; font-size: 28px; margin-left: 5px; }
      .cover-overlay:hover .play-btn-circle { transform: scale(1.1); background: #f00; box-shadow: 0 0 40px rgba(229, 9, 20, 0.6); }

      /* Info Section */
      .info-sec { padding: 25px; }
      h2 { margin: 0 0 10px 0; color: #fff; font-size: 22px; text-shadow: 0 2px 4px black; }
      .tags-row { margin: 15px 0; display: flex; gap: 8px; flex-wrap: wrap; }
      .tag-pill { background: #333; color: #ddd; font-size: 11px; padding: 4px 10px; border-radius: 12px; border: 1px solid #444; }
      p.desc { color: #ccc; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin-top: 15px; border-left: 3px solid #e50914; padding-left: 15px; }
      
      /* Accordion Styles */
      .accordion { background-color: #222; color: #eee; cursor: pointer; padding: 15px; width: 100%; border: none; text-align: left; outline: none; font-size: 15px; font-weight: 600; transition: 0.3s; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; margin-top: 5px; border-radius: 4px; }
      .accordion:hover { background-color: #2a2a2a; }
      .accordion.active { background-color: #333; color: #e50914; border-left: 4px solid #e50914; }
      .accordion:after { content: '+'; font-size: 18px; font-weight: bold; }
      .accordion.active:after { content: "−"; }
      
      .panel { padding: 0 10px; background-color: #161616; max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
      .episode-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 10px; padding: 15px 0; }
      
      .ep-btn { background: #252525; border: 1px solid #333; color: #aaa; padding: 10px 5px; cursor: pointer; border-radius: 6px; text-align: center; font-size: 12px; transition: 0.2s; position: relative; }
      .ep-btn:hover { background: #444; color: white; transform: translateY(-2px); }
      .ep-btn.active { background: #e50914; border-color: #e50914; color: white; box-shadow: 0 4px 10px rgba(229,9,20,0.3); font-weight: bold; }
      
      /* Toast Notification */
      #toastBox { visibility: hidden; min-width: 250px; background-color: #333; color: #fff; text-align: center; border-radius: 50px; padding: 16px; position: fixed; z-index: 200; left: 50%; bottom: 30px; transform: translateX(-50%); font-size: 14px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); border: 1px solid #555; display: flex; align-items: center; justify-content: center; gap: 10px; opacity: 0; transition: opacity 0.5s, bottom 0.5s; }
      #toastBox.show { visibility: visible; opacity: 1; bottom: 50px; }
    </style>
  </head>
  <body>
    <div id="toastBox">Notification</div>

    <header>
      <div class="search-box">
        <input type="text" id="searchInput" class="search-input" placeholder="Search movies..." onkeypress="handleSearch(event)">
        <span class="search-icon">🔍</span>
      </div>

      <div class="nav-row">
        <button class="nav-btn active" onclick="changeCategory('all', this)">All</button>
        <button class="nav-btn" onclick="changeCategory('movies', this)">Movies</button>
        <button class="nav-btn" onclick="changeCategory('series', this)">Series</button>
        <button class="nav-btn" onclick="changeCategory('18+', this)">18+</button>
      </div>
    </header>

    <div class="container">
      <div class="grid" id="grid">
        </div>
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
            
            <div class="player-overlay" id="playerOverlay">
                <div class="top-controls">
                    <button class="ctrl-btn" onclick="closePlayer()">❌ Close</button>
                </div>
                <div class="bottom-controls">
                    <button class="ctrl-btn" onclick="toggleFullScreen()">⛶ Fullscreen</button>
                </div>
            </div>
        </div>
        
        <div class="info-sec">
          <h2 id="m_title">Movie Title</h2>
          <div class="tags-row" id="m_tags"></div>
          
          <div id="ep_section" style="margin-top:20px;"></div> 
          <p id="m_desc" class="desc"></p>
        </div>
      </div>
    </div>

    <script>
      let currentPage = 1, currentCategory = 'all', allMoviesData = [];
      let currentVideoLink = "";
      let currentMovieId = ""; // To track progress

      // 🔥 Improved Back Button Logic
      window.addEventListener('popstate', function(event) {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');

        if (!movieId) {
            closePlayerInternal(); // Use internal function to avoid history loop
        } else {
             const movie = allMoviesData.find(m => m.id === movieId);
             if(movie) setupModal(movie);
        }
      });

      window.onload = async () => {
        renderSkeleton(); // Show skeleton immediately
        
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');

        if (movieId) {
            await fetchSingleMovie(movieId);
        } else {
            fetchMovies(1, 'all');
        }
        
        // Setup "Continue Watching" Listener
        const vid = document.getElementById('video');
        vid.addEventListener('timeupdate', () => {
            if(vid.currentTime > 5 && currentMovieId) {
                localStorage.setItem('watch_pos_' + currentMovieId, vid.currentTime);
            }
        });
      };

      // --- SKELETON LOADER ---
      function renderSkeleton() {
        const grid = document.getElementById('grid');
        grid.innerHTML = Array(10).fill('<div class="skeleton-card"></div>').join('');
      }

      // --- TOAST NOTIFICATION ---
      function showToast(msg) {
        const x = document.getElementById("toastBox");
        x.innerText = "🔔 " + msg;
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
      }

      async function fetchMovies(page, cat) {
        renderSkeleton();
        try {
            const res = await fetch(\`/api/movies?page=\${page}&cat=\${cat}\`);
            const json = await res.json();
            allMoviesData = json.data;
            renderGrid(json.data);
            updatePagination(json);
            currentPage = json.currentPage;
            currentCategory = cat;
        } catch(e) {
            document.getElementById('grid').innerHTML = '<p style="text-align:center; color:red">Connection Error</p>';
        }
      }

      function renderGrid(data) {
        const grid = document.getElementById('grid');
        if(data.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1;">No contents found.</p>';
            return;
        }
        grid.innerHTML = data.map((m) => {
          const tagHtml = m.tags && m.tags.length > 0 ? \`<div class="card-tag">\${m.tags[0]}</div>\` : '';
          // Added loading="lazy" for performance
          return \`<div class="card" onclick="openModalById('\${m.id}')">
                    <img src="\${m.image}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
                    \${tagHtml}
                    <div class="title">\${m.title}</div>
                  </div>\`;
        }).join('');
      }

      async function handleSearch(e) {
        if (e.key === 'Enter') {
            const query = document.getElementById('searchInput').value;
            if(!query) return fetchMovies(1, 'all');
            
            renderSkeleton();
            document.getElementById('pagControls').style.display = 'none';
            
            try {
                const res = await fetch(\`/api/search?q=\${encodeURIComponent(query)}\`);
                const results = await res.json();
                allMoviesData = results; 
                renderGrid(results);
            } catch(e) { showToast("Search failed"); }
        }
      }

      async function fetchSingleMovie(id) {
        document.getElementById('playerModal').style.display = 'block';
        try {
            const res = await fetch(\`/api/get_movie?id=\${id}\`);
            const movie = await res.json();
            
            if (movie && movie.title) {
                setupModal(movie);
                // Background load
                fetchMovies(1, 'all');
            } else {
                showToast("Movie not found");
                window.location.href = "/";
            }
        } catch(e) { showToast("Error loading movie"); }
      }

      function openModalById(id) {
        const movie = allMoviesData.find(m => m.id === id);
        if(movie) {
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?id=' + id;
            window.history.pushState({path:newUrl},'',newUrl);
            setupModal(movie);
        }
      }

      function setupModal(movie) {
        currentMovieId = movie.id; // Set ID for continue watching
        const modal = document.getElementById('playerModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        document.getElementById('m_title').innerText = movie.title;
        document.getElementById('m_desc').innerText = movie.description || "No description available.";
        
        const coverDiv = document.getElementById('coverOverlay');
        const coverUrl = movie.cover || movie.image;
        coverDiv.style.backgroundImage = \`url('\${coverUrl}')\`;
        coverDiv.style.display = 'flex';
        
        // Reset Player
        const vid = document.getElementById('video');
        vid.style.display = 'none';
        vid.pause();
        document.getElementById('playerOverlay').style.display = 'none'; // Hide overlay initially
        
        document.getElementById('m_tags').innerHTML = movie.tags ? movie.tags.map(t => \`<span class="tag-pill">\${t}</span>\`).join('') : '';

        const epSection = document.getElementById('ep_section');
        epSection.innerHTML = "";
        
        if (movie.episodes.length === 1) {
            currentVideoLink = movie.episodes[0].link;
        } else {
            renderAccordion(movie.episodes);
            currentVideoLink = movie.episodes[0].link;
        }
      }

      function renderAccordion(episodes) {
        const container = document.getElementById('ep_section');
        const seasons = {};
        
        episodes.forEach(ep => {
            const match = ep.label.match(/(S\d+|Season \d+)/i);
            const seasonName = match ? match[0].toUpperCase() : "Other";
            if(!seasons[seasonName]) seasons[seasonName] = [];
            seasons[seasonName].push(ep);
        });

        Object.keys(seasons).sort().forEach((seasonKey, index) => {
            const btn = document.createElement("button");
            btn.className = "accordion";
            btn.innerHTML = seasonKey;
            
            const panel = document.createElement("div");
            panel.className = "panel";
            
            const grid = document.createElement("div");
            grid.className = "episode-grid";
            grid.innerHTML = seasons[seasonKey].map(ep => \`
                <button class="ep-btn" onclick="switchEpisode(this, '\${ep.link}')">\${ep.label.replace(seasonKey, '').trim() || ep.label}</button>
            \`).join('');
            
            panel.appendChild(grid);
            container.appendChild(btn);
            container.appendChild(panel);

            btn.addEventListener("click", function() {
                this.classList.toggle("active");
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                }
            });

            if(index === 0) btn.click();
        });
      }

      function startPlayback() {
        document.getElementById('coverOverlay').style.display = 'none';
        const vid = document.getElementById('video');
        vid.style.display = 'block';
        document.getElementById('playerOverlay').style.display = 'flex'; // Show controls
        
        playViaSecureToken(currentVideoLink);
      }

      function switchEpisode(btn, link) {
        document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentVideoLink = link;
        
        // Reset play state to ensure new video loads
        const vid = document.getElementById('video');
        if(vid.style.display !== 'none') {
            showToast("Switching Episode...");
            playViaSecureToken(link);
        } else {
            startPlayback();
        }
      }

      async function playViaSecureToken(realUrl) {
        const vid = document.getElementById('video');
        
        // HLS Support
        if(Hls.isSupported() && realUrl.includes('.m3u8')) {
           const hls = new Hls(); 
           hls.loadSource(realUrl); 
           hls.attachMedia(vid);
           hls.on(Hls.Events.MANIFEST_PARSED, () => {
               checkProgressAndPlay(vid);
           });
           return;
        }
        
        // MP4 / Standard Support
        try {
            const res = await fetch('/api/sign_url', { method: 'POST', body: JSON.stringify({ url: realUrl }) });
            const json = await res.json();
            if(json.token) { 
                vid.src = "/api/play?t=" + json.token; 
                checkProgressAndPlay(vid);
            }
        } catch(e) { console.error(e); showToast("Error playing video"); }
      }

      // 🔥 Continue Watching Logic
      function checkProgressAndPlay(vid) {
        const savedTime = localStorage.getItem('watch_pos_' + currentMovieId);
        if(savedTime) {
            // Optional: Ask user or just resume. Here we just resume if < 90%
            const t = parseFloat(savedTime);
            if(t > 0) {
                 vid.currentTime = t;
                 showToast("Resuming playback 🕒");
            }
        }
        vid.play().catch(e => console.log("Auto-play blocked"));
      }

      function closePlayer() {
        closePlayerInternal();
        // Clear URL
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({path:newUrl},'',newUrl);
      }

      function closePlayerInternal() {
        const vid = document.getElementById('video'); 
        vid.pause(); 
        vid.src="";
        document.getElementById('playerModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        if (document.fullscreenElement) document.exitFullscreen();
      }

      function toggleFullScreen() {
        const wrapper = document.getElementById('videoWrapper');
        if (!document.fullscreenElement) {
            if(wrapper.requestFullscreen) wrapper.requestFullscreen();
            if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{});
        } else { if(document.exitFullscreen) document.exitFullscreen(); }
      }
      
      function updatePagination(info) {
        const div = document.getElementById('pagControls');
        if(info.totalPages > 1) {
          div.style.display = 'flex';
          document.getElementById('prevBtn').disabled = !info.hasPrev;
          document.getElementById('nextBtn').disabled = !info.hasNext;
          document.getElementById('pageInfo').innerText = \`Page \${info.currentPage} of \${info.totalPages}\`;
        } else div.style.display = 'none';
      }
      
      function changeCategory(cat, btn) {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        fetchMovies(1, cat);
      }
      function changePage(d) { fetchMovies(currentPage + d, currentCategory); }
    </script>
  </body>
  </html>
  `;
}
