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
      
      .container { max-width: 1000px; margin: 0 auto; padding: 15px; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      @media (min-width: 700px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }
      @media (min-width: 1000px) { .grid { grid-template-columns: repeat(5, 1fr); } }

      .card { background: #222; border-radius: 6px; overflow: hidden; cursor: pointer; transition: 0.2s; position: relative; }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; }
      .title { padding: 8px; font-size: 12px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }
      
      /* Tags on Card */
      .card-tag { position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.7); color: #ffd700; font-size: 10px; padding: 2px 5px; border-radius: 3px; }

      .pagination { display: flex; justify-content: center; gap: 15px; margin-top: 30px; }
      .page-btn { padding: 8px 16px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer; }
      .page-btn:disabled { opacity: 0.3; }

      /* Modal */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:black; z-index:100; overflow-y: auto; }
      .modal-content { width: 100%; max-width: 900px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }
      
      .video-wrapper { position: sticky; top: 0; z-index: 10; background:black;}
      video { width: 100%; max-height: 60vh; background: black; display: block; }
      
      .controls { padding: 10px; background: #1a1a1a; display: flex; justify-content: space-between; }
      .btn-icon { background: #333; color: white; border:none; padding: 5px 12px; border-radius: 4px; cursor: pointer; }

      .info-sec { padding: 20px; }
      h2 { margin: 0; color: #fff; font-size: 18px; }
      .tags-row { margin: 10px 0; display: flex; gap: 5px; flex-wrap: wrap; }
      .tag-pill { background: #333; color: #aaa; font-size: 11px; padding: 3px 8px; border-radius: 10px; }
      p.desc { color: #bbb; font-size: 14px; line-height: 1.5; white-space: pre-wrap; margin-top: 10px;}

      /* Series Episode Buttons */
      .episode-list { margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px; }
      .ep-btn { background: #222; border: 1px solid #444; color: white; padding: 10px; cursor: pointer; border-radius: 4px; text-align: center; font-size: 12px; }
      .ep-btn:hover, .ep-btn.active { background: #e50914; border-color: #e50914; font-weight: bold; }

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
        <div class="video-wrapper">
            <video id="video" controls playsinline poster="https://via.placeholder.com/800x450/000000/FFFFFF?text=Select+Episode"></video>
            <div class="controls">
                <button class="btn-icon" onclick="closePlayer()">❌ Close</button>
                <button class="btn-icon" onclick="toggleFullScreen()">⛶ Full</button>
            </div>
        </div>
        
        <div class="info-sec">
          <h2 id="m_title"></h2>
          <div class="tags-row" id="m_tags"></div>
          
          <div id="ep_section" style="display:none">
            <h4 style="color:#e50914; margin: 15px 0 5px 0;">Select Episode:</h4>
            <div class="episode-list" id="ep_list"></div>
          </div>

          <p id="m_desc" class="desc"></p>
        </div>
      </div>
    </div>

    <script>
      let currentPage = 1, currentCategory = 'all', allMoviesData = [];
      fetchMovies(1, 'all');

      async function fetchMovies(page, cat) {
        document.getElementById('grid').innerHTML = '<p>Loading...</p>';
        const res = await fetch(\`/api/movies?page=\${page}&cat=\${cat}\`);
        const json = await res.json();
        allMoviesData = json.data;

        const grid = document.getElementById('grid');
        if(json.data.length === 0) grid.innerHTML = '<p>No contents.</p>';
        else grid.innerHTML = json.data.map((m, i) => {
          // Show first tag on card if available
          const tagHtml = m.tags && m.tags.length > 0 ? \`<div class="card-tag">\${m.tags[0]}</div>\` : '';
          return \`
          <div class="card" onclick="openModal(\${i})">
            <img src="\${m.image}" onerror="this.src='https://via.placeholder.com/200x300'">
            \${tagHtml}
            <div class="title">\${m.title}</div>
          </div>\`;
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

      // 🔥 OPEN MODAL LOGIC
      function openModal(index) {
        const movie = allMoviesData[index];
        const modal = document.getElementById('playerModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        document.getElementById('m_title').innerText = movie.title;
        document.getElementById('m_desc').innerText = movie.description || "";
        
        // Render Tags
        const tagsDiv = document.getElementById('m_tags');
        tagsDiv.innerHTML = movie.tags ? movie.tags.map(t => \`<span class="tag-pill">\${t}</span>\`).join('') : '';

        // Render Episodes / Play Video
        const vid = document.getElementById('video');
        const epSection = document.getElementById('ep_section');
        const epList = document.getElementById('ep_list');

        if (movie.episodes.length === 1) {
            // Single Movie
            epSection.style.display = 'none';
            playVideo(movie.episodes[0].link);
        } else {
            // Series
            epSection.style.display = 'block';
            epList.innerHTML = movie.episodes.map((ep, idx) => \`
                <button class="ep-btn" onclick="playSeriesVideo(this, '\${ep.link}')">\${ep.label}</button>
            \`).join('');
            
            // Auto play first episode
            playVideo(movie.episodes[0].link);
            // Highlight first button
            if(epList.firstChild) epList.firstChild.classList.add('active');
        }
      }

      function playSeriesVideo(btn, link) {
        // Highlight active button
        document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        playVideo(link);
      }

      function playVideo(url) {
        const vid = document.getElementById('video');
        if(Hls.isSupported() && url.includes('.m3u8')) {
          const hls = new Hls(); hls.loadSource(url); hls.attachMedia(vid);
          hls.on(Hls.Events.MANIFEST_PARSED, () => vid.play());
        } else { vid.src = url; vid.play(); }
      }

      function closePlayer() {
        const vid = document.getElementById('video'); vid.pause(); vid.src="";
        document.getElementById('playerModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        if (document.fullscreenElement) document.exitFullscreen();
      }

      function toggleFullScreen() {
        const wrapper = document.querySelector('.video-wrapper');
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
