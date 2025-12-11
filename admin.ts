export function renderAdmin() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Admin Panel</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      /* --- CSS STYLES --- */
      body { font-family: 'Segoe UI', sans-serif; padding: 15px; max-width: 1000px; margin: 0 auto; background: #121212; color: #ddd; }
      
      /* Form Elements */
      input, select, textarea { width: 100%; padding: 12px; margin: 6px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 6px; box-sizing: border-box; outline: none; transition: 0.3s; }
      input:focus, textarea:focus { border-color: #e50914; background: #333; }
      label { font-size: 13px; color: #aaa; font-weight: bold; margin-top: 10px; display: block; }
      
      /* Buttons */
      button { padding: 10px 15px; border: none; font-weight: bold; cursor: pointer; border-radius: 6px; transition: 0.2s; font-size: 13px; }
      .btn-green { background: #e50914; color: white; width: 100%; margin-top: 10px; font-size: 15px; }
      .btn-green:hover { background: #ff0f1f; }
      .btn-blue { background: #007bff; color: white; }
      .btn-gray { background: #444; color: #ccc; }
      .btn-del { background: #dc3545; color: white; }
      
      /* Layout */
      .main-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
      @media (min-width: 768px) { .main-grid { grid-template-columns: 1.4fr 0.6fr; } }
      .card-box { background: #1e1e1e; padding: 20px; border-radius: 8px; border: 1px solid #333; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
      
      /* Tabs */
      .tabs { display: flex; border-bottom: 2px solid #333; margin-bottom: 15px; }
      .tab { flex: 1; padding: 12px; text-align: center; cursor: pointer; color: #777; font-weight: bold; background: #222; }
      .tab.active { color: white; background: #e50914; }

      /* Lists */
      .item { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #333; background: #252525; margin-bottom: 5px; border-radius: 4px; }
      .item img { width: 40px; height: 60px; object-fit: cover; margin-right: 12px; border-radius: 4px; background: #000; }
      .item-info { flex: 1; }
      .item-actions { display: flex; gap: 5px; }

      /* Season Box */
      .season-box { background: #2a2a2a; border: 1px solid #444; padding: 15px; border-radius: 6px; margin-bottom: 15px; position: relative; border-left: 4px solid #e50914; }
      .remove-season { position: absolute; top: 5px; right: 5px; background: transparent; color: #ff4d4d; font-size: 20px; width: auto; padding: 0 5px; }

      /* VIP Generator Section */
      .vip-gen { background:#252525; padding:15px; margin-bottom:20px; border-radius:8px; display:flex; flex-wrap:wrap; gap:10px; align-items:center; border:1px solid #444; }
      .vip-input { width: 80px !important; margin: 0 !important; text-align: center; }

      /* Toast */
      #toast { visibility: hidden; min-width: 250px; background-color: #333; color: #fff; text-align: center; border-radius: 50px; padding: 16px; position: fixed; z-index: 100; left: 50%; bottom: 30px; transform: translateX(-50%); border: 1px solid #555; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
      #toast.show { visibility: visible; animation: fadein 0.5s, fadeout 0.5s 2.5s; }
      @keyframes fadein { from {bottom: 0; opacity: 0;} to {bottom: 30px; opacity: 1;} }
      @keyframes fadeout { from {bottom: 30px; opacity: 1;} to {bottom: 0; opacity: 0;} }
    </style>
  </head>
  <body>
    <div id="toast">Message</div>

    <div id="loginScreen" style="max-width:350px; margin:80px auto; text-align:center; background:#1e1e1e; padding:40px; border-radius:10px; border:1px solid #333;">
      <h2 style="color:#e50914; margin-top:0;">Admin Access</h2>
      <input type="password" id="passwordInput" placeholder="Enter Admin Password">
      <button class="btn-green" onclick="login()">Login Dashboard</button>
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
        
        <div class="card-box" id="formPanel">
          <div style="display:flex; justify-content:space-between; align-items:center;">
             <h2 id="formTitle" style="margin:0; color:white;">🎬 Upload / Edit</h2>
             <button onclick="resetForm()" class="btn-gray" style="width:auto;">New Upload</button>
          </div>
          <hr style="border:0; border-top:1px solid #333; margin:15px 0;">

          <input type="hidden" id="editId">
          
          <label>Title</label>
          <input type="text" id="title" placeholder="Movie Name">
          
          <div style="display:flex; gap:10px;">
            <div style="flex:1"><label>Poster URL (Vertical)</label><input type="text" id="image" placeholder="https://..."></div>
            <div style="flex:1"><label>Cover URL (Horizontal)</label><input type="text" id="cover" placeholder="https://..."></div>
          </div>

          <label>Category & Tags</label>
          <div style="display:flex; gap:10px;">
              <select id="category" style="flex:1;">
                <option value="movies">Movie</option>
                <option value="series">Series</option>
                <option value="18+">18+</option>
              </select>
              <input type="text" id="tags" placeholder="e.g. Action, 2024" style="flex:2;">
          </div>
          
          <div style="margin-top:15px; display:flex; align-items:center; gap:10px; background:#333; padding:10px; border-radius:4px; border:1px solid #444;">
              <input type="checkbox" id="isPremium" style="width:20px; height:20px; margin:0;">
              <span style="color:#ffd700; font-weight:bold;">Is Premium Content? (Crown)</span>
          </div>

          <label style="color:#4db8ff;">Download Link (Optional)</label>
          <input type="text" id="dl_link" placeholder="External download url...">

          <label>Description</label>
          <textarea id="desc" rows="3" placeholder="Synopsis..."></textarea>

          <div style="margin-top:20px; margin-bottom:10px;">
              <label style="display:inline;">Video Links / Episodes</label>
              <button onclick="addSeasonBox()" class="btn-blue" style="float:right; width:auto; padding:5px 10px;">+ Add Group/Season</button>
          </div>
          <div id="seasonsContainer"></div>

          <button onclick="submitData()" id="submitBtn" class="btn-green">Save Content</button>
        </div>

        <div class="card-box">
           <div class="tabs">
              <div class="tab active" onclick="switchTab('all', this)">Movies</div>
              <div class="tab" onclick="switchTab('users', this)">User Manager</div>
           </div>
           
           <input type="text" id="searchList" placeholder="🔍 Search..." onkeyup="filterList()" style="margin-bottom:10px;">
           
           <div id="contentList" style="max-height:700px; overflow-y:auto;">
               <p style="text-align:center; color:#666;">Loading...</p>
           </div>
        </div>
      </div>
    </div>

    <script>
      let adminPass = "";
      let currentList = [];
      let currentTab = 'all';

      // --- INITIALIZATION ---
      window.onload = () => {
        const saved = localStorage.getItem("adminPass");
        if(saved) { 
            document.getElementById('passwordInput').value = saved; 
            login(); 
        }
      };

      function login() {
        adminPass = document.getElementById('passwordInput').value;
        if(!adminPass) return alert("Password Required");
        localStorage.setItem("adminPass", adminPass);
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        loadList('all');
        addSeasonBox(); // Add one default box
      }

      function showToast(msg) {
        const x = document.getElementById("toast");
        x.innerText = msg;
        x.className = "show";
        setTimeout(() => x.className = x.className.replace("show", ""), 3000);
      }

      // --- VIP CODE LOGIC ---
      async function genCode() {
          const days = document.getElementById('genDays').value || 30;
          const res = await fetch('/api/gen_code', { method:'POST', body:JSON.stringify({ password: adminPass, days: parseInt(days) }) });
          const json = await res.json();
          document.getElementById('outCode').value = json.code;
          showToast("Generated code for " + days + " days");
      }

      function copyCode() {
          const code = document.getElementById('outCode');
          code.select();
          document.execCommand("copy");
          showToast("Copied to clipboard!");
      }

      // --- FORM LOGIC ---
      function addSeasonBox(name = "", links = "") {
        const container = document.getElementById('seasonsContainer');
        const count = container.children.length + 1;
        const defaultName = name || (document.getElementById('category').value === 'movies' ? 'Movie' : \`Season \${count}\`);
        
        const div = document.createElement('div');
        div.className = 'season-box';
        div.innerHTML = \`
            <button class="remove-season" onclick="this.parentElement.remove()">×</button>
            <label style="margin-top:0;">Group Name (e.g. Season 1)</label>
            <input type="text" class="s-name" value="\${defaultName}" style="font-weight:bold;">
            <label>Links (Auto-split by comma or new line)</label>
            <textarea class="s-links" rows="3" placeholder="https://link1...">\${links}</textarea>
        \`;
        container.appendChild(div);
      }

      async function submitData() {
        // Collect Episodes
        const episodeList = [];
        const seasonBoxes = document.querySelectorAll('.season-box');
        
        seasonBoxes.forEach(box => {
            const groupName = box.querySelector('.s-name').value;
            const rawText = box.querySelector('.s-links').value;
            // Split by comma OR newline
            const links = rawText.split(/[\\n,]+/).map(l => l.trim()).filter(l => l);
            
            links.forEach((link, index) => {
                let label = "";
                let finalLink = link;

                // Check for custom label pipe e.g. "End | https..."
                if(link.includes('|')) {
                    const parts = link.split('|');
                    label = parts[0].trim();
                    finalLink = parts[1].trim();
                } else {
                    // Auto Label
                    if(groupName.toLowerCase() === 'movie') {
                        label = "Movie";
                    } else {
                        // Create internal label: "Season 1 Ep 1"
                        label = \`\${groupName} Ep \${index + 1}\`; 
                    }
                }
                episodeList.push({ label: label, link: finalLink });
            });
        });

        if(!document.getElementById('title').value) return showToast("Title is required!");

        const data = {
          id: document.getElementById('editId').value || null,
          title: document.getElementById('title').value,
          image: document.getElementById('image').value,
          cover: document.getElementById('cover').value,
          description: document.getElementById('desc').value,
          category: document.getElementById('category').value,
          downloadLink: document.getElementById('dl_link').value,
          tags: document.getElementById('tags').value.split(',').filter(t=>t.trim()),
          isPremium: document.getElementById('isPremium').checked,
          episodes: episodeList
        };

        const btn = document.getElementById('submitBtn');
        btn.innerText = "Saving...";
        
        try {
            const res = await fetch('/api/add', { method: 'POST', body: JSON.stringify({ password: adminPass, data }) });
            if(res.ok) { 
                showToast("Success! Saved."); 
                resetForm(); 
                if(currentTab === 'all') loadList('all');
            } else {
                showToast("Error saving data.");
            }
        } catch(e) { showToast("Connection Error"); }
        btn.innerText = "Save Content";
      }

      // --- EDIT LOGIC ---
      function startEdit(id) {
        const item = currentList.find(m => m.id === id);
        if(!item) return;

        // Populate Form
        document.getElementById('editId').value = item.id;
        document.getElementById('title').value = item.title;
        document.getElementById('image').value = item.image;
        document.getElementById('cover').value = item.cover || "";
        document.getElementById('desc').value = item.description || "";
        document.getElementById('category').value = item.category;
        document.getElementById('tags').value = (item.tags || []).join(',');
        document.getElementById('dl_link').value = item.downloadLink || "";
        document.getElementById('isPremium').checked = item.isPremium || false;

        // Reconstruct Seasons
        const container = document.getElementById('seasonsContainer');
        container.innerHTML = "";
        
        const groups = {};
        // Safety check for old data structure
        let episodesToProcess = item.episodes;
        if (!episodesToProcess || episodesToProcess.length === 0) {
            if (item.link) episodesToProcess = [{ label: "Movie", link: item.link }];
            else episodesToProcess = [];
        }

        episodesToProcess.forEach(ep => {
            let groupName = "Movie";
            let linkText = ep.link;

            // Regex to find "Season 1" or "S1" at start of label
            const match = ep.label.match(/^(Season \\d+|S\\d+|Movie)/i);
            if(match) {
                groupName = match[0].replace('S', 'Season '); // Normalize S1 to Season 1
                // If label has extra info like "End", keep it as piped
                if(!ep.label.includes('Ep ') && ep.label !== groupName) {
                    linkText = \`\${ep.label} | \${ep.link}\`;
                }
            } else {
                // Fallback for weird labels
                groupName = "Extras"; 
                linkText = \`\${ep.label} | \${ep.link}\`;
            }

            if(!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(linkText);
        });

        Object.keys(groups).forEach(name => {
            addSeasonBox(name, groups[name].join('\\n'));
        });
        
        if(Object.keys(groups).length === 0) addSeasonBox();
        
        // Scroll to top
        document.getElementById('uploadPanel').scrollIntoView({ behavior: 'smooth' });
        showToast("Editing: " + item.title);
      }

      function resetForm() {
        document.getElementById('editId').value = "";
        document.querySelectorAll('input[type="text"], textarea').forEach(e => e.value = "");
        document.getElementById('isPremium').checked = false;
        document.getElementById('seasonsContainer').innerHTML = "";
        addSeasonBox();
      }

      // --- LIST & TABS ---
      function switchTab(type, btn) { 
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
          loadList(type); 
      }

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
                  // Movies
                  const res = await fetch('/api/movies?page=1&cat=all');
                  const json = await res.json();
                  currentList = json.data || [];
                  renderMovies(currentList);
              }
          } catch(e) {
              listDiv.innerHTML = '<p style="text-align:center; color:red;">Failed to load data.</p>';
          }
      }

      function renderMovies(list) {
          const listDiv = document.getElementById('contentList');
          if(!list || list.length === 0) { listDiv.innerHTML = "<p style='text-align:center'>Empty.</p>"; return; }
          
          listDiv.innerHTML = list.map(m => \`
            <div class="item">
                <img src="\${m.image}" onerror="this.src='https://via.placeholder.com/50'">
                <div class="item-info">
                    <div style="font-weight:bold; color:white;">
                        \${m.title} 
                        \${m.isPremium ? '<span style="color:#ffd700">👑</span>' : ''}
                    </div>
                    <div style="font-size:12px; color:#aaa;">\${m.category} • \${(m.episodes && m.episodes.length)||0} Videos</div>
                </div>
                <div class="item-actions">
                    <button class="btn-blue" style="width:auto; padding:5px 10px;" onclick="startEdit('\${m.id}')">Edit</button>
                    <button class="btn-del" style="width:auto; padding:5px 10px;" onclick="del('\${m.id}')">Del</button>
                </div>
            </div>\`).join('');
      }

      function renderUsers(list) {
          const listDiv = document.getElementById('contentList');
          if(!list || list.length === 0) { listDiv.innerHTML = "<p style='text-align:center'>No users found.</p>"; return; }
          
          listDiv.innerHTML = list.map(u => {
              const isVip = u.vipExpiry > Date.now();
              const daysLeft = isVip ? Math.ceil((u.vipExpiry - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
              const status = isVip ? \`<span style="color:#ffd700">VIP (\${daysLeft} days)</span>\` : '<span style="color:#aaa">Free</span>';
              
              return \`
                <div class="item" style="display:block;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span style="font-weight:bold; color:white;">\${u.username}</span>
                        <span style="font-size:12px;">\${status}</span>
                    </div>
                    <div style="display:flex; gap:5px;">
                        <input type="text" id="pass_\${u.username}" placeholder="New Password" style="padding:6px; font-size:12px; margin:0;">
                        <button class="btn-blue" style="width:auto; margin:0; padding:6px 12px;" onclick="resetPass('\${u.username}')">Reset Pass</button>
                    </div>
                </div>\`;
          }).join('');
      }

      // --- USER MANAGEMENT ---
      async function resetPass(username) {
          const newPass = document.getElementById('pass_'+username).value;
          if(!newPass) return alert("Please enter a new password");
          if(!confirm("Reset password for " + username + "?")) return;
          
          const res = await fetch('/api/admin/reset_user', { method:'POST', body:JSON.stringify({password:adminPass, username, newPass}) });
          if(res.ok) showToast("Password Updated!");
          else alert("Error resetting password");
      }

      // --- COMMON ACTIONS ---
      async function del(id) {
          if(confirm("Are you sure you want to delete this?")) {
              await fetch('/api/delete', { method:'POST', body:JSON.stringify({ password: adminPass, id }) });
              showToast("Deleted!");
              loadList('all');
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
    </script>
  </body>
  </html>
  `;
}
