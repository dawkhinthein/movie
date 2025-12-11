export function renderWebsite() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Stream App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <style>
      body { background: #121212; color: #fff; font-family: sans-serif; margin:0; }
      
      /* ... (Existing Styles for Header/Grid/Card remain the same) ... */
      /* Copy the Header/Card CSS from previous version here */
      header { background: #1a1a1a; padding: 10px; position: sticky; top:0; z-index:50; display:flex; justify-content:space-between; align-items:center;}
      .search-input { background: #333; border: none; padding: 5px 10px; border-radius: 4px; color: white; }
      
      .container { padding: 10px; max-width: 1000px; margin: 0 auto; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .card { background: #222; border-radius: 4px; overflow: hidden; }
      .card img { width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; }
      .title { padding: 5px; font-size: 11px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      /* 🔥 ACCORDION & EPISODE STYLES */
      .accordion {
        background-color: #2a2a2a;
        color: white;
        cursor: pointer;
        padding: 12px;
        width: 100%;
        text-align: left;
        border: none;
        outline: none;
        transition: 0.3s;
        margin-top: 5px;
        border-radius: 4px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
      }
      .accordion:hover, .accordion.active { background-color: #e50914; }
      .accordion:after { content: '+'; font-size: 18px; }
      .accordion.active:after { content: '-'; }

      .panel {
        padding: 0 10px;
        background-color: #181818;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-out;
      }

      /* Scrollable Grid inside Panel */
      .episode-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
        gap: 8px;
        padding: 15px 0;
        max-height: 300px; /* Limit height */
        overflow-y: auto;  /* Allow scrolling */
      }

      .ep-btn {
        background: #333;
        border: 1px solid #444;
        color: #ddd;
        padding: 10px 5px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        text-align: center;
      }
      .ep-btn:hover { background: #555; }
      .ep-btn.active { background: #e50914; color: white; border-color: #e50914; }

      /* Modal */
      #playerModal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:black; z-index:100; overflow-y:auto; }
      .modal-content { max-width: 900px; margin: 0 auto; background: #111; min-height: 100vh; }
      video { width: 100%; aspect-ratio: 16/9; background: black; }
      .info-sec { padding: 20px; }
    </style>
  </head>
  <body>
    <header>
       <div onclick="location.reload()" style="font-weight:bold; color:#e50914;">MY APP</div>
       <input type="text" id="searchInput" class="search-input" placeholder="Search..." onchange="handleSearch(this.value)">
    </header>

    <div class="container" id="mainContainer">
       <div class="grid" id="grid">Loading...</div>
    </div>

    <div id="playerModal">
      <div class="modal-content">
         <div style="position:sticky; top:0; background:black; z-index:10;">
            <video id="video" controls playsinline></video>
            <button onclick="closePlayer()" style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.5); color:white; border:none; padding:5px 10px;">✕</button>
         </div>
         <div class="info-sec">
            <h2 id="m_title"></h2>
            <p id="m_desc" style="color:#aaa; font-size:13px;"></p>
            <div id="ep_section"></div>
         </div>
      </div>
    </div>

    <script>
      let allData = [];
      window.onload = () => fetchMovies();

      async function fetchMovies() {
        const res = await fetch('/api/movies?page=1&cat=all');
        const json = await res.json();
        allData = json.data;
        document.getElementById('grid').innerHTML = allData.map(m => 
          \`<div class="card" onclick="openModal('\${m.id}')">
             <img src="\${m.image}">
             <div class="title">\${m.title}</div>
           </div>\`
        ).join('');
      }

      async function handleSearch(q) {
         if(!q) return fetchMovies();
         const res = await fetch('/api/search?q='+q);
         const json = await res.json();
         allData = json;
         document.getElementById('grid').innerHTML = json.map(m => 
          \`<div class="card" onclick="openModal('\${m.id}')"><img src="\${m.image}"><div class="title">\${m.title}</div></div>\`
         ).join('');
      }

      function openModal(id) {
        const m = allData.find(x => x.id === id);
        if(!m) return;
        document.getElementById('playerModal').style.display = 'block';
        document.getElementById('m_title').innerText = m.title;
        document.getElementById('m_desc').innerText = m.description || "";
        document.getElementById('video').src = ""; // reset
        renderAccordion(m.episodes);
      }

      function renderAccordion(episodes) {
        const container = document.getElementById('ep_section');
        container.innerHTML = "";
        
        // Group by Season (Regex to find "Season X" or "S1")
        const seasons = {};
        episodes.forEach(ep => {
            // Default group
            let group = "Videos"; 
            // Try to match "Season 1" or "S1" at start of label
            const match = ep.label.match(/^(Season \\d+|S\\d+)/i);
            if(match) group = match[0].replace('S', 'Season '); // Normalize to "Season X"
            
            if(!seasons[group]) seasons[group] = [];
            seasons[group].push(ep);
        });

        // Create UI
        Object.keys(seasons).sort().forEach((key, idx) => {
            const btn = document.createElement('button');
            btn.className = "accordion";
            btn.innerText = key;
            
            const panel = document.createElement('div');
            panel.className = "panel";
            
            const grid = document.createElement('div');
            grid.className = "episode-grid";
            
            // Clean Label: Remove "Season 1" from "Season 1 Ep 1" to just show "Ep 1" inside
            grid.innerHTML = seasons[key].map(ep => {
                const cleanLabel = ep.label.replace(key, '').trim() || ep.label;
                return \`<button class="ep-btn" onclick="playVideo('\${ep.link}', this)">\${cleanLabel}</button>\`;
            }).join('');
            
            panel.appendChild(grid);
            container.appendChild(btn);
            container.appendChild(panel);

            btn.onclick = () => {
                btn.classList.toggle("active");
                if (panel.style.maxHeight) { panel.style.maxHeight = null; } 
                else { panel.style.maxHeight = panel.scrollHeight + "px"; }
            };
            
            // Auto open first season
            if(idx === 0) btn.click();
        });
      }

      function playVideo(link, btn) {
        // Highlight active button
        document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const v = document.getElementById('video');
        if(Hls.isSupported() && link.includes('.m3u8')) {
            const hls = new Hls(); hls.loadSource(link); hls.attachMedia(v);
            hls.on(Hls.Events.MANIFEST_PARSED, () => v.play());
        } else {
            v.src = link; v.play();
        }
      }

      function closePlayer() {
        document.getElementById('playerModal').style.display = 'none';
        document.getElementById('video').pause();
      }
    </script>
  </body>
  </html>
  `;
}
