// admin.ts
export function renderAdmin() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Admin Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; background: #f4f4f4; }
      .login-box { max-width: 300px; margin: 50px auto; text-align: center; }
      .hidden { display: none; }
      input, select, button, textarea { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
      button { background: #28a745; color: white; border: none; font-weight: bold; cursor: pointer; }
      button.btn-blue { background: #007bff; }
      button.btn-red { background: #dc3545; width: auto; font-size: 12px; padding: 5px 10px; }
      button.btn-orange { background: #ffc107; color: black; width: auto; font-size: 12px; padding: 5px 10px; margin-right: 5px; }

      .form-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
      .list-container { margin-top: 20px; background: white; border-radius: 8px; overflow: hidden; height: 500px; display: flex; flex-direction: column; }
      .list-tabs { display: flex; background: #333; }
      .tab { flex: 1; padding: 12px; color: #aaa; text-align: center; cursor: pointer; background: #222; border-right: 1px solid #444; }
      .tab.active { background: white; color: black; font-weight: bold; }
      .list-scroll { flex: 1; overflow-y: auto; padding: 10px; }
      .item { display: flex; align-items: center; border-bottom: 1px solid #eee; padding: 8px; }
      .item img { width: 40px; height: 60px; object-fit: cover; margin-right: 10px; border-radius: 4px; }
      .item-info { flex: 1; }
    </style>
  </head>
  <body>

    <div id="loginScreen" class="login-box">
      <h2>🔐 Admin Login</h2>
      <input type="password" id="passwordInput" placeholder="Enter Password">
      <button onclick="login()">Login</button>
    </div>

    <div id="dashboard" class="hidden">
      <div class="form-card">
        <h2 id="formTitle">🎬 Upload New</h2>
        <input type="hidden" id="editId">
        
        <input type="text" id="title" placeholder="Movie Title">
        
        <div style="display:flex; gap:10px;">
            <input type="text" id="image" placeholder="Poster URL (Vertical)">
            <input type="text" id="cover" placeholder="Cover URL (Horizontal)">
        </div>

        <input type="text" id="tags" placeholder="Tags (e.g., 2025, Horror)">
        
        <div style="background: #e9ecef; padding: 10px; border-radius: 5px; margin: 10px 0;">
            <label style="font-size:12px; font-weight:bold; color:#555;">Video Links</label>
            <textarea id="links" style="height: 80px; font-family: monospace;" placeholder="S1 E1 | https://..."></textarea>
        </div>

        <textarea id="desc" placeholder="Synopsis..." style="height:60px;"></textarea>
        
        <select id="category">
          <option value="movies">Movies</option>
          <option value="series">Series</option>
          <option value="18+">18+</option>
        </select>
        
        <button onclick="submitData()" id="submitBtn">Upload Now</button>
        <button onclick="resetForm()" style="background:#6c757d; margin-top:5px;">Clear Form</button>
      </div>

      <div class="list-container">
        <div class="list-tabs">
            <div class="tab active" onclick="switchTab('all', this)">All</div>
            <div class="tab" onclick="switchTab('movies', this)">Movies</div>
            <div class="tab" onclick="switchTab('series', this)">Series</div>
            <div class="tab" onclick="switchTab('18+', this)">18+</div>
        </div>
        <div class="list-scroll" id="contentList"><p style="text-align:center;">Loading...</p></div>
      </div>
    </div>

    <script>
      let adminPass = "";
      window.onload = () => {
        const savedPass = localStorage.getItem("adminPass");
        if(savedPass) { document.getElementById('passwordInput').value = savedPass; login(); }
      };

      function login() {
        const pass = document.getElementById('passwordInput').value;
        if(!pass) return alert("Enter password");
        adminPass = pass;
        localStorage.setItem("adminPass", pass);
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        loadList('all');
      }

      async function loadList(cat) {
        document.getElementById('contentList').innerHTML = '<p style="text-align:center;">Loading...</p>';
        const res = await fetch(\`/api/movies?page=1&cat=\${cat}\`); 
        const json = await res.json();
        document.getElementById('contentList').innerHTML = json.data.map(m => \`
          <div class="item">
            <img src="\${m.image}" onerror="this.src='https://via.placeholder.com/50'">
            <div class="item-info"><strong>\${m.title}</strong><br><small>\${m.category}</small></div>
            <div><button class="btn-orange" onclick='editItem(\${JSON.stringify(m)})'>Edit</button><button class="btn-red" onclick="del('\${m.id}')">Del</button></div>
          </div>\`).join('');
      }

      function switchTab(cat, btn) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        loadList(cat);
      }

      function editItem(item) {
        document.getElementById('formTitle').innerText = "✏️ Edit";
        document.getElementById('submitBtn').innerText = "Update";
        document.getElementById('submitBtn').classList.add('btn-blue');
        document.getElementById('editId').value = item.id;
        document.getElementById('title').value = item.title;
        document.getElementById('image').value = item.image;
        document.getElementById('cover').value = item.cover || ""; // 🔥 Load Cover
        document.getElementById('desc').value = item.description || "";
        document.getElementById('category').value = item.category;
        document.getElementById('tags').value = item.tags ? item.tags.join(', ') : "";
        
        const linksText = item.episodes.map(ep => item.episodes.length === 1 && ep.label === "Movie" ? ep.link : \`\${ep.label} | \${ep.link}\`).join('\\n');
        document.getElementById('links').value = linksText;
        window.scrollTo(0,0);
      }

      function resetForm() {
        document.getElementById('formTitle').innerText = "🎬 Upload New";
        document.getElementById('submitBtn').innerText = "Upload Now";
        document.getElementById('submitBtn').classList.remove('btn-blue');
        document.getElementById('editId').value = "";
        document.getElementById('title').value = "";
        document.getElementById('image').value = "";
        document.getElementById('cover').value = ""; // Clear Cover
        document.getElementById('desc').value = "";
        document.getElementById('tags').value = "";
        document.getElementById('links').value = "";
      }

      async function submitData() {
        const rawLinks = document.getElementById('links').value.trim();
        if(!rawLinks) return alert("Add links");
        const episodes = rawLinks.split('\\n').map(line => {
            const parts = line.split('|');
            return parts.length > 1 ? { label: parts[0].trim(), link: parts[1].trim() } : { label: "Movie", link: line.trim() };
        });

        const data = {
          id: document.getElementById('editId').value || null,
          title: document.getElementById('title').value,
          image: document.getElementById('image').value,
          cover: document.getElementById('cover').value, // 🔥 Save Cover
          description: document.getElementById('desc').value,
          category: document.getElementById('category').value,
          tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t),
          episodes: episodes
        };

        const res = await fetch('/api/add', { method: 'POST', body: JSON.stringify({ password: adminPass, data }) });
        if(res.ok) { alert("Success!"); resetForm(); loadList(document.querySelector('.tab.active').innerText.toLowerCase()); }
        else { alert("Error"); }
      }

      async function del(id) {
        if(!confirm("Delete?")) return;
        const res = await fetch('/api/delete', { method: 'POST', body: JSON.stringify({ password: adminPass, id }) });
        if(res.ok) loadList(document.querySelector('.tab.active').innerText.toLowerCase());
      }
    </script>
  </body>
  </html>
  `;
}
