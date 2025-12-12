export function renderAdmin() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Admin Panel</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      /* --- GLOBAL --- */
      body { font-family: 'Segoe UI', sans-serif; padding: 15px; max-width: 1100px; margin: 0 auto; background: #121212; color: #ddd; }
      * { box-sizing: border-box; }

      /* --- FORMS --- */
      input, select, textarea { width: 100%; padding: 10px; margin: 5px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 4px; outline: none; }
      input:focus, textarea:focus { border-color: #e50914; }
      label { font-size: 12px; color: #aaa; font-weight: bold; margin-top: 8px; display: block; }
      
      /* --- BUTTONS --- */
      button { padding: 8px 12px; border: none; font-weight: bold; cursor: pointer; border-radius: 4px; transition: 0.2s; font-size: 13px; }
      .btn-green { background: #e50914; color: white; width: 100%; margin-top: 10px; padding: 12px; font-size: 15px; }
      .btn-blue { background: #007bff; color: white; }
      .btn-gray { background: #333; color: #ccc; }
      .btn-del { background: #dc3545; color: white; }

      /* --- LAYOUT --- */
      .main-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
      @media (min-width: 768px) { .main-grid { grid-template-columns: 1.3fr 0.7fr; } }
      .card-box { background: #1e1e1e; padding: 20px; border-radius: 8px; border: 1px solid #333; height: fit-content; }

      /* --- 🔥 SCROLLABLE LIST FIX --- */
      #contentList {
          max-height: 70vh; /* Viewport Height Limit */
          overflow-y: auto;  /* Enable Vertical Scroll */
          padding-right: 5px;
          margin-top: 10px;
          border-top: 1px solid #333;
      }
      /* Custom Scrollbar Styling */
      #contentList::-webkit-scrollbar { width: 6px; }
      #contentList::-webkit-scrollbar-track { background: #222; }
      #contentList::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }
      #contentList::-webkit-scrollbar-thumb:hover { background: #e50914; }

      /* --- LIST ITEMS --- */
      .item { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #333; background: #252525; margin-bottom: 5px; border-radius: 4px; }
      .item img { width: 40px; height: 60px; object-fit: cover; margin-right: 10px; border-radius: 3px; }
      .item-info { flex: 1; overflow: hidden; }
      .item-actions { display: flex; gap: 5px; flex-shrink: 0; }

      /* --- TABS --- */
      .tabs { display: flex; border-bottom: 2px solid #333; margin-bottom: 10px; }
      .tab { flex: 1; padding: 10px; text-align: center; cursor: pointer; color: #777; background: #1a1a1a; font-weight: bold; border-top-left-radius: 6px; border-top-right-radius: 6px; margin-right: 2px;}
      .tab.active { color: white; background: #e50914; }

      /* --- EXTRAS --- */
      .season-box { background: #2a2a2a; border: 1px solid #444; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #e50914; position:relative; }
      .remove-season { position: absolute; top: 5px; right: 5px; background: transparent; color: #ff4444; width: auto; font-size: 18px; padding: 0; }
      
      .vip-gen { background:#252525; padding:15px; margin-bottom:20px; border-radius:8px; display:flex; flex-wrap:wrap; gap:10px; align-items:center; border:1px solid #444; }
      .vip-input { width: 80px !important; margin: 0 !important; text-align: center; }

      #toast { visibility: hidden; min-width: 200px; background-color: #333; color: #fff; text-align: center; border-radius: 50px; padding: 12px; position: fixed; z-index: 100; left: 50%; bottom: 30px; transform: translateX(-50%); border: 1px solid #555; }
      #toast.show { visibility: visible; animation: fadein 0.5s, fadeout 0.5s 2.5s; }
      @keyframes fadein { from {bottom: 0; opacity: 0;} to {bottom: 30px; opacity: 1;} }
      @keyframes fadeout { from {bottom: 30px; opacity: 1;} to {bottom: 0; opacity: 0;} }
    </style>
  </head>
  <body>
    <div id="toast">Alert</div>

    <div id="loginScreen" style="max-width:350px; margin:80px auto; text-align:center; background:#1e1e1e; padding:40px; border-radius:8px;">
      <h2 style="color:#e50914; margin-top:0;">Admin Access</h2>
      <input type="password" id="passwordInput" placeholder="Password">
      <button class="btn-green" onclick="login()">Login</button>
    </div>

    <div id="dashboard" style="display:none;">
      
      <div class="vip-gen">
         <span style="color:#ffd700; font-weight:bold;">👑 VIP Code:</span>
         <input type="number" id="genDays" class="vip-input" value="30" placeholder="Days">
         <button class="btn-blue" style="width:auto; margin:0;" onclick="genCode()">Generate</button>
         <input type="text" id="outCode" readonly style="flex:1; min-width:120px; margin:0; text-align:center; color:#ffd700; font-weight:bold; font-size:16px; background:#111;" placeholder="Result">
         <button class="btn-gray" style="width:auto; margin:0;" onclick="copyCode()">Copy</button>
      </div>

      <div class="main-grid">
        
        <div class="card-box" id="uploadPanel">
          <div style="display:flex; justify-content:space-between; align-items:center;">
             <h2 id="formTitle" style="margin:0;">🎬 Content</h2>
             <button onclick="resetForm()" class="btn-gray" style="width:auto; padding:5px 10px;">New</button>
          </div>
          <hr style="border:0; border-top:1px solid #333; margin:10px 0;">

          <input type="hidden" id="editId">
          <label>Title</label><input type="text" id="title" placeholder="Movie Name">
          
          <div style="display:flex; gap:10px;">
            <div style="flex:1"><label>Poster</label><input type="text" id="image"></div>
            <div style="flex:1"><label>Cover</label><input type="text" id="cover"></div>
          </div>

          <label>Category</label>
          <div style="display:flex; gap:10px;">
              <select id="category" style="flex:1;">
                <option value="movies">Movie</option>
                <option value="series">Series</option>
                <option value="Adult">Adult</option>
              </select>
              <input type="text" id="tags" placeholder="Tags (2024, Action)" style="flex:2;">
          </div>
          
          <div style="margin-top:10px; display:flex; align-items:center; gap:10px; background:#2a2a2a; padding:10px; border-radius:4px;">
              <input type="checkbox" id="isPremium" checked style="width:20px; margin:0;">
              <span style="color:#ffd700; font-weight:bold;">Premium 👑 (Auto Checked)</span>
          </div>

          <label>Download Link</label><input type="text" id="dl_link">
          <label>Description</label><textarea id="desc" rows="2"></textarea>

          <div id="seasonsContainer" style="margin-top:15px;"></div>
          <button onclick="addSeasonBox()" class="btn-blue" style="margin-bottom:5px;">+ Group/Season</button>
          
          <button onclick="submitData()" id="submitBtn" class="btn-green">Save Data</button>
        </div>

        <div class="card-box">
           <div class="tabs">
              <div class="tab active" onclick="switchTab('all', this)">All</div>
              <div class="tab" onclick="switchTab('movies', this)">Mov</div>
              <div class="tab" onclick="switchTab('series', this)">Ser</div>
              <div class="tab" onclick="switchTab('Adult', this)">Adult</div>
              <div class="tab" onclick="switchTab('users', this)">Users</div>
           </div>
           
           <input type="text" id="searchList" placeholder="🔍 Search..." onkeyup="filterList()">
           
           <div id="contentList"></div>
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

      // VIP CODE
      async function genCode() {
          const days = document.getElementById('genDays').value || 30;
          const res = await fetch('/api/gen_code', { method:'POST', body:JSON.stringify({ password: adminPass, days: parseInt(days) }) });
          const json = await res.json();
          document.getElementById('outCode').value = json.code;
          showToast("Generated!");
      }
      function copyCode() {
          document.getElementById('outCode').select();
          document.execCommand("copy");
          showToast("Copied!");
      }

      // FORM LOGIC
      function addSeasonBox(name="", links="") {
        const div = document.createElement('div'); div.className = 'season-box';
        div.innerHTML = \`<button class="remove-season" onclick="this.parentElement.remove()">×</button>
            <label style="margin-top:0;">Group Name</label><input type="text" class="s-name" value="\${name||'Season '+(document.querySelectorAll('.season-box').length+1)}">
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
                let label = "", link = l.trim();
                if(l.includes('|')) { 
                    const p = l.split('|'); 
                    label = (group.toLowerCase() !== 'movie') ? \`\${group} \${p[0].trim()}\` : p[0].trim();
                    link = p[1].trim(); 
                } else {
                    label = (group.toLowerCase() === 'movie') ? "Movie" : \`\${group} Ep \${i+1}\`;
                }
                episodeList.push({ label, link });
            });
        });

        const rawTags = document.getElementById('tags').value;
        const data = {
          id: document.getElementById('editId').value || null,
          title: document.getElementById('title').value,
          image: document.getElementById('image').value,
          cover: document.getElementById('cover').value,
          description: document.getElementById('desc').value,
          category: document.getElementById('category').value,
          downloadLink: document.getElementById('dl_link').value,
          tags: rawTags.split(',').map(t=>t.trim()).filter(t=>t),
          isPremium: document.getElementById('isPremium').checked,
          episodes: episodeList
        };

        const res = await fetch('/api/add', { method: 'POST', body: JSON.stringify({ password: adminPass, data }) });
        if(res.ok) { showToast("Saved!"); resetForm(); if(currentTab!=='users') loadList(currentTab); }
        else showToast("Error");
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
              if(match) g = match[0].replace(/^S(\\d+)/i, 'Season $1').replace(/Season\s*Season/i, 'Season');
              else if(ep.label==='Movie') g="Movie";
              else g="Extras";

              if(!groups[g]) groups[g] = [];
              let clean = ep.label.replace(g, '').trim();
              if(clean.startsWith('Ep ')) clean="";
              if(clean) groups[g].push(\`\${clean}|\${ep.link}\`); else groups[g].push(ep.link);
          });
          Object.keys(groups).forEach(g => addSeasonBox(g, groups[g].join('\\n')));
          if(Object.keys(groups).length===0) addSeasonBox();
          
          document.getElementById('uploadPanel').scrollIntoView({behavior:'smooth'});
          showToast("Editing...");
      }

      function resetForm() {
          document.querySelectorAll('input, textarea').forEach(i => i.value = "");
          document.getElementById('isPremium').checked = true;
          document.getElementById('seasonsContainer').innerHTML = "";
          addSeasonBox();
      }

      async function loadList(type) {
          currentTab = type;
          document.getElementById('contentList').innerHTML = '<p style="text-align:center;">Loading...</p>';
          try {
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
          } catch(e) { document.getElementById('contentList').innerHTML = '<p style="text-align:center; color:red;">Error</p>'; }
      }

      function renderMovies(list) {
          document.getElementById('contentList').innerHTML = list.map(m => \`
            <div class="item">
                <img src="\${m.image}" onerror="this.src='https://via.placeholder.com/50'">
                <div class="item-info">
                    <div style="color:white; font-weight:bold;">\${m.title} \${m.isPremium?'👑':''}</div>
                    <div style="font-size:12px; color:#aaa;">\${m.category} • \${(m.episodes||[]).length} Eps</div>
                </div>
                <div class="item-actions">
                    <button class="btn-blue" style="width:auto; padding:5px 10px;" onclick="startEdit('\${m.id}')">Edit</button>
                    <button class="btn-del" style="width:auto; padding:5px 10px;" onclick="del('\${m.id}')">Del</button>
                </div>
            </div>\`).join('');
      }

      // 🔥 FIX: USER LIST WITH DATE & DAYS
      function renderUsers(list) {
          if(!list || list.length === 0) {
               document.getElementById('contentList').innerHTML = '<p style="text-align:center; color:#777;">No users yet.</p>';
               return;
          }
          document.getElementById('contentList').innerHTML = list.map(u => {
              const isVip = u.vipExpiry > Date.now();
              
              let statusHtml = '<span style="color:#aaa; font-size:12px;">Free User</span>';
              
              if(isVip) {
                  // Calculate Days
                  const days = Math.ceil((u.vipExpiry - Date.now()) / (1000 * 60 * 60 * 24));
                  // Format Date (DD/MM/YYYY)
                  const date = new Date(u.vipExpiry).toLocaleDateString('en-GB'); 
                  statusHtml = \`<span style="color:#ffd700; font-weight:bold; font-size:13px;">
                                    VIP (\${days} Days)<br>
                                    <span style="font-size:11px; color:#999; font-weight:normal;">Exp: \${date}</span>
                                 </span>\`;
              }

              return \`
                <div class="item" style="display:block;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <b style="font-size:15px; color:#fff;">\${u.username}</b>
                        <div style="text-align:right;">\${statusHtml}</div>
                    </div>
                    <div style="display:flex; gap:5px; margin-top:8px;">
                        <input type="text" id="pass_\${u.username}" placeholder="New Password" style="padding:6px; font-size:12px; margin:0; flex:1; min-width:0;">
                        <button class="btn-blue" style="width:auto; margin:0; font-size:12px; white-space:nowrap;" onclick="resetPass('\${u.username}')">Reset Pass</button>
                    </div>
                </div>\`;
          }).join('');
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
              loadList(currentTab);
          }
      }

      function filterList() {
          const q = document.getElementById('searchList').value.toLowerCase();
          if(currentTab === 'users') renderUsers(currentList.filter(u => u.username.toLowerCase().includes(q)));
          else renderMovies(currentList.filter(m => m.title.toLowerCase().includes(q)));
      }
      function switchTab(t, b) { document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); b.classList.add('active'); loadList(t); }
      function showToast(msg) { const x=document.getElementById("toast"); x.innerText=msg; x.className="show"; setTimeout(()=>x.className=x.className.replace("show",""),3000); }
    </script>
  </body>
  </html>
  `;
}
