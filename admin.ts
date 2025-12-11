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
      label { font-size: 12px; color: #aaa; font-weight: bold; margin-top: 8px; display: block; }
      button { padding: 10px; border: none; font-weight: bold; cursor: pointer; border-radius: 4px; transition: 0.2s; width:100%; margin-top:5px; }
      .btn-green { background: #e50914; color: white; }
      .btn-blue { background: #007bff; color: white; }
      .season-box { background: #1e1e1e; border: 1px solid #333; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #e50914; position:relative; }
      .remove-season { position: absolute; top: 5px; right: 10px; background: transparent; color: red; width: auto; }
      .main-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
      @media (min-width: 768px) { .main-grid { grid-template-columns: 1.3fr 0.7fr; } }
      .card-box { background: #181818; padding: 20px; border-radius: 8px; border: 1px solid #333; }
      .item { display: flex; align-items: center; padding: 8px; border-bottom: 1px solid #333; background: #222; margin-bottom: 4px; }
      .item img { width: 35px; height: 50px; object-fit: cover; margin-right: 10px; }
      
      /* 🔥 PREMIUM TOGGLE */
      .prem-toggle { display: flex; align-items: center; gap: 10px; background: #333; padding: 10px; border-radius: 4px; margin-top: 5px; }
      .prem-toggle input { width: auto; margin: 0; }
    </style>
  </head>
  <body>
    <div id="loginScreen" style="max-width:300px; margin:100px auto; text-align:center;">
      <h2 style="color:#e50914">Admin</h2>
      <input type="password" id="passwordInput" placeholder="Password">
      <button class="btn-green" onclick="login()">Login</button>
    </div>

    <div id="dashboard" style="display:none;">
      <div style="background:#222; padding:10px; margin-bottom:20px; border-radius:8px; display:flex; gap:10px; align-items:center;">
         <span style="color:#ffd700; font-weight:bold;">👑 VIP System:</span>
         <button class="btn-blue" style="width:auto; margin:0;" onclick="genCode(30)">Gen 30-Day Code</button>
         <input type="text" id="outCode" readonly style="width:150px; margin:0; text-align:center; color:#ffd700;" placeholder="Code appears here">
      </div>

      <div class="main-grid">
        <div class="card-box">
          <h2 style="margin:0;">🎬 Upload</h2>
          <button onclick="resetForm()" style="width:auto; float:right; margin-top:-30px;">Clear</button>
          <hr style="border:0; border-top:1px solid #333; margin:10px 0;">

          <input type="hidden" id="editId">
          <label>Title</label><input type="text" id="title">
          <div style="display:flex; gap:10px;">
            <div style="flex:1"><label>Poster</label><input type="text" id="image"></div>
            <div style="flex:1"><label>Cover</label><input type="text" id="cover"></div>
          </div>
          <label>Category</label>
          <div style="display:flex; gap:10px;">
              <select id="category" style="flex:1;"><option value="movies">Movie</option><option value="series">Series</option><option value="18+">18+</option></select>
              <input type="text" id="tags" placeholder="Tags" style="flex:2;">
          </div>
          
          <div class="prem-toggle">
              <input type="checkbox" id="isPremium">
              <span style="color:#ffd700; font-weight:bold;">Is Premium Content? (Crown)</span>
          </div>

          <label>Download Link</label><input type="text" id="dl_link">
          <label>Description</label><textarea id="desc" rows="2"></textarea>
          <div id="seasonsContainer" style="margin-top:20px;"></div>
          <button onclick="addSeasonBox()" class="btn-blue" style="margin-bottom:10px;">+ Add Season</button>
          <button onclick="submitData()" class="btn-green">Save</button>
        </div>

        <div class="card-box">
           <input type="text" id="searchList" placeholder="Search..." onkeyup="filterList()">
           <div id="contentList" style="max-height:600px; overflow-y:auto; margin-top:10px;"></div>
        </div>
      </div>
    </div>

    <script>
      let adminPass = "", currentList = [];
      window.onload = () => { if(localStorage.getItem("adminPass")) { document.getElementById('passwordInput').value = localStorage.getItem("adminPass"); login(); } };

      function login() {
        adminPass = document.getElementById('passwordInput').value;
        if(!adminPass) return alert("Required");
        localStorage.setItem("adminPass", adminPass);
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        loadList('all'); addSeasonBox();
      }

      async function genCode(days) {
          const res = await fetch('/api/gen_code', { method:'POST', body:JSON.stringify({ password: adminPass, days }) });
          const json = await res.json();
          document.getElementById('outCode').value = json.code;
      }

      function addSeasonBox(name="", links="") {
        const div = document.createElement('div'); div.className = 'season-box';
        div.innerHTML = \`<button class="remove-season" onclick="this.parentElement.remove()">×</button>
            <label>Group Name</label><input type="text" class="s-name" value="\${name||'Season '+(document.querySelectorAll('.season-box').length+1)}">
            <label>Links</label><textarea class="s-links" rows="3">\${links}</textarea>\`;
        document.getElementById('seasonsContainer').appendChild(div);
      }

      async function submitData() {
        const seasonBoxes = document.querySelectorAll('.season-box');
        const episodeList = [];
        seasonBoxes.forEach(box => {
            const group = box.querySelector('.s-name').value;
            const lines = box.querySelector('.s-links').value.split(/[\\n,]+/).filter(x=>x.trim());
            lines.forEach((l, i) => {
                let label = \`\${group} Ep \${i+1}\`;
                let link = l.trim();
                if(l.includes('|')) { const p = l.split('|'); label = p[0].trim(); link = p[1].trim(); }
                if(group.toLowerCase() === 'movie') label = "Movie";
                episodeList.push({ label, link });
            });
        });

        const data = {
          id: document.getElementById('editId').value || null,
          title: document.getElementById('title').value,
          image: document.getElementById('image').value,
          cover: document.getElementById('cover').value,
          description: document.getElementById('desc').value,
          category: document.getElementById('category').value,
          downloadLink: document.getElementById('dl_link').value,
          tags: document.getElementById('tags').value.split(',').filter(t=>t),
          isPremium: document.getElementById('isPremium').checked, // 🔥 Save Premium Status
          episodes: episodeList
        };

        await fetch('/api/add', { method:'POST', body:JSON.stringify({ password: adminPass, data }) });
        alert("Saved!"); resetForm(); loadList('all');
      }

      function startEdit(id) {
          const m = currentList.find(x => x.id === id);
          if(!m) return;
          document.getElementById('editId').value = m.id;
          document.getElementById('title').value = m.title;
          document.getElementById('image').value = m.image;
          document.getElementById('cover').value = m.cover||"";
          document.getElementById('desc').value = m.description;
          document.getElementById('category').value = m.category;
          document.getElementById('dl_link').value = m.downloadLink||"";
          document.getElementById('tags').value = (m.tags||[]).join(',');
          document.getElementById('isPremium').checked = m.isPremium || false; // 🔥 Load Premium

          const con = document.getElementById('seasonsContainer'); con.innerHTML = "";
          const groups = {};
          (m.episodes||[]).forEach(ep => {
              let g = "Movie";
              const match = ep.label.match(/^(Season \\d+|S\\d+|Movie)/i);
              if(match) g = match[0].replace('S', 'Season ');
              if(!groups[g]) groups[g] = [];
              groups[g].push(ep.label.includes('|') ? \`\${ep.label}|\${ep.link}\` : ep.link);
          });
          Object.keys(groups).forEach(g => addSeasonBox(g, groups[g].join('\\n')));
          if(Object.keys(groups).length===0) addSeasonBox();
      }

      function resetForm() {
          document.querySelectorAll('input, textarea').forEach(i => i.value = "");
          document.getElementById('isPremium').checked = false;
          document.getElementById('seasonsContainer').innerHTML = "";
          addSeasonBox();
      }

      async function loadList(cat) {
          const res = await fetch(\`/api/movies?page=1&cat=\${encodeURIComponent(cat)}\`);
          const json = await res.json();
          currentList = json.data || [];
          document.getElementById('contentList').innerHTML = currentList.map(m => \`
            <div class="item">
                <img src="\${m.image}">
                <div style="flex:1">
                    <b>\${m.title}</b> \${m.isPremium ? '👑' : ''}<br>
                    <small>\${m.category}</small>
                </div>
                <button class="btn-blue" style="width:auto; margin-right:5px;" onclick="startEdit('\${m.id}')">Edit</button>
                <button class="btn-del" onclick="del('\${m.id}')">Del</button>
            </div>\`).join('');
      }
      
      async function del(id) {
          if(confirm("Delete?")) {
              await fetch('/api/delete', { method:'POST', body:JSON.stringify({ password: adminPass, id }) });
              loadList('all');
          }
      }
      function filterList() { /* Basic filter logic same as before */ }
    </script>
  </body>
  </html>
  `;
}
