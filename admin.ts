export function renderAdmin() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Admin Panel</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: 'Segoe UI', sans-serif; padding: 15px; max-width: 900px; margin: 0 auto; background: #121212; color: #ddd; }
      
      input, select, textarea { width: 100%; padding: 12px; margin: 6px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 4px; box-sizing: border-box; outline: none; transition: 0.3s; }
      input:focus, textarea:focus { border-color: #e50914; background: #333; }
      label { font-size: 12px; color: #aaa; font-weight: bold; margin-top: 8px; display: block; }
      
      button { padding: 10px; border: none; font-weight: bold; cursor: pointer; border-radius: 4px; transition: 0.2s; width:100%; margin-top:5px; }
      .btn-green { background: #e50914; color: white; width:100%; margin-top:10px; }
      .btn-blue { background: #007bff; color: white; }
      .btn-gray { background: #333; color: #ccc; }
      .btn-del { background: #dc3545; color: white; width:auto; padding:5px 10px; font-size:12px; }

      .season-box { background: #222; border: 1px solid #444; padding: 15px; border-radius: 8px; margin-bottom: 15px; position: relative; border-left: 4px solid #e50914; }
      .remove-season { position: absolute; top: 10px; right: 10px; background: transparent; color: #ff4d4d; font-size: 18px; cursor: pointer; width: auto; padding: 0; }
      
      .main-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
      @media (min-width: 768px) { .main-grid { grid-template-columns: 1.4fr 0.6fr; } }
      .card-box { background: #181818; padding: 20px; border-radius: 8px; border: 1px solid #333; }
      
      .item { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #333; background: #252525; margin-bottom: 5px; border-radius: 4px; }
      .item img { width: 35px; height: 50px; object-fit: cover; margin-right: 10px; }
      
      /* 🔥 FIX: Category Tabs */
      .tabs { display: flex; border-bottom: 2px solid #333; margin-bottom: 15px; overflow-x:auto; }
      .tab { flex: 1; padding: 12px; text-align: center; cursor: pointer; color: #777; font-weight: bold; background: #1f1f1f; min-width:80px; }
      .tab.active { color: white; background: #e50914; }

      .vip-gen { background:#252525; padding:15px; margin-bottom:20px; border-radius:8px; display:flex; flex-wrap:wrap; gap:10px; align-items:center; border:1px solid #444; }
      .vip-input { width: 80px !important; margin: 0 !important; text-align: center; }

      #toast { visibility: hidden; min-width: 250px; background-color: #333; color: #fff; text-align: center; border-radius: 50px; padding: 16px; position: fixed; z-index: 100; left: 50%; bottom: 30px; transform: translateX(-50%); border: 1px solid #555; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
      #toast.show { visibility: visible; animation: fadein 0.5s, fadeout 0.5s 2.5s; }
      @keyframes fadein { from {bottom: 0; opacity: 0;} to {bottom: 30px; opacity: 1;} }
      @keyframes fadeout { from {bottom: 30px; opacity: 1;} to {bottom: 0; opacity: 0;} }
    </style>
  </head>
  <body>
    <div id="toast">Msg</div>

    <div id="loginScreen" style="max-width:350px; margin:80px auto; text-align:center; padding:30px; background:#1e1e1e; border-radius:8px;">
      <h2 style="color:#e50914">Admin</h2>
      <input type="password" id="passwordInput" placeholder="Password">
      <button class="btn-green" onclick="login()">Login</button>
    </div>

    <div id="dashboard" style="display:none;">
      
      <div class="vip-gen">
         <span style="color:#ffd700; font-weight:bold; font-size:14px;">👑 VIP Code:</span>
         <input type="number" id="genDays" class="vip-input" value="30" placeholder="Days">
         <button class="btn-blue" style="width:auto; margin:0;" onclick="genCode()">Generate</button>
         <input type="text" id="outCode" readonly style="flex:1; min-width:120px; margin:0; text-align:center; color:#ffd700; font-weight:bold; letter-spacing:1px; background:#111;" placeholder="Result">
         <button class="btn-gray" style="width:auto; margin:0;" onclick="copyCode()">Copy</button>
      </div>

      <div class="main-grid">
        
        <div class="card-box" id="uploadPanel">
          <div style="display:flex; justify-content:space-between; align-items:center;">
             <h2 id="formTitle" style="margin:0;">🎬 Upload</h2>
             <button onclick="resetForm()" style="width:auto; font-size:12px;" class="btn-gray">Clear</button>
          </div>
          <hr style="border:0; border-top:1px solid #333; margin:15px 0;">

          <input type="hidden" id="editId">
          <label>Title</label><input type="text" id="title">
          <div style="display:flex; gap:10px;">
            <div style="flex:1"><label>Poster</label><input type="text" id="image"></div>
            <div style="flex:1"><label>Cover</label><input type="text" id="cover"></div>
          </div>
          <label>Category</label>
          <div style="display:flex; gap:10px;">
              <select id="category" style="flex:1;">
                <option value="movies">Movie</option>
                <option value="series">Series</option>
                <option value="18+">18+</option>
              </select>
              <input type="text" id="tags" placeholder="Tags" style="flex:2;">
          </div>
          
          <div style="margin-top:15px; display:flex; align-items:center; gap:10px; background:#2a2a2a; padding:10px; border-radius:4px;">
              <input type="checkbox" id="isPremium" style="width:20px; margin:0;">
              <span style="color:#ffd700; font-weight:bold;">Is Premium? 👑</span>
          </div>

          <label>Download Link</label><input type="text" id="dl_link">
          <label>Description</label><textarea id="desc" rows="3"></textarea>
          <div id="seasonsContainer" style="margin-top:20px;"></div>
          <button onclick="addSeasonBox()" class="btn-blue" style="margin-bottom:10px;">+ Add Group</button>
          <button onclick="submitData()" id="submitBtn" class="btn-green">Save</button>
        </div>

        <div class="card-box">
           <div class="tabs">
              <div class="tab active" onclick="switchTab('all', this)">All</div>
              <div class="tab" onclick="switchTab('movies', this)">Movies</div>
              <div class="tab" onclick="switchTab('series', this)">Series</div>
              <div class="tab" onclick="switchTab('18+', this)">18+</div>
              <div class="tab" onclick="switchTab('users', this)">Users</div>
           </div>
           
           <input type="text" id="searchList" placeholder="🔍 Search..." onkeyup="filterList()" style="margin-bottom:10px;">
           <div id="contentList" style="max-height:700px; overflow-y:auto;"></div>
        </div>
      </div>
    </div>

    <script>
      let adminPass = "", currentList = [], currentTab = 'all';

      window.onload = () => { if(localStorage.getItem("adminPass")) { document.getElementById('passwordInput').value = localStorage.getItem("adminPass"); login(); } };

      function login() {
        adminPass = document.getElementById('passwordInput').value;
        if(!adminPass) return alert("Required");
        localStorage.setItem("adminPass", adminPass);
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        loadList('all'); addSeasonBox();
      }

      // --- VIP CODE ---
      async function genCode() {
          const days = document.getElementById('genDays').value || 30;
          const res = await fetch('/api/gen_code', { method:'POST', body:JSON.stringify({ password: adminPass, days: parseInt(days) }) });
          const json = await res.json();
          document.getElementById('outCode').value = json.code;
          showToast("Code: " + json.code);
      }
      function copyCode() {
          document.getElementById('outCode').select();
          document.execCommand("copy");
          showToast("Copied!");
      }

      // --- MOVIE FORM ---
      function addSeasonBox(name="", links="") {
        const div = document.createElement('div'); div.className = 'season-box';
        div.innerHTML = \`<button class="remove-season" onclick="this.parentElement.remove()">×</button>
            <label style="margin-top:0;">Group/Season Name</label><input type="text" class="s-name" value="\${name||'Season '+(document.querySelectorAll('.season-box').length+1)}">
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
          isPremium: document.getElementById('isPremium').checked,
          episodes: episodeList
        };

        const res = await fetch('/api/add', { method:'POST', body:JSON.stringify({ password: adminPass, data }) });
        if(res.ok) { showToast("Saved!"); resetForm(); if(currentTab !== 'users') loadList(currentTab); }
        else showToast("Error saving");
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
          document.getElementById('isPremium').checked = m.isPremium || false;

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
          
          document.getElementById('uploadPanel').scrollIntoView({behavior:'smooth'});
          showToast("Editing: " + m.title);
      }

      function resetForm() {
          document.querySelectorAll('input, textarea').forEach(i => i.value = "");
          document.getElementById('isPremium').checked = false;
          document.getElementById('seasonsContainer').innerHTML = "";
          addSeasonBox();
      }

      // --- LOADING LIST ---
      async function loadList(type) {
          currentTab = type;
          const listDiv = document.getElementById('contentList');
          listDiv.innerHTML = '<p style="text-align:center; padding:20px;">Loading...</p>';
          
          try {
              if(type === 'users') {
                  const res = await fetch('/api/admin/users', { method:'POST', body:JSON.stringify({password:adminPass}) });
                  const users = await res.json();
                  currentList = users;
                  renderUsers(users);
              } else {
                  // 🔥 FIX: Properly encode category to handle '18+'
                  const res = await fetch(\`/api/movies?page=1&cat=\${encodeURIComponent(type)}\`);
                  const json = await res.json();
                  currentList = json.data || [];
                  renderMovies(currentList);
              }
          } catch(e) {
              listDiv.innerHTML = '<p style="text-align:center; color:red;">Failed to load data. Check Server.</p>';
          }
      }

      function renderMovies(list) {
          document.getElementById('contentList').innerHTML = list.map(m => \`
            <div class="item">
                <img src="\${m.image}">
                <div style="flex:1">
                    <b>\${m.title}</b> \${m.isPremium ? '👑' : ''}<br>
                    <small>\${m.category} • \${(m.episodes||[]).length} Eps</small>
                </div>
                <div class="item-actions">
                    <button class="btn-blue" style="width:auto; padding:5px 10px;" onclick="startEdit('\${m.id}')">Edit</button>
                    <button class="btn-del" style="width:auto; padding:5px 10px;" onclick="del('\${m.id}')">Del</button>
                </div>
            </div>\`).join('');
      }

      function renderUsers(list) {
          document.getElementById('contentList').innerHTML = list.map(u => {
              const isVip = u.vipExpiry > Date.now();
              const days = isVip ? Math.ceil((u.vipExpiry - Date.now()) / 86400000) + ' days' : 'Free';
              return \`
                <div class="item" style="display:block;">
                    <div style="display:flex; justify-content:space-between;">
                        <b>\${u.username}</b>
                        <span style="color:\${isVip ? '#ffd700':'#aaa'}">\${days}</span>
                    </div>
                    <div style="display:flex; gap:5px; margin-top:5px;">
                        <input type="text" id="pass_\${u.username}" placeholder="New Pass" style="padding:5px; font-size:12px; margin:0;">
                        <button class="btn-blue" style="width:auto; margin:0; padding:5px 10px; font-size:12px;" onclick="resetPass('\${u.username}')">Reset</button>
                    </div>
                </div>\`;
          }).join('');
      }

      async function resetPass(username) {
          const newPass = document.getElementById('pass_'+username).value;
          if(!newPass) return alert("Enter password");
          await fetch('/api/admin/reset_user', { method:'POST', body:JSON.stringify({password:adminPass, username, newPass}) });
          alert("Password Reset!");
      }
      
      async function del(id) {
          if(confirm("Delete?")) {
              await fetch('/api/delete', { method:'POST', body:JSON.stringify({ password: adminPass, id }) });
              loadList(currentTab);
          }
      }

      function filterList() {
          const q = document.getElementById('searchList').value.toLowerCase();
          if(currentTab === 'users') {
              renderUsers(currentList.filter(u => u.username.toLowerCase().includes(q)));
          } else {
              renderMovies(currentList.filter(m => m.title.toLowerCase().includes(q)));
          }
      }
      
      function switchTab(type, btn) { 
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
          loadList(type); 
      }
      function showToast(msg) {
        const x = document.getElementById("toast");
        x.innerText = msg;
        x.className = "show";
        setTimeout(() => x.className = x.className.replace("show", ""), 3000);
      }
    </script>
  </body>
  </html>
  `;
}
