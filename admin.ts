// admin.ts
export function renderAdmin() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Admin</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background: #eee; }
      input, select, button, textarea { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
      button { background: #28a745; color: white; border: none; font-weight: bold; cursor: pointer; }
      textarea { height: 80px; font-family: sans-serif; }
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
    <textarea id="desc" placeholder="Movie Synopsis / Description..."></textarea>
    <select id="category">
      <option value="movies">Movies</option>
      <option value="series">Series</option>
      <option value="18+">18+</option>
    </select>
    <button onclick="add()">Upload</button>

    <h3>Recent Uploads</h3>
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
          description: document.getElementById('desc').value,
          category: document.getElementById('category').value
        };
        if(!data.title) return alert("Missing Title");

        const res = await fetch('/api/add', { method: 'POST', body: JSON.stringify({ password: pass, data }) });
        if(res.ok) { alert("Uploaded!"); load(); document.getElementById('title').value=""; document.getElementById('link').value=""; document.getElementById('desc').value=""; }
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
