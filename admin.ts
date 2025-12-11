export function renderAdmin() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Admin Panel</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: 'Segoe UI', sans-serif; padding: 15px; max-width: 900px; margin: 0 auto; background: #121212; color: #ddd; }
      
      input, select, textarea { width: 100%; padding: 10px; margin: 5px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 4px; box-sizing: border-box; outline: none; }
      input:focus, textarea:focus { border-color: #e50914; }
      label { font-size: 12px; color: #aaa; font-weight: bold; margin-top: 8px; display: block; }
      
      button { padding: 10px; border: none; font-weight: bold; cursor: pointer; border-radius: 4px; transition: 0.2s; width:100%; margin-top:5px; }
      .btn-green { background: #e50914; color: white; }
      .btn-blue { background: #007bff; color: white; }
      .btn-gray { background: #333; color: #ccc; }
      .btn-del { background: #dc3545; color: white; width: auto; padding: 5px 10px; font-size: 12px; }

      .season-box { background: #1e1e1e; border: 1px solid #333; padding: 15px; border-radius: 8px; margin-bottom: 15px; position: relative; border-left: 4px solid #e50914; }
      .remove-season { position: absolute; top: 10px; right: 10px; background: transparent; color: #666; font-size: 18px; cursor: pointer; width: auto; padding: 0; }
      
      .main-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
      @media (min-width: 768px) { .main-grid { grid-template-columns: 1.3fr 0.7fr; } }
      .card-box { background: #181818; padding: 20px; border-radius: 8px; border: 1px solid #333; }
      
      .item { display: flex; align-items: center; padding: 8px; border-bottom: 1px solid #333; background: #222; margin-bottom: 4px; }
      .item img { width: 35px; height: 50px; object-fit: cover; margin-right: 10px; }
      
      .tabs { display: flex; border-bottom: 2px solid #333; margin-bottom: 10px; }
      .tab { flex: 1; padding: 10px; text-align: center; cursor: pointer; color: #777; }
      .tab.active { color: #e50914; border-bottom: 2px solid #e50914; }

      #toast { visibility: hidden; min-width: 200px; background-color: #333; color: #fff; text-align: center; border-radius: 4px; padding: 12px; position: fixed; z-index: 100; left: 50%; bottom: 30px; transform: translateX(-50%); border: 1px solid #555; }
      #toast.show { visibility: visible; animation: fadein 0.5s, fadeout 0.5s 2.5s; }
      @keyframes fadein { from {bottom: 0; opacity: 0;} to {bottom: 30px; opacity: 1;} }
      @keyframes fadeout { from {bottom: 30px; opacity: 1;} to {bottom: 0; opacity: 0;} }
    </style>
  </head>
  <body>
    <div id="toast">Notification</div>

    <div id="loginScreen" style="max-width:300px; margin:100px auto; text-align:center;">
      <h2 style="color:#e50914">Admin</h2>
      <input type="password" id="passwordInput" placeholder="Password">
      <button class="btn-green" onclick="login()">Login</button>
    </div>

    <div id="dashboard" style="display:none;">
      <div class="main-grid">
        
        <div class="card-box">
          <div style="display:flex; justify-content:space-between;">
             <h2 id="formTitle" style="margin:0;">🎬 Upload</h2>
             <button onclick="resetForm()" style="width:auto; font-size:12px;" class="btn-gray">Clear</button>
          </div>
          <hr style="border:0; border-top:1px solid #333; margin:10px 0;">

          <input type="hidden" id="editId">
          <label>Title</label>
          <input type="text" id="title" placeholder="Movie/Series Title">
          
          <div style="display:flex; gap:10px;">
            <div style="flex:1"> <label>Poster</label> <input type="text" id="image" placeholder="Vertical URL"> </div>
            <div style="flex:1"> <label>Cover</label> <input type="text" id="cover" placeholder="Horizontal URL"> </div>
          </div>

          <label>Category</label>
          <div style="display:flex; gap:10px;">
              <select id="category" style="flex:1;">
                <option value="movies">Movie</option>
                <option value="series">Series</option>
                <option value="18+">18+</option>
              </select>
              <input type="text" id="tags" placeholder="Tags (2024, Action)" style="flex:2;">
          </div>
          
          <label>Description</label>
          <textarea id="desc" rows="2"></textarea>

          <div id="seasonsContainer" style="margin-top:20px;"></div>

          <button onclick="addSeasonBox()" class="btn-blue" style="margin-bottom:10px;">+ Add Season / Group</button>
          <button onclick="submitData()" id="submitBtn" class="btn-green" style="margin-top:15px;">Upload Content</button>
        </div>

        <div class="card-box">
           <input type="text" id="searchList" placeholder="🔍 Search..." onkeyup="filterList()">
           <div class="tabs">
              <div class="tab active" onclick="switchTab('all', this)">All</div>
              <div class="tab" onclick="switchTab('movies', this)">Mov</div>
              <div class="tab" onclick="switchTab('series', this)">Ser</div>
           </div>
           <div id="contentList" style="max-height:600px; overflow-y:auto;"></div>
        </div>
      </div>
    </div>

    <script>
      let adminPass = "";
      let currentList = [];

      window.onload = () => {
        if(localStorage.getItem("adminPass")) { 
            document.getElementById('passwordInput').value = localStorage.getItem("adminPass"); 
            login(); 
        }
      };

      function login() {
        adminPass = document.getElementById('passwordInput').value;
        if(!adminPass) return alert("Password needed");
        localStorage.setItem("adminPass", adminPass);
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        loadList('all');
        addSeasonBox();
      }

      function addSeasonBox(name = "", links = "") {
        const container = document.getElementById('seasonsContainer');
        const count = container.children.length + 1;
        const defaultName = name || (document.getElementById('category').value === 'movies' ? 'Movie' : \`Season \${count}\`);
        
        const div = document.createElement('div');
        div.className = 'season-box';
        div.innerHTML = \`
            <button class="remove-season" onclick="this.parentElement.remove()">×</button>
            <label>Group Name (e.g. Season 1)</label>
            <input type="text" class="s-name" value="\${defaultName}">
            <label>Links (Auto-generates Ep 1, 2... split by comma or newline)</label>
            <textarea class="s-links" rows="3" placeholder="https://link1, https://link2...">\${links}</textarea>
        \`;
        container.appendChild(div);
      }

      function showToast(msg) {
        const x = document.getElementById("toast");
        x.innerText = msg;
        x.className = "show";
        setTimeout(() => x.className = x.className.replace("show", ""), 3000);
      }

      async function submitData() {
        const title = document.getElementById('title').value;
        if(!title) return showToast("Title required!");

        const episodeList = [];
        const seasonBoxes = document.querySelectorAll('.season-box');
        
        seasonBoxes.forEach(box => {
            const groupName = box.querySelector('.s-name').value;
            const rawText = box.querySelector('.s-links').value;
            const links = rawText.split(/[\\n,]+/).map(l => l.trim()).filter(l => l);
            
            links.forEach((link, index) => {
                let label = "";
                let finalLink = link;

                if(link.includes('|')) {
                    const parts = link.split('|');
                    label = parts[0].trim();
                    finalLink = parts[1].trim();
                } else {
                    if(groupName.toLowerCase() === 'movie') {
                        label = "Movie";
                    } else {
                        // Create structured label "Season 1 Ep 1"
                        label = \`\${groupName} Ep \${index + 1}\`; 
                    }
                }
                episodeList.push({ label: label, link: finalLink });
            });
        });

        if(episodeList.length === 0) return showToast("No links added!");

        const data = {
          id: document.getElementById('editId').value || null,
          title: title,
          image: document.getElementById('image').value,
          cover: document.getElementById('cover').value,
          description: document.getElementById('desc').value,
          category: document.getElementById('category').value,
          tags: document.getElementById('tags').value.split(',').filter(t=>t),
          episodes: episodeList
        };

        const res = await fetch('/api/add', { method: 'POST', body: JSON.stringify({ password: adminPass, data }) });
        if(res.ok) { showToast("Saved!"); resetForm(); loadList('all'); }
      }

      function editItem(item) {
        document.getElementById('editId').value = item.id;
        document.getElementById('title').value = item.title;
        document.getElementById('image').value = item.image;
        document.getElementById('cover').value = item.cover || "";
        document.getElementById('desc').value = item.description || "";
        document.getElementById('category').value = item.category;
        document.getElementById('tags').value = item.tags ? item.tags.join(',') : "";

        const container = document.getElementById('seasonsContainer');
        container.innerHTML = "";
        
        // Re-Group Episodes logic
        const groups = {};
        if(item.episodes) {
            item.episodes.forEach(ep => {
                let groupName = "Movie";
                let linkText = ep.link;

                // Try to parse "Season X" from label
                const match = ep.label.match(/^(Season \\d+|S\\d+|Movie)/i);
                if(match) {
                    groupName = match[0].replace('S', 'Season '); // Normalize
                    if(!ep.label.includes('Ep ') && ep.label !== groupName) {
                        linkText = \`\${ep.label} | \${ep.link}\`;
                    }
                } else {
                    // Custom group fallback
                    groupName = "Extras"; 
                    linkText = \`\${ep.label} | \${ep.link}\`;
                }

                if(!groups[groupName]) groups[groupName] = [];
                groups[groupName].push(linkText);
            });
        }

        Object.keys(groups).forEach(name => {
            addSeasonBox(name, groups[name].join('\\n'));
        });
        
        // If empty (legacy data), add default
        if(Object.keys(groups).length === 0) addSeasonBox();
        window.scrollTo(0,0);
      }

      function resetForm() {
        document.getElementById('editId').value = "";
        document.getElementById('title').value = "";
        document.getElementById('image').value = "";
        document.getElementById('cover').value = "";
        document.getElementById('desc').value = "";
        document.getElementById('tags').value = "";
        document.getElementById('seasonsContainer').innerHTML = "";
        addSeasonBox();
      }
      
      async function loadList(cat) {
        document.getElementById('contentList').innerHTML = '<p style="text-align:center; padding:10px;">Loading...</p>';
        try {
            const res = await fetch(\`/api/movies?page=1&cat=\${cat}\`);
            const json = await res.json();
            currentList = json.data;
            renderList(currentList);
        } catch(e) {
            document.getElementById('contentList').innerHTML = '<p style="color:red; text-align:center;">Error loading list</p>';
        }
      }

      function renderList(data) {
        // 🔥 FIXED: Added checks for missing episodes
        if(!data || data.length === 0) {
            document.getElementById('contentList').innerHTML = '<p style="text-align:center; padding:10px;">Empty</p>';
            return;
        }
        document.getElementById('contentList').innerHTML = data.map(m => \`
          <div class="item">
            <img src="\${m.image}" onerror="this.src='https://via.placeholder.com/50'">
            <div style="flex:1"><b>\${m.title}</b><br><small>\${m.episodes ? m.episodes.length : 0} Videos</small></div>
            <button class="btn-del" onclick="editItem(\${JSON.stringify(m).replace(/'/g, "&#39;")})">Edit</button>
            <button class="btn-del" onclick="del('\${m.id}')" style="margin-left:5px;">Del</button>
          </div>
        \`).join('');
      }
      
      function filterList() {
          const q = document.getElementById('searchList').value.toLowerCase();
          renderList(currentList.filter(m => m.title.toLowerCase().includes(q)));
      }
      
      async function del(id) {
          if(confirm("Delete?")) await fetch('/api/delete', { method:'POST', body:JSON.stringify({password:adminPass, id})});
          loadList('all');
      }
      function switchTab(cat, btn) { loadList(cat); }
    </script>
  </body>
  </html>
  `;
}
