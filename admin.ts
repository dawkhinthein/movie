export function renderAdmin() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Admin Panel</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: 'Segoe UI', sans-serif; padding: 15px; max-width: 900px; margin: 0 auto; background: #121212; color: #ddd; }
      
      /* Login */
      .login-box { max-width: 320px; margin: 80px auto; text-align: center; background: #1e1e1e; padding: 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
      .hidden { display: none !important; }
      
      /* Inputs */
      input, select, textarea { width: 100%; padding: 12px; margin: 6px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 6px; box-sizing: border-box; outline: none; transition: 0.3s; }
      input:focus, textarea:focus { border-color: #e50914; background: #333; }
      label { font-size: 12px; color: #aaa; font-weight: bold; margin-top: 10px; display: block; }

      /* Buttons */
      button { width: 100%; padding: 12px; border: none; font-weight: bold; cursor: pointer; border-radius: 6px; font-size: 14px; margin-top: 5px; transition: 0.2s; }
      .btn-green { background: #e50914; color: white; } 
      .btn-green:hover { background: #ff0f1f; }
      
      .action-row { display: flex; gap: 5px; }
      .btn-sm { padding: 5px 10px; font-size: 12px; width: auto; }
      .btn-edit { background: #007bff; color: white; }
      .btn-del { background: #dc3545; color: white; }

      /* Layout */
      .main-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
      @media (min-width: 768px) { .main-grid { grid-template-columns: 1.2fr 0.8fr; } }

      .card-box { background: #1e1e1e; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); border: 1px solid #333; }
      
      .tabs { display: flex; border-bottom: 2px solid #333; margin-bottom: 10px; }
      .tab { flex: 1; padding: 10px; text-align: center; cursor: pointer; color: #777; font-weight: bold; }
      .tab.active { color: #e50914; border-bottom: 2px solid #e50914; }

      .list-scroll { max-height: 600px; overflow-y: auto; }
      .item { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #333; background: #252525; margin-bottom: 5px; border-radius: 4px; }
      .item img { width: 40px; height: 60px; object-fit: cover; margin-right: 12px; border-radius: 4px; background: #000; }
      .item-info { flex: 1; }
      .item-title { color: white; font-size: 14px; font-weight: bold; }
      .item-meta { color: #888; font-size: 11px; }

      /* Live Preview */
      .preview-area { text-align: center; margin-bottom: 20px; background: #121212; padding: 15px; border-radius: 8px; border: 1px dashed #444; }
      .preview-card { width: 140px; background: #222; border-radius: 6px; overflow: hidden; margin: 0 auto; position: relative; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
      .preview-img { width: 100%; height: 210px; object-fit: cover; display: block; background: #333; }
      .preview-title { padding: 8px; font-size: 12px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }
      .preview-tag { position: absolute; top: 5px; right: 5px; background: rgba(229, 9, 20, 0.9); color: #fff; font-size: 9px; padding: 2px 5px; border-radius: 3px; }

      #toast { visibility: hidden; min-width: 200px; background-color: #333; color: #fff; text-align: center; border-radius: 4px; padding: 12px; position: fixed; z-index: 100; left: 50%; bottom: 30px; transform: translateX(-50%); border: 1px solid #555; }
      #toast.show { visibility: visible; animation: fadein 0.5s, fadeout 0.5s 2.5s; }
      @keyframes fadein { from {bottom: 0; opacity: 0;} to {bottom: 30px; opacity: 1;} }
      @keyframes fadeout { from {bottom: 30px; opacity: 1;} to {bottom: 0; opacity: 0;} }
    </style>
  </head>
  <body>
    <div id="toast">Notification</div>

    <div id="loginScreen" class="login-box">
      <h2 style="color:#e50914">Admin Access</h2>
      <input type="password" id="passwordInput" placeholder="Enter Password">
      <button class="btn-green" onclick="login()">Unlock Dashboard</button>
    </div>

    <div id="dashboard" class="hidden">
      <div class="main-grid">
        <div class="card-box">
          <div style="display:flex; justify-content:space-between; align-items:center;">
             <h2 id="formTitle" style="margin:0;">🎬 Upload New</h2>
             <button onclick="resetForm()" style="width:auto; padding:5px 10px; font-size:12px; background:#444;">Clear</button>
          </div>
          <hr style="border:0; border-top:1px solid #333; margin:15px 0;">

          <input type="hidden" id="editId">
          <label>Title</label>
          <input type="text" id="title" placeholder="Movie Name" oninput="updatePreview()">
          
          <div style="display:flex; gap:10px;">
            <div style="flex:1"> <label>Poster (Vertical)</label> <input type="text" id="image" placeholder="https://..." oninput="updatePreview()"> </div>
            <div style="flex:1"> <label>Cover (Horizontal)</label> <input type="text" id="cover" placeholder="https://..."> </div>
          </div>

          <label>Category & Tags</label>
          <div style="display:flex; gap:10px;">
              <select id="category" style="flex:1;">
                <option value="movies">Movie</option>
                <option value="series">Series</option>
                <option value="18+">18+</option>
              </select>
              <input type="text" id="tags" placeholder="e.g. Action, 2024" style="flex:2;" oninput="updatePreview()">
          </div>

          <label>Description</label>
          <textarea id="desc" rows="2" placeholder="Synopsis..."></textarea>
          
          <div style="background: #252525; padding: 10px; border-radius: 6px; margin-top: 10px; border: 1px dashed #444;">
              <label style="margin-top:0; color:#e50914;">⚡ Video Links</label>
              <p style="font-size:11px; color:#888; margin: 5px 0;">
                <b>For Seasons:</b> Type "Season 1" then paste links below it.<br>
                Example:<br>
                Season 1<br>
                https://link1<br>
                Season 2<br>
                https://link2
              </p>
              <textarea id="links" rows="6" placeholder="Paste links here..." style="font-family: monospace; font-size:12px; white-space: pre;"></textarea>
          </div>
          
          <button onclick="submitData()" id="submitBtn" class="btn-green">Upload Content</button>
        </div>

        <div>
           <div class="preview-area">
              <label style="margin-bottom:10px;">Live Preview</label>
              <div class="preview-card">
                  <img id="prev_img" src="https://via.placeholder.com/150x225?text=Preview" class="preview-img">
                  <div id="prev_tag" class="preview-tag hidden">TAG</div>
                  <div id="prev_title" class="preview-title">Title Here</div>
              </div>
           </div>

           <div class="card-box" style="padding:10px;">
              <input type="text" id="searchList" placeholder="🔍 Search uploads..." onkeyup="filterList()" style="margin-bottom:10px;">
              <div class="tabs">
                  <div class="tab active" onclick="switchTab('all', this)">All</div>
                  <div class="tab" onclick="switchTab('movies', this)">Mov</div>
                  <div class="tab" onclick="switchTab('series', this)">Ser</div>
                  <div class="tab" onclick="switchTab('18+', this)">18+</div>
              </div>
              <div class="list-scroll" id="contentList"> <p style="text-align:center; color:#555;">Loading...</p> </div>
           </div>
        </div>
      </div>
    </div>

    <script>
      let adminPass = "";
      let currentList = [];

      window.onload = () => {
        const savedPass = localStorage.getItem("adminPass");
        if(savedPass) { document.getElementById('passwordInput').value = savedPass; login(); }
      };

      function showToast(msg) {
        const x = document.getElementById("toast");
        x.innerText = msg;
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
      }

      function updatePreview() {
        const title = document.getElementById('title').value || "Title Here";
        const img = document.getElementById('image').value;
        const tags = document.getElementById('tags').value;
        
        document.getElementById('prev_title').innerText = title;
        document.getElementById('prev_img').src = img || "https://via.placeholder.com/150x225?text=No+Image";
        const tagEl = document.getElementById('prev_tag');
        if(tags) { tagEl.innerText = tags.split(',')[0]; tagEl.classList.remove('hidden'); } 
        else { tagEl.classList.add('hidden'); }
      }

      function login() {
        const pass = document.getElementById('passwordInput').value;
        if(!pass) return showToast("Enter password");
        adminPass = pass;
        localStorage.setItem("adminPass", pass);
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        loadList('all');
      }

      async function loadList(cat) {
        document.getElementById('contentList').innerHTML = '<p style="text-align:center;">Loading...</p>';
        try {
            const res = await fetch(\`/api/movies?page=1&cat=\${cat}\`); 
            const json = await res.json();
            currentList = json.data; 
            renderList(currentList);
        } catch(e) { showToast("Connection Error"); }
      }

      function renderList(data) {
        const container = document.getElementById('contentList');
        if(data.length === 0) { container.innerHTML = "<p style='text-align:center; padding:10px;'>Empty</p>"; return; }
        
        container.innerHTML = data.map(m => \`
          <div class="item">
            <img src="\${m.image}" onerror="this.src='https://via.placeholder.com/50'">
            <div class="item-info">
                <div class="item-title">\${m.title}</div>
                <div class="item-meta">\${m.category} • \${m.episodes ? m.episodes.length + ' Eps' : '1 Ep'}</div>
            </div>
            <div class="action-row">
                <button class="btn-sm btn-edit" onclick='editItem(\${JSON.stringify(m).replace(/'/g, "&#39;")})'>✏️</button>
                <button class="btn-sm btn-del" onclick="del('\${m.id}')">🗑️</button>
            </div>
          </div>\`).join('');
      }

      function filterList() {
        const query = document.getElementById('searchList').value.toLowerCase();
        const filtered = currentList.filter(m => m.title.toLowerCase().includes(query));
        renderList(filtered);
      }

      function switchTab(cat, btn) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        loadList(cat);
      }

      function editItem(item) {
        document.getElementById('formTitle').innerText = "✏️ Editing";
        document.getElementById('submitBtn').innerText = "Update";
        document.getElementById('submitBtn').style.background = "#007bff";
        
        document.getElementById('editId').value = item.id;
        document.getElementById('title').value = item.title;
        document.getElementById('image').value = item.image;
        document.getElementById('cover').value = item.cover || "";
        document.getElementById('desc').value = item.description || "";
        document.getElementById('category').value = item.category;
        document.getElementById('tags').value = item.tags ? item.tags.join(', ') : "";
        
        // Reconstruct Links with Season Headers
        let linkText = "";
        let lastSeason = "";
        
        item.episodes.forEach(ep => {
            // Check if label has "S1" or "Season 1"
            const match = ep.label.match(/^(S\d+|Season \d+)/i);
            const currentSeason = match ? match[0] : "";
            
            if (currentSeason && currentSeason !== lastSeason) {
                linkText += "\\n" + currentSeason.replace("S", "Season ") + "\\n";
                lastSeason = currentSeason;
            }
            
            if(ep.label === "Movie") linkText += ep.link + "\\n";
            else {
                // If it's a series link, we just output the link, 
                // because the Header logic will rebuild labels on save
                linkText += ep.link + "\\n";
            }
        });

        document.getElementById('links').value = linkText.trim();
        updatePreview();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      function resetForm() {
        document.getElementById('formTitle').innerText = "🎬 Upload New";
        document.getElementById('submitBtn').innerText = "Upload Content";
        document.getElementById('submitBtn').style.background = "#e50914";
        document.getElementById('editId').value = "";
        document.getElementById('title').value = "";
        document.getElementById('image').value = "";
        document.getElementById('cover').value = "";
        document.getElementById('desc').value = "";
        document.getElementById('tags').value = "";
        document.getElementById('links').value = "";
        updatePreview();
      }

      // 🔥 UPDATED LOGIC FOR SEASONS
      async function submitData() {
        const rawLinks = document.getElementById('links').value.trim();
        const category = document.getElementById('category').value;
        const isSeries = category === 'series';
        
        if(!rawLinks) return showToast("Please add video links!");
        if(!document.getElementById('title').value) return showToast("Title required!");

        const lines = rawLinks.split('\\n').map(l => l.trim()).filter(l => l);
        const episodes = [];
        
        let currentSeasonPrefix = "Episode"; // Default
        let epCounter = 1;

        lines.forEach(line => {
            // 1. Check if line is a Header (e.g., "Season 1", "S2")
            // Regex checks for "Season X" or "SX"
            const seasonMatch = line.match(/^(Season|S)\s*(\d+)$/i);
            
            if (seasonMatch) {
                // It's a header! Update prefix (e.g., "S1") and reset counter
                currentSeasonPrefix = "S" + seasonMatch[2];
                epCounter = 1;
                return; // Skip this line, it's just a label
            }

            // 2. Check for Manual Pipe (Label | Link)
            if (line.includes('|')) {
                const parts = line.split('|');
                episodes.push({ label: parts[0].trim(), link: parts[1].trim() });
            } else {
                // 3. Auto-Labeling
                if (isSeries) {
                    // If we saw "Season 1", label becomes "S1 E1"
                    // If no header seen yet, label is "Episode 1"
                    let label = "";
                    if (currentSeasonPrefix === "Episode") label = \`Episode \${epCounter}\`;
                    else label = \`\${currentSeasonPrefix} E\${epCounter}\`;
                    
                    episodes.push({ label: label, link: line });
                    epCounter++;
                } else {
                    episodes.push({ label: "Movie", link: line });
                }
            }
        });

        const data = {
          id: document.getElementById('editId').value || null,
          title: document.getElementById('title').value,
          image: document.getElementById('image').value,
          cover: document.getElementById('cover').value,
          description: document.getElementById('desc').value,
          category: category,
          tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t),
          episodes: episodes
        };

        const btn = document.getElementById('submitBtn');
        btn.innerText = "Processing...";
        btn.disabled = true;

        try {
            const res = await fetch('/api/add', { method: 'POST', body: JSON.stringify({ password: adminPass, data }) });
            if(res.ok) { 
                showToast("Success! Saved."); 
                resetForm(); 
                loadList('all'); 
            } else { showToast("Error saving data."); }
        } catch(e) { showToast("Network Error"); }
        
        btn.innerText = "Upload Content";
        btn.disabled = false;
      }

      async function del(id) {
        if(!confirm("Delete this?")) return;
        try {
            const res = await fetch('/api/delete', { method: 'POST', body: JSON.stringify({ password: adminPass, id }) });
            if(res.ok) { showToast("Deleted"); loadList(document.querySelector('.tab.active').innerText.toLowerCase()); }
        } catch(e) { showToast("Error deleting"); }
      }
    </script>
  </body>
  </html>
  `;
}
