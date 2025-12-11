// ui.ts
export function renderWebsite() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Movie App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <style>
      body { background: #121212; color: #e0e0e0; font-family: sans-serif; margin:0; padding-bottom: 60px; }
      header { background: #181818; padding: 10px; position: sticky; top:0; z-index:50; text-align: center; border-bottom: 2px solid #e50914; }
      
      .nav-btn { background: transparent; color: #aaa; border: 1px solid #333; padding: 6px 12px; margin: 0 2px; border-radius: 20px; cursor: pointer; font-size: 13px; }
      .nav-btn.active { background: #e50914; color: white; border-color: #e50914; }
      
      .container { max-width: 900px; margin: 0 auto; padding: 10px; }
      
      /* 3 Columns Layout */
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      @media (min-width: 800px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }

      .card { background: #222; border-radius: 6px; overflow: hidden; cursor: pointer; transition: 0.2s; position: relative; }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; display: block; }
      
      .title { padding: 8px 5px; font-size: 11px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }
      @media (min-width: 600px) { .title { font-size: 14px; } }

      .pagination { display: flex; justify-content: center; gap: 15px; margin-top: 30px; align-items: center; }
      .page-btn { padding: 8px 16px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer; }
      .page-btn:disabled { opacity: 0.3; }

      /* Modal */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,1); z-index:100; overflow-y: auto; }
      .modal-content { width: 100%; max-width: 800px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #000; }
      .video-wrapper { position: relative; width: 100%; background: #000; position: sticky; top: 0; z-index: 10; }
      video { width: 100%; max-height: 80vh; background: black; display: block; }
      .controls-bar { padding: 10px; display: flex; justify-content: space-between; background: #181818; }
      .close-btn { padding: 5px 15px; background: #333; color: white; border:none; border-radius: 4px; cursor: pointer; }
      .fs-btn { padding: 5px 15px; background: #e50914; color: white; border:none; border-radius: 4px; cursor: pointer; }

      .info-sec { padding: 15px; }
      h2.movie-title { margin: 0 0 10px 0; color: #fff; font-size: 18px; }
      p.movie-desc { color: #bbb; font-size: 14px; line-height: 1.5; margin-bottom: 20px; background: #222; padding: 10px; border-radius: 5px; border-left: 3px solid #e50914; white-space: pre-wrap; }

      .review-sec { background: #111; padding-top: 20px; border-top: 1px solid #333; }
      .review-sec input, .review-sec textarea { width: 100%; padding: 10px; margin-bottom: 10px; background: #222; color: white; border: 1px solid #444; box-sizing: border-box; }
      .review-sec button { width: 100%; background: #444; color: white; padding: 10px; border: none; cursor: pointer; }
      .review-item { border-bottom: 1px solid #333; padding: 10px 0; }
      .r-user { color: #e50914; font-weight: bold; font-size: 13px; }
      .r-text { font-size: 13px; color: #ddd; margin-top: 4px; }
    </style>
  </head>
  <body>
    <header>
      <button class="nav-btn active" onclick="changeCategory('all', this)">All</button>
      <button class="nav-btn" onclick="changeCategory('movies', this)">Movies</button>
      <button class="nav-btn" onclick="changeCategory('series', this)">Series</button>
      <button class="nav-btn" onclick="changeCategory('18+', this)" style="color:#ff5555">18+</button>
    </header>

    <div class="container">
      <div class="grid" id="grid"><p style="text-align:center;">Loading...</p></div>
      <div class="pagination" id="pagControls" style="display:none;">
        <button class="page-btn" id="prevBtn" onclick="changePage(-1)">Prev</button>
        <span id="pageInfo" style="color:#888; font-size: 12px;">Page 1</span>
        <button class="page-btn" id="nextBtn" onclick="changePage(1)">Next</button>
      </div>
    </div>

    <div id="playerModal">
      <div class="modal-content">
        <div class="video-wrapper">
            <video id="video" controls playsinline></video>
            <div class="controls-bar">
                <button class="close-btn" onclick="closePlayer()">Close ❌</button>
                <button class="fs-btn" onclick="toggleFullScreen()">Full Screen ⛶</button>
            </div>
        </div>
        <div class="info-sec">
          <h2 id="m_title" class="movie-title"></h2>
          <p id="m_desc" class="movie-desc"></p>
          <div class="review-sec">
            <h3>Reviews</h3>
            <input type="text" id="r_user" placeholder="Name (Optional)">
            <textarea id="r_text" placeholder="Write a comment..." rows="2"></textarea>
            <button onclick="postReview()">Submit</button>
            <div id="reviewList" style="margin-top:20px;"></div>
          </div>
        </div>
      </div>
    </div>

    <script>
      let currentPage = 1, currentCategory = 'all', currentMovieId = null, allMoviesData = [];
      fetchMovies(1, 'all');

      async function fetchMovies(page, cat) {
        document.getElementById('grid').innerHTML = '<p>Loading...</p>';
        const res = await fetch(\`/api/movies?page=\${page}&cat=\${cat}\`);
        const json = await res.json();
        allMoviesData = json.data;

        const grid = document.getElementById('grid');
        if(json.data.length === 0) grid.innerHTML = '<p>No movies.</p>';
        else grid.innerHTML = json.data.map((m, i) => \`
          <div class="card" onclick="play(\${i})">
            <img src="\${m.image}" onerror="this.src='https://via.placeholder.com/200x300'">
            <div class="title">\${m.title}</div>
          </div>\`).join('');

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

      function play(index) {
        const movie = allMoviesData[index];
        currentMovieId = movie.id;
        document.getElementById('playerModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        document.getElementById('m_title').innerText = movie.title;
        document.getElementById('m_desc').innerText = movie.description || "No description.";
        
        const vid = document.getElementById('video');
        if(Hls.isSupported() && movie.link.includes('.m3u8')) {
          const hls = new Hls(); hls.loadSource(movie.link); hls.attachMedia(vid);
          hls.on(Hls.Events.MANIFEST_PARSED, () => vid.play());
        } else { vid.src = movie.link; vid.play(); }
        loadReviews(movie.id);
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
            if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
        }
      }

      async function loadReviews(id) {
        const list = document.getElementById('reviewList');
        list.innerHTML = 'Loading...';
        const res = await fetch('/api/get_reviews?id='+id);
        const json = await res.json();
        list.innerHTML = json.length ? json.map(r => \`
          <div class="review-item"><div class="r-user">\${r.user} <span style="font-size:10px; color:#666; float:right">\${r.date}</span></div><div class="r-text">\${r.text}</div></div>
        \`).join('') : '<p style="color:#666; font-size:12px;">No reviews yet.</p>';
      }

      async function postReview() {
        const user = document.getElementById('r_user').value || "Anonymous";
        const text = document.getElementById('r_text').value;
        if(!text) return;
        await fetch('/api/add_review', { method:'POST', body: JSON.stringify({ movieId: currentMovieId, user, text }) });
        document.getElementById('r_text').value = "";
        loadReviews(currentMovieId);
      }
    </script>
  </body>
  </html>
  `;
}
