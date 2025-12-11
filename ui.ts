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
      
      header { background: #181818; padding: 10px; position: sticky; top:0; z-index:50; border-bottom: 2px solid #e50914; display:flex; justify-content:center; gap:5px; flex-wrap:wrap;}
      .nav-btn { background: #333; color: #aaa; border: none; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight:bold;}
      .nav-btn.active { background: #e50914; color: white; }
      
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
      
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:black; z-index:100; overflow-y: auto; }
      .modal-content { width: 100%; max-width: 900px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }
      
      .video-area { position: sticky; top: 0; z-index: 10; background:black; width: 100%; aspect-ratio: 16/9; position: relative; }
      
      /* Cover & Play Button */
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
    </style>
  </head>
  <body>
    <header>
      <button class="nav-btn active" onclick="changeCategory('all', this)">All</button>
      <button class="nav-btn" onclick="changeCategory('movies', this)">Movies</button>
      <button class="nav-btn" onclick="changeCategory('series', this)">Series</button>
      <button class="nav-btn" onclick="changeCategory('18+', this)">18+</button>
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
          
          <div id="ep_section" style="margin-top:20px; display:none;">
            <div style="font-weight:bold; color:#e50914; margin-bottom:10px;">Episodes:</div>
            <div id="ep_list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px;"></div>
          </div>

          <p id="m_desc" class="desc"></p>
        </div>
      </div>
    </div>

    <script>
      let currentPage = 1, currentCategory = 'all', allMoviesData = [];
      let currentVideoLink = "";

      fetchMovies(1, 'all');

      async function fetchMovies(page, cat) {
        document.getElementById('grid').innerHTML = '<p>Loading...</p>';
        const res = await fetch(\`/api/movies?page=\${page}&cat=\${cat}\`);
        const json = await res.json();
        allMoviesData = json.data;
        const grid = document.getElementById('grid');
        
        if(json.data.length === 0) grid.innerHTML = '<p>No contents.</p>';
        else grid.innerHTML = json.data.map((m, i) => {
          const tagHtml = m.tags && m.tags.length > 0 ? \`<div class="card-tag">\${m.tags[0]}</div>\` : '';
          return \`<div class="card" onclick="openModal(\${i})"><img src="\${m.image}" onerror="this.src='https://via.placeholder.com/200x300'">\${tagHtml}<div class="title">\${m.title}</div></div>\`;
        }).join('');
        
        updatePagination(json);
        currentPage = json.currentPage;
        currentCategory = cat;
        window.scrollTo(0,0);
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

      function openModal(index) {
        const movie = allMoviesData[index];
        const modal = document.getElementById('playerModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        document.getElementById('m_title').innerText = movie.title;
        document.getElementById('m_desc').innerText = movie.description || "";
        
        // Show Cover, Hide Video
        const coverDiv = document.getElementById('coverOverlay');
        const coverUrl = movie.cover || movie.image;
        coverDiv.style.backgroundImage = \`url('\${coverUrl}')\`;
        coverDiv.style.display = 'flex';
        document.getElementById('video').style.display = 'none';
        document.getElementById('video').pause();
        
        document.getElementById('m_tags').innerHTML = movie.tags ? movie.tags.map(t => \`<span class="tag-pill">\${t}</span>\`).join('') : '';

        // Episodes setup
        const epSection = document.getElementById('ep_section');
        const epList = document.getElementById('ep_list');
        epList.innerHTML = "";
        
        if (movie.episodes.length === 1) {
            epSection.style.display = 'none';
            currentVideoLink = movie.episodes[0].link;
        } else {
            epSection.style.display = 'block';
            epList.innerHTML = movie.episodes.map(ep => \`
                <button style="background:#222; border:1px solid #444; color:white; padding:8px; cursor:pointer;" onclick="switchEpisode(this, '\${ep.link}')">\${ep.label}</button>
            \`).join('');
            currentVideoLink = movie.episodes[0].link; // Default first ep
        }
      }

      function startPlayback() {
        document.getElementById('coverOverlay').style.display = 'none';
        const vid = document.getElementById('video');
        vid.style.display = 'block';
        
        // 🔥 Call Secure Play
        playViaSecureToken(currentVideoLink);
      }

      function switchEpisode(btn, link) {
        currentVideoLink = link;
        // If video is already visible, play immediately. Else, wait for cover click.
        if(document.getElementById('video').style.display !== 'none') {
            playViaSecureToken(link);
        } else {
            startPlayback();
        }
      }

      // 🔥 SECURE TOKEN LOGIC (This is key!)
      async function playViaSecureToken(realUrl) {
        const vid = document.getElementById('video');

        // M3U8 (Direct Play with HLS)
        if(Hls.isSupported() && realUrl.includes('.m3u8')) {
           const hls = new Hls(); hls.loadSource(realUrl); hls.attachMedia(vid);
           hls.on(Hls.Events.MANIFEST_PARSED, () => vid.play());
           return;
        }

        // MP4: Request Token -> Then Play
        try {
            const res = await fetch('/api/sign_url', {
                method: 'POST',
                body: JSON.stringify({ url: realUrl }),
                headers: { 'Content-Type': 'application/json' }
            });
            const json = await res.json();
            
            if(json.token) {
                // Play using the secure token URL
                vid.src = "/api/play?t=" + json.token;
                vid.play();
            } else {
                alert("Error generating token");
            }
        } catch(e) {
            console.error("Token error", e);
        }
      }

      function closePlayer() {
        const vid = document.getElementById('video'); vid.pause(); vid.src="";
        document.getElementById('playerModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        if (document.fullscreenElement) document.exitFullscreen();
      }

      function toggleFullScreen() {
        const wrapper = document.querySelector('.video-area');
        if (!document.fullscreenElement) {
            if(wrapper.requestFullscreen) wrapper.requestFullscreen();
            if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{});
        } else {
            if(document.exitFullscreen) document.exitFullscreen();
        }
      }
    </script>
  </body>
  </html>
  `;
}
