export function renderWebsite() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>My Streaming App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <style>
      body { background: #121212; color: #e0e0e0; font-family: sans-serif; margin:0; padding-bottom: 60px; }
      
      /* Header & Search */
      header { background: #181818; padding: 10px; position: sticky; top:0; z-index:50; border-bottom: 2px solid #e50914; display:flex; flex-direction: column; align-items: center; gap: 10px; }
      .nav-row { display:flex; gap:5px; flex-wrap:wrap; justify-content:center; }
      .nav-btn { background: #333; color: #aaa; border: none; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight:bold;}
      .nav-btn.active { background: #e50914; color: white; }
      
      .search-box { width: 90%; max-width: 400px; display: flex; position: relative; }
      .search-input { width: 100%; padding: 8px 15px; border-radius: 20px; border: 1px solid #444; background: #222; color: white; outline: none; }
      .search-icon { position: absolute; right: 10px; top: 8px; color: #888; }

      .container { max-width: 1000px; margin: 0 auto; padding: 10px; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
      @media (min-width: 600px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 15px; } }
      @media (min-width: 900px) { .grid { grid-template-columns: repeat(5, 1fr); } }

      .card { background: #222; border-radius: 6px; overflow: hidden; cursor: pointer; position: relative; }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; }
      .title { padding: 6px; font-size: 11px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }
      .card-tag { position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.8); color: #ffd700; font-size: 9px; padding: 2px 5px; border-radius: 3px; }

      .pagination { display: flex; justify-content: center; gap: 15px; margin-top: 30px; }
      .page-btn { padding: 8px 16px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer; }
      
      /* Modal & Player */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:black; z-index:100; overflow-y: auto; }
      .modal-content { width: 100%; max-width: 900px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }
      .video-area { position: sticky; top: 0; z-index: 10; background:black; width: 100%; aspect-ratio: 16/9; position: relative; }
      
      .cover-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; }
      .play-btn-circle { width: 60px; height: 60px; background: rgba(229, 9, 20, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(0,0,0,0.5); transition: 0.2s; }
      .play-btn-circle::after { content: '▶'; color: white; font-size: 24px; margin-left: 4px; }
      .cover-overlay:hover .play-btn-circle { transform: scale(1.1); background: #f00; }

      video { width: 100%; height: 100%; background: black; display: none; }
      .controls { padding: 10px; background: #1a1a1a; display: flex; justify-content: space-between; }
      .btn-icon { background: #333; color: white; border:none; padding: 5px 12px; border-radius: 4px; cursor: pointer; }

      .info-sec { padding: 20px; }
      h2 { margin: 0; color: #fff; font-size: 18px; }
      .tags-row { margin: 10px 0; display: flex; gap: 5px; flex-wrap: wrap; }
      .tag-pill { background: #333; color: #aaa; font-size: 11px; padding: 3px 8px; border-radius: 10px; }
      p.desc { color: #bbb; font-size: 14px; line-height: 1.5; white-space: pre-wrap; margin-top: 10px;}
      
      /* 🔥 NEW ACCORDION SERIES UI */
      .accordion { background-color: #222; color: #eee; cursor: pointer; padding: 12px; width: 100%; border: none; text-align: left; outline: none; font-size: 15px; font-weight: bold; transition: 0.4s; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; margin-top: 5px; border-radius: 4px; }
      .accordion.active, .accordion:hover { background-color: #333; color: #e50914; }
      .accordion:after { content: '\\002B'; color: #777; font-weight: bold; float: right; margin-left: 5px; }
      .accordion.active:after { content: "\\2212"; }
      
      .panel { padding: 0 10px; background-color: #111; max-height: 0; overflow: hidden; transition: max-height 0.2s ease-out; }
      .episode-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 8px; padding: 15px 0; }
      
      .ep-btn { background: #222; border: 1px solid #444; color: #ddd; padding: 8px; cursor: pointer; border-radius: 4px; text-align: center; font-size: 12px; }
      .ep-btn:hover { background: #444; }
      .ep-btn.active { background: #e50914; border-color: #e50914; color: white; }

    </style>
  </head>
  <body>
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
      <div class="grid" id="grid"><p style="text-align:center;">Loading...</p></div>
      <div class="pagination" id="pagControls" style="display:none;">
        <button class="page-btn" id="prevBtn" onclick="changePage(-1)">Prev</button>
        <span id="pageInfo" style="color:#888; font-size: 12px;"></span>
        <button class="page-btn" id="nextBtn" onclick="changePage(1)">Next</button>
      </div>
    </div>

    <div id="playerModal">
      <div class="modal-content">
        <div class="video-area">
            <div id="coverOverlay" class="cover-overlay" onclick="startPlayback()">
                <div class="play-btn-circle"></div>
            </div>
            <video id="video" controls playsinline controlsList="nodownload"></video>
        </div>
        
        <div class="controls">
            <button class="btn-icon" onclick="closePlayer()">❌ Close</button>
            <button class="btn-icon" onclick="toggleFullScreen()">⛶ Full</button>
        </div>
        
        <div class="info-sec">
          <h2 id="m_title"></h2>
          <div class="tags-row" id="m_tags"></div>
          
          <div id="ep_section" style="margin-top:20px;"></div> <p id="m_desc" class="desc"></p>
        </div>
      </div>
    </div>

    <script>
      let currentPage = 1, currentCategory = 'all', allMoviesData = [];
      let currentVideoLink = "";

      // 🔥 Initial Load Logic (Check URL for ID)
      window.onload = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');

        if (movieId) {
            // User refreshed on a movie page -> Fetch single movie & open
            await fetchSingleMovie(movieId);
        } else {
            // Normal Load
            fetchMovies(1, 'all');
        }
      };

      async function fetchMovies(page, cat) {
        document.getElementById('grid').innerHTML = '<p>Loading...</p>';
        const res = await fetch(\`/api/movies?page=\${page}&cat=\${cat}\`);
        const json = await res.json();
        allMoviesData = json.data; // Stores current page data
        renderGrid(json.data);
        updatePagination(json);
        currentPage = json.currentPage;
        currentCategory = cat;
      }

      function renderGrid(data) {
        const grid = document.getElementById('grid');
        if(data.length === 0) grid.innerHTML = '<p>No contents.</p>';
        else grid.innerHTML = data.map((m) => {
          const tagHtml = m.tags && m.tags.length > 0 ? \`<div class="card-tag">\${m.tags[0]}</div>\` : '';
          // We pass the full object ID to openModal
          return \`<div class="card" onclick="openModalById('\${m.id}')"><img src="\${m.image}" onerror="this.src='https://via.placeholder.com/200x300'">\${tagHtml}<div class="title">\${m.title}</div></div>\`;
        }).join('');
      }

      // 🔥 SEARCH LOGIC
      async function handleSearch(e) {
        if (e.key === 'Enter') {
            const query = document.getElementById('searchInput').value;
            if(!query) return fetchMovies(1, 'all');
            
            document.getElementById('grid').innerHTML = '<p>Searching...</p>';
            document.getElementById('pagControls').style.display = 'none'; // Hide pagination for search
            
            const res = await fetch(\`/api/search?q=\${encodeURIComponent(query)}\`);
            const results = await res.json();
            
            // Store results in global var so we can open them
            allMoviesData = results; 
            renderGrid(results);
        }
      }

      // 🔥 FETCH SINGLE & OPEN (For Refresh)
      async function fetchSingleMovie(id) {
        // Hide grid initially
        document.getElementById('playerModal').style.display = 'block';
        
        const res = await fetch(\`/api/get_movie?id=\${id}\`);
        const movie = await res.json();
        
        if (movie && movie.title) {
            setupModal(movie);
            // Also load background grid
            fetchMovies(1, 'all');
        } else {
            alert("Movie not found");
            window.location.href = "/";
        }
      }

      function openModalById(id) {
        // Find movie in currently loaded data
        const movie = allMoviesData.find(m => m.id === id);
        if(movie) {
            // Update URL without reloading
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?id=' + id;
            window.history.pushState({path:newUrl},'',newUrl);
            
            setupModal(movie);
        }
      }

      function setupModal(movie) {
        const modal = document.getElementById('playerModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        document.getElementById('m_title').innerText = movie.title;
        document.getElementById('m_desc').innerText = movie.description || "";
        
        // Setup Cover
        const coverDiv = document.getElementById('coverOverlay');
        const coverUrl = movie.cover || movie.image;
        coverDiv.style.backgroundImage = \`url('\${coverUrl}')\`;
        coverDiv.style.display = 'flex';
        document.getElementById('video').style.display = 'none';
        document.getElementById('video').pause();
        
        document.getElementById('m_tags').innerHTML = movie.tags ? movie.tags.map(t => \`<span class="tag-pill">\${t}</span>\`).join('') : '';

        // 🔥 ACCORDION EPISODES
        const epSection = document.getElementById('ep_section');
        epSection.innerHTML = ""; // Clear
        
        if (movie.episodes.length === 1) {
            // Single Movie
            currentVideoLink = movie.episodes[0].link;
        } else {
            // Series
            renderAccordion(movie.episodes);
            currentVideoLink = movie.episodes[0].link;
        }
      }

      function renderAccordion(episodes) {
        const container = document.getElementById('ep_section');
        const seasons = {};
        
        // Group by Season
        episodes.forEach(ep => {
            const match = ep.label.match(/(S\d+|Season \d+)/i);
            const seasonName = match ? match[0].toUpperCase() : "Other";
            if(!seasons[seasonName]) seasons[seasonName] = [];
            seasons[seasonName].push(ep);
        });

        // Create HTML for each season
        Object.keys(seasons).sort().forEach((seasonKey, index) => {
            // Button
            const btn = document.createElement("button");
            btn.className = "accordion";
            btn.innerHTML = seasonKey;
            
            // Panel
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

            // Add Click Event
            btn.addEventListener("click", function() {
                this.classList.toggle("active");
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                }
            });

            // Open first season by default
            if(index === 0) btn.click();
        });
      }

      function startPlayback() {
        document.getElementById('coverOverlay').style.display = 'none';
        const vid = document.getElementById('video');
        vid.style.display = 'block';
        playViaSecureToken(currentVideoLink);
      }

      function switchEpisode(btn, link) {
        document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentVideoLink = link;
        if(document.getElementById('video').style.display !== 'none') playViaSecureToken(link);
        else startPlayback();
      }

      async function playViaSecureToken(realUrl) {
        const vid = document.getElementById('video');
        if(Hls.isSupported() && realUrl.includes('.m3u8')) {
           const hls = new Hls(); hls.loadSource(realUrl); hls.attachMedia(vid);
           hls.on(Hls.Events.MANIFEST_PARSED, () => vid.play());
           return;
        }
        try {
            const res = await fetch('/api/sign_url', { method: 'POST', body: JSON.stringify({ url: realUrl }) });
            const json = await res.json();
            if(json.token) { vid.src = "/api/play?t=" + json.token; vid.play(); }
        } catch(e) { console.error(e); }
      }

      function closePlayer() {
        const vid = document.getElementById('video'); vid.pause(); vid.src="";
        document.getElementById('playerModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Clear URL param on close
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({path:newUrl},'',newUrl);
        
        if (document.fullscreenElement) document.exitFullscreen();
      }

      function toggleFullScreen() {
        const wrapper = document.querySelector('.video-area');
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
          document.getElementById('pageInfo').innerText = \`\${info.currentPage}/\${info.totalPages}\`;
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
