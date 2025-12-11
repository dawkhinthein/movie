import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// 🔥 PASSWORD ကို Environment Variable ကနေ ယူမယ်
// (Deno မှာ မထည့်ထားရင် default အနေနဲ့ "12345" ဖြစ်နေမယ်)
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") || "12345";

const ITEMS_PER_PAGE = 15;
const kv = await Deno.openKv();

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // 1️⃣ Website
  if (path === "/") {
    return new Response(renderWebsite(), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // 2️⃣ Admin Panel
  if (path === "/admin") {
    return new Response(renderAdmin(), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // 3️⃣ API System
  if (path === "/api/movies" && req.method === "GET") {
    const pageParam = url.searchParams.get("page") || "1";
    const category = url.searchParams.get("cat") || "all";
    const page = parseInt(pageParam);

    const entries = kv.list({ prefix: ["movies"] });
    let allMovies = [];
    for await (const entry of entries) allMovies.push(entry.value);

    allMovies.reverse(); // Latest first

    if (category !== "all") {
      allMovies = allMovies.filter(m => m.category === category);
    }

    const totalMovies = allMovies.length;
    const totalPages = Math.ceil(totalMovies / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedMovies = allMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return new Response(JSON.stringify({
      data: paginatedMovies,
      currentPage: page,
      totalPages: totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }), { headers: { "content-type": "application/json" } });
  }

  if (path === "/api/add" && req.method === "POST") {
    const body = await req.json();
    if (body.password !== ADMIN_PASSWORD) return new Response("Wrong Password", { status: 403 });
    const id = Date.now().toString();
    await kv.set(["movies", id], { id, ...body.data });
    return new Response("Success");
  }

  if (path === "/api/delete" && req.method === "POST") {
    const body = await req.json();
    if (body.password !== ADMIN_PASSWORD) return new Response("Wrong Password", { status: 403 });
    await kv.delete(["movies", body.id]);
    
    // Delete reviews too
    const reviews = kv.list({ prefix: ["reviews", body.id] });
    for await (const r of reviews) await kv.delete(r.key);
    
    return new Response("Deleted");
  }

  // Reviews API
  if (path === "/api/get_reviews") {
    const movieId = url.searchParams.get("id");
    const entries = kv.list({ prefix: ["reviews", movieId] });
    const reviews = [];
    for await (const entry of entries) reviews.push(entry.value);
    return new Response(JSON.stringify(reviews.reverse()), { headers: { "content-type": "application/json" } });
  }

  if (path === "/api/add_review" && req.method === "POST") {
    const body = await req.json();
    if (!body.movieId || !body.text) return new Response("Missing Data", { status: 400 });
    const reviewId = Date.now().toString();
    await kv.set(["reviews", body.movieId, reviewId], {
      user: body.user || "Anonymous",
      text: body.text,
      date: new Date().toLocaleDateString()
    });
    return new Response("Added");
  }

  return new Response("Not Found", { status: 404 });
});

// ==========================================
// 🎨 WEBSITE UI
// ==========================================
function renderWebsite() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Movie App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <style>
      body { background: #121212; color: #e0e0e0; font-family: sans-serif; margin:0; padding-bottom: 60px; }
      header { background: #181818; padding: 15px; position: sticky; top:0; z-index:50; text-align: center; border-bottom: 2px solid #e50914; }
      .nav-btn { background: transparent; color: #aaa; border: 1px solid #333; padding: 8px 16px; margin: 0 4px; border-radius: 20px; cursor: pointer; }
      .nav-btn.active { background: #e50914; color: white; border-color: #e50914; }
      
      .container { max-width: 800px; margin: 0 auto; padding: 20px; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
      @media (max-width: 400px) { .grid { grid-template-columns: repeat(2, 1fr); } }

      .card { background: #222; border-radius: 8px; overflow: hidden; cursor: pointer; transition: 0.2s; }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; }
      .title { padding: 10px; font-size: 13px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      .pagination { display: flex; justify-content: center; gap: 20px; margin-top: 30px; }
      .page-btn { padding: 10px 20px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer; }
      .page-btn:disabled { opacity: 0.3; }

      /* Modal */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:100; overflow-y: auto; }
      .modal-content { width: 95%; max-width: 800px; margin: 20px auto; display: flex; flex-direction: column; align-items: center; }
      video { width: 100%; border-radius: 8px; background: black; }
      .close-btn { margin: 10px 0 20px 0; padding: 8px 20px; background: #333; color: white; border:none; border-radius: 5px; cursor: pointer; }

      /* Reviews */
      .review-sec { width: 100%; background: #222; padding: 15px; border-radius: 10px; margin-top: 15px; box-sizing: border-box; }
      .review-sec input, .review-sec textarea { width: 100%; padding: 10px; margin-bottom: 10px; background: #333; color: white; border: none; }
      .review-sec button { width: 100%; background: #e50914; color: white; padding: 10px; border: none; cursor: pointer; }
      .review-item { border-bottom: 1px solid #444; padding: 10px 0; }
      .r-user { color: #e50914; font-weight: bold; font-size: 14px; }
      .r-text { font-size: 13px; color: #ddd; margin-top: 5px; }
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
      <div class="grid" id="grid"><p style="grid-column:span 3; text-align:center;">Loading...</p></div>
      <div class="pagination" id="pagControls" style="display:none;">
        <button class="page-btn" id="prevBtn" onclick="changePage(-1)">Prev</button>
        <span id="pageInfo" style="color:#888;">Page 1</span>
        <button class="page-btn" id="nextBtn" onclick="changePage(1)">Next</button>
      </div>
    </div>

    <div id="playerModal">
      <div class="modal-content">
        <button class="close-btn" onclick="closePlayer()">Close X</button>
        <video id="video" controls playsinline></video>
        
        <div class="review-sec">
          <h3>Reviews</h3>
          <input type="text" id="r_user" placeholder="Name">
          <textarea id="r_text" placeholder="Comment..." rows="2"></textarea>
          <button onclick="postReview()">Submit</button>
          <div id="reviewList" style="margin-top:20px;"></div>
        </div>
      </div>
    </div>

    <script>
      let currentPage = 1, currentCategory = 'all', currentMovieId = null;
      fetchMovies(1, 'all');

      async function fetchMovies(page, cat) {
        document.getElementById('grid').innerHTML = '<p style="text-align:center; grid-column:span 3;">Loading...</p>';
        const res = await fetch(\`/api/movies?page=\${page}&cat=\${cat}\`);
        const json = await res.json();
        
        const grid = document.getElementById('grid');
        if(json.data.length === 0) grid.innerHTML = '<p style="text-align:center; grid-column:span 3;">No movies.</p>';
        else grid.innerHTML = json.data.map(m => \`
          <div class="card" onclick="play('\${m.id}', '\${m.link}')">
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
          document.getElementById('pageInfo').innerText = \`Page \${info.currentPage}\`;
        } else div.style.display = 'none';
      }

      function changeCategory(cat, btn) {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        fetchMovies(1, cat);
      }
      function changePage(d) { fetchMovies(currentPage + d, currentCategory); }

      function play(id, url) {
        currentMovieId = id;
        document.getElementById('playerModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        const vid = document.getElementById('video');
        
        if(Hls.isSupported() && url.includes('.m3u8')) {
          const hls = new Hls(); hls.loadSource(url); hls.attachMedia(vid);
          hls.on(Hls.Events.MANIFEST_PARSED, () => vid.play());
        } else { vid.src = url; vid.play(); }
        
        loadReviews(id);
      }

      function closePlayer() {
        const vid = document.getElementById('video'); vid.pause(); vid.src="";
        document.getElementById('playerModal').style.display = 'none';
        document.body.style.overflow = 'auto';
      }

      async function loadReviews(id) {
        const list = document.getElementById('reviewList');
        list.innerHTML = 'Loading...';
        const res = await fetch('/api/get_reviews?id='+id);
        const json = await res.json();
        list.innerHTML = json.length ? json.map(r => \`
          <div class="review-item"><div class="r-user">\${r.user} <span style="font-size:10px; color:#666; float:right">\${r.date}</span></div><div class="r-text">\${r.text}</div></div>
        \`).join('') : '<p style="color:#666; text-align:center">No reviews yet.</p>';
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

// ==========================================
// 🔐 ADMIN UI (No Hardcoded Password)
// ==========================================
function renderAdmin() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Admin</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background: #eee; }
      input, select, button { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
      button { background: #28a745; color: white; border: none; font-weight: bold; cursor: pointer; }
      .item { background: white; padding: 10px; margin-bottom: 5px; border-radius: 5px; display:flex; justify-content:space-between; align-items:center;}
      .del { background: #dc3545; width: auto; padding: 5px 10px; }
    </style>
  </head>
  <body>
    <h2>Upload Movie</h2>
    <input type="password" id="password" placeholder="Enter Admin Password">
    <hr>
    <input type="text" id="title" placeholder="Title">
    <input type="text" id="image" placeholder="Image URL">
    <input type="text" id="link" placeholder="Video Link (m3u8/mp4)">
    <select id="category">
      <option value="movies">Movies</option>
      <option value="series">Series</option>
      <option value="18+">18+</option>
    </select>
    <button onclick="add()">Upload</button>

    <h3>Recent (Page 1)</h3>
    <div id="list">Loading...</div>

    <script>
      async function load() {
        const res = await fetch('/api/movies?page=1');
        const json = await res.json();
        document.getElementById('list').innerHTML = json.data.map(m => \`
          <div class="item"><div><b>\${m.title}</b> <small>(\${m.category})</small></div><button class="del" onclick="del('\${m.id}')">Del</button></div>
        \`).join('');
      }

      async function add() {
        const pass = document.getElementById('password').value;
        const data = {
          title: document.getElementById('title').value,
          image: document.getElementById('image').value,
          link: document.getElementById('link').value,
          category: document.getElementById('category').value
        };
        if(!data.title) return alert("Missing Title");

        const res = await fetch('/api/add', { method: 'POST', body: JSON.stringify({ password: pass, data }) });
        if(res.ok) { alert("Uploaded!"); load(); document.getElementById('title').value=""; document.getElementById('link').value=""; }
        else alert("❌ Wrong Password!");
      }

      async function del(id) {
        if(!confirm("Delete?")) return;
        const pass = document.getElementById('password').value;
        const res = await fetch('/api/delete', { method: 'POST', body: JSON.stringify({ password: pass, id }) });
        if(res.ok) load(); else alert("❌ Wrong Password!");
      }
      load();
    </script>
  </body>
  </html>
  `;
}
