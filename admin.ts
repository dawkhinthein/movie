export function renderAdmin() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Admin Panel</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: 'Segoe UI', sans-serif; padding: 15px; max-width: 900px; margin: 0 auto; background: #121212; color: #ddd; }
      input, select, textarea { width: 100%; padding: 10px; margin: 5px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 4px; box-sizing: border-box; }
      button { padding: 10px; border: none; font-weight: bold; cursor: pointer; border-radius: 4px; margin-top:5px; width:100%; }
      .btn-green { background: #e50914; color: white; }
      .btn-blue { background: #007bff; color: white; }
      .btn-del { background: #dc3545; color: white; width:auto; padding:5px 10px; }
      .season-box { background: #222; border: 1px solid #444; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #e50914; position:relative; }
      .remove-season { position: absolute; top: 5px; right: 5px; background: transparent; color: red; width: auto; }
      .item { display: flex; align-items: center; padding: 8px; border-bottom: 1px solid #333; }
      .item img { width: 35px; height: 50px; object-fit: cover; margin-right: 10px; }
      .tabs { display: flex; border-bottom: 2px solid #333; margin-bottom: 10px; }
      .tab { flex: 1; padding: 10px; text-align: center; cursor: pointer; color: #777; }
      .tab.active { color: white; border-bottom: 2px solid #e50914; }
    </style>
  </head>
  <body>
    <div id="loginScreen" style="text-align:center; padding:50px;">
      <h2 style="color:#e50914">Admin</h2>
      <input type="password" id="passwordInput" placeholder="Password" style="max-width:300px;">
      <button class="btn-green" style="max-width:300px;" onclick="login()">Login</button>
    </div>

    <div id="dashboard" style="display:none;">
      <div style="background:#222; padding:10px; margin-bottom:15px; border-radius:5px; display:flex; gap:5px;">
         <input type="number" id="genDays" value="30" style="width:60px; text-align:center;">
         <button class="btn-blue" style="width:auto;" onclick="genCode()">Gen Code</button>
         <input type="text" id="outCode" readonly style="flex:1; text-align:center; color:#ffd700;" placeholder="Result">
      </div>

      <div style="background:#1e1e1e; padding:15px; border-radius:8px;">
          <h2 style="margin:0 0 10px 0;">🎬 Upload</h2>
          <input type="hidden" id="editId">
          <input type="text" id="title" placeholder="Title">
          <div style="display:flex; gap:10px;">
            <input type="text" id="image" placeholder="Poster URL" style="flex:1">
            <input type="text" id="cover" placeholder="Cover URL" style="flex:1">
          </div>
          <div style="display:flex; gap:10px;">
              <select id="category" style="flex:1;">
                <option value="movies">Movie</option>
                <option value="series">Series</option>
                <option value="Adult">Adult</option>
              </select>
              <input type="text" id="tags" placeholder="Tags (e.g. 2025, Action)" style="flex:2;">
          </div>
          
          <div style="margin:10px 0; display:flex; align-items:center; gap:10px;">
              <input type="checkbox" id="isPremium" checked style="width:auto; margin:0;">
              <span style="color:#ffd700; font-weight:bold;">Premium 👑 (Auto Checked)</span>
          </div>

          <input type="text" id="dl_link" placeholder="Download Link">
          <textarea id="desc" rows="2" placeholder="Description"></textarea>
          
          <div id="seasonsContainer" style="margin-top:15px;"></div>
          <button onclick="addSeasonBox()" class="btn-blue" style="margin-bottom:10px;">+ Add Season Group</button>
          
          <button onclick="submitData()" id="submitBtn" class="btn-green">Save</button>
          <button onclick="resetForm()" class="btn-gray" style="background:#444;">Clear</button>
      </div>

      <div style="margin-top:20px;">
           <div class="tabs">
              <div class="tab active" onclick="switchTab('all', this)">All</div>
              <div class="tab" onclick="switchTab('movies', this)">Mov</div>
              <div class="tab" onclick="switchTab('series', this)">Ser</div>
              <div class="tab" onclick="switchTab('Adult', this)">Adult</div>
              <div class="tab" onclick="switchTab('users', this)">Users</div>
           </div>
           <input type="text" id="searchList" placeholder="Search..." onkeyup="filterList()">
           <div id="contentList"></div>
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

      async function genCode() {
          const days = document.getElementById('genDays').value;
          const res = await fetch('/api/gen_code', { method:'POST', body:JSON.stringify({ password: adminPass, days: parseInt(days) }) });
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
            const group = box.querySelector('.s-name').value.trim();
            const lines = box.querySelector('.s-links').value.split(/[\\n,]+/).filter(x=>x.trim());
            
            lines.forEach((l, i) => {
                let label = "";
                let link = l.trim();
                if(l.includes('|')) { 
                    const parts = l.split('|');
                    const customName = parts[0].trim();
                    link = parts[1].trim(); 
                    if(group.toLowerCase() !== 'movie') label = \`\${group} \${customName}\`; 
                    else label = customName;
                } else {
                    if(group.toLowerCase() === 'movie') label = "Movie";
                    else label = \`\${group} Ep \${i+1}\`; 
                }
                episodeList.push({ label, link });
            });
        });

        const rawTags = document.getElementById('tags').value;
        const cleanTags = rawTags.split(',').map(t => t.trim()).filter(t => t);

        const data = {
          id: document.getElementById('editId').value || null,
          title: document.getElementById('title').value,
          image: document.getElementById('image').value,
          cover: document.getElementById('cover').value,
          description: document.getElementById('desc').value,
          category: document.getElementById('category').value,
          downloadLink: document.getElementById('dl_link').value,
          tags: cleanTags, 
          isPremium: document.getElementById('isPremium').checked,
          episodes: episodeList
        };

        await fetch('/api/add', { method:'POST', body:JSON.stringify({ password: adminPass, data }) });
        alert("Saved!"); resetForm(); if(currentTab !== 'users') loadList(currentTab);
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
          document.getElementById('tags').value = (m.tags||[]).join(', '); 
          document.getElementById('isPremium').checked = m.isPremium || false;

          const con = document.getElementById('seasonsContainer'); con.innerHTML = "";
          const groups = {};
          
          (m.episodes||[]).forEach(ep => {
              let g = "Movie";
              const match = ep.label.match(/^(Season \\d+|S\\d+|Movie)/i);
              if(match) {
                  g = match[0].replace(/^S(\\d+)/i, 'Season $1');
                  if(g.match(/Season\s*Season/i)) g = g.replace(/Season\s*Season/i, 'Season');
              } else if (ep.label === 'Movie') g = "Movie";
              else g = "Extras"; 

              if(!groups[g]) groups[g] = [];
              let clean = ep.label.replace(g, '').trim();
              if(clean.startsWith('Ep ')) clean = "";
              if(clean) groups[g].push(\`\${clean} | \${ep.link}\`);
              else groups[g].push(ep.link);
          });
          
          Object.keys(groups).forEach(g => addSeasonBox(g, groups[g].join('\\n')));
          if(Object.keys(groups).length===0) addSeasonBox();
          window.scrollTo(0,0);
      }

      function resetForm() {
          document.querySelectorAll('input, textarea').forEach(i => i.value = "");
          // 🔥 FIX: KEEP CHECKED ON RESET
          document.getElementById('isPremium').checked = true; 
          document.getElementById('seasonsContainer').innerHTML = "";
          addSeasonBox();
      }

      async function loadList(type) {
          currentTab = type;
          document.getElementById('contentList').innerHTML = 'Loading...';
          if(type === 'users') {
              const res = await fetch('/api/admin/users', { method:'POST', body:JSON.stringify({password:adminPass}) });
              const users = await res.json();
              currentList = users;
              renderUsers(users);
          } else {
              const res = await fetch(\`/api/movies?page=1&cat=\${encodeURIComponent(type)}\`);
              const json = await res.json();
              currentList = json.data || [];
              renderMovies(currentList);
          }
      }

      function renderMovies(list) {
          document.getElementById('contentList').innerHTML = list.map(m => \`
            <div class="item">
                <img src="\${m.image}">
                <div style="flex:1"><b>\${m.title}</b> \${m.isPremium?'👑':''}<br><small>\${m.category}</small></div>
                <button class="btn-blue" style="width:auto; margin-right:5px;" onclick="startEdit('\${m.id}')">Edit</button>
                <button class="btn-del" onclick="del('\${m.id}')">Del</button>
            </div>\`).join('');
      }

      function renderUsers(list) {
          document.getElementById('contentList').innerHTML = list.map(u => \`
            <div class="item" style="display:block;">
                <b>\${u.username}</b> <span style="color:\${u.vipExpiry>Date.now()?'gold':'#aaa'}">\${u.vipExpiry>Date.now()?'VIP':'Free'}</span>
                <div style="margin-top:5px; display:flex; gap:5px;">
                    <input id="pass_\${u.username}" placeholder="New Pass" style="padding:5px;">
                    <button class="btn-blue" style="width:auto; margin:0;" onclick="resetPass('\${u.username}')">Reset</button>
                </div>
            </div>\`).join('');
      }

      async function resetPass(u) {
          const p = document.getElementById('pass_'+u).value;
          if(!p) return alert("Enter pass");
          await fetch('/api/admin/reset_user', { method:'POST', body:JSON.stringify({password:adminPass, username:u, newPass:p}) });
          alert("Reset Done");
      }
      
      async function del(id) {
          if(confirm("Delete?")) {
              await fetch('/api/delete', { method:'POST', body:JSON.stringify({ password: adminPass, id }) });
              loadList('all');
          }
      }
      function switchTab(t, b) { document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); b.classList.add('active'); loadList(t); }
      function filterList() { /* Simple filter */ }
    </script>
  </body>
  </html>
  `;
}
