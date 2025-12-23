import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
// 🔥 Make sure these are imported from db.ts
import { 
  getMovies, addOrUpdateMovie, deleteMovie, 
  registerUser, loginUser, getUser, generateVipCode, redeemCode, 
  getAllUsers, resetUserPassword 
} from "./db.ts";
import { renderWebsite } from "./ui.ts";
import { renderAdmin } from "./admin.ts";

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") || "12345";
const kv = await Deno.openKv();

// --- HELPERS ---
function xorCipher(text: string, key: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) result += (text.charCodeAt(i) ^ key.charCodeAt(i % key.length)).toString(16).padStart(2, "0");
  return result;
}
function xorDecrypt(hex: string, key: string): string {
  let result = "";
  for (let i = 0; i < hex.length; i += 2) result += String.fromCharCode(parseInt(hex.substr(i, 2), 16) ^ key.charCodeAt((i / 2) % key.length));
  return result;
}
async function createSignature(text: string): Promise<string> {
  const data = new TextEncoder().encode(text + ADMIN_PASSWORD);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  
  const secureHeaders = {
    "content-type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };

  if (path === "/") return new Response(renderWebsite(), { headers: { "content-type": "text/html; charset=utf-8" } });
  if (path === "/admin") return new Response(renderAdmin(), { headers: { "content-type": "text/html; charset=utf-8" } });

  // --- PUBLIC API ---
  if (path === "/api/movies") {
    const page = parseInt(url.searchParams.get("page") || "1");
    const cat = url.searchParams.get("cat") || "all";
    const data = await getMovies(page, cat);
    return new Response(JSON.stringify(data), { headers: secureHeaders });
  }

  if (path === "/api/get_movie") {
    const id = url.searchParams.get("id");
    if (!id) return new Response("{}", { headers: secureHeaders });
    const entry = await kv.get(["movies", id]);
    return new Response(JSON.stringify(entry.value || null), { headers: secureHeaders });
  }
  
  if (path === "/api/search") {
    const query = url.searchParams.get("q")?.toLowerCase() || "";
    const entries = kv.list({ prefix: ["movies"] });
    const results = [];
    for await (const entry of entries) {
        const m: any = entry.value;
        if (m.title.toLowerCase().includes(query)) results.push(m);
    }
    return new Response(JSON.stringify(results.slice(0, 20)), { headers: secureHeaders });
  }

  // --- AUTH API ---
  if (path === "/api/auth/register" && req.method === "POST") {
      try {
          const { username, password } = await req.json();
          await registerUser(username, password);
          return new Response("OK", { headers: secureHeaders });
      } catch(e) { return new Response(e.message, { status: 400 }); }
  }
  
  if (path === "/api/auth/login" && req.method === "POST") {
      try {
          const { username, password } = await req.json();
          const user = await loginUser(username, password);
          return new Response(JSON.stringify(user), { headers: secureHeaders });
      } catch(e) { return new Response("Fail", { status: 401 }); }
  }

  if (path === "/api/auth/redeem" && req.method === "POST") {
      try {
          const { username, code } = await req.json();
          const user = await redeemCode(username, code);
          return new Response(JSON.stringify(user), { headers: secureHeaders });
      } catch(e) { return new Response("Invalid Code", { status: 400 }); }
  }

  // --- ADMIN API ---
  if (path === "/api/add" && req.method === "POST") {
    const body = await req.json();
    if (body.password !== ADMIN_PASSWORD) return new Response("Forbidden", { status: 403 });
    await addOrUpdateMovie(body.data);
    return new Response("Success");
  }
  
  if (path === "/api/delete" && req.method === "POST") {
    const body = await req.json();
    if (body.password !== ADMIN_PASSWORD) return new Response("Forbidden", { status: 403 });
    await deleteMovie(body.id);
    return new Response("Deleted");
  }

  if (path === "/api/gen_code" && req.method === "POST") {
      const body = await req.json();
      if (body.password !== ADMIN_PASSWORD) return new Response("Forbidden", { status: 403 });
      const code = await generateVipCode(body.days || 30);
      return new Response(JSON.stringify({ code }), { headers: secureHeaders });
  }

  // 🔥 FIX 1: Add Missing Admin User Endpoints
  if (path === "/api/admin/users" && req.method === "POST") {
      const body = await req.json();
      if (body.password !== ADMIN_PASSWORD) return new Response("Forbidden", { status: 403 });
      const users = await getAllUsers();
      return new Response(JSON.stringify(users), { headers: secureHeaders });
  }

  if (path === "/api/admin/reset_user" && req.method === "POST") {
      const body = await req.json();
      if (body.password !== ADMIN_PASSWORD) return new Response("Forbidden", { status: 403 });
      await resetUserPassword(body.username, body.newPass);
      return new Response("Reset Success");
  }

  // --- PLAYBACK (ပြင်ဆင်ပြီး) ---
if (path === "/api/sign_url" && req.method === "POST") {
  try {
      const body = await req.json();
      // UI ကနေ realUrl ကို ပို့စရာမလိုတော့ပါ၊ movieId နဲ့ epIndex ပဲ ပို့ခိုင်းပါမယ်
      const { movieId, epIndex, username } = body; 
      
      if (!movieId) return new Response("Movie ID Required", { status: 400 });

      // Database ထဲမှာ ရုပ်ရှင်သွားရှာမယ်
      const mRes = await kv.get(["movies", movieId]);
      const movie: any = mRes.value;
      if (!movie) return new Response("Movie Not Found", { status: 404 });

      // VIP စစ်ဆေးတဲ့ logic (မူလအတိုင်း)
      if (movie.isPremium) {
          if (!username) return new Response("Login Required", { status: 401 });
          const uRes = await getUser(username);
          if (!uRes || uRes.vipExpiry < Date.now()) return new Response("VIP Required", { status: 403 });
      }

      // ဇာတ်လမ်းတွဲဆိုရင် episode link ယူမယ်၊ ရုပ်ရှင်ဆိုရင် downloadLink ယူမယ်
      let realUrl = "";
      if (epIndex !== undefined && movie.episodes && movie.episodes[epIndex]) {
          realUrl = movie.episodes[epIndex].link;
      } else {
          realUrl = movie.Link;
      }

      if (!realUrl) return new Response("No Link Available", { status: 404 });

      // Link ကို Mask လုပ်ပြီး Token ထုတ်ပေးမယ်
      const expiry = Date.now() + (4 * 60 * 60 * 1000); // 4 hours
      const encryptedUrl = xorCipher(realUrl, ADMIN_PASSWORD);
      const signature = await createSignature(encryptedUrl + expiry);
      const token = `${encryptedUrl}.${expiry}.${signature}`;
      
      return new Response(JSON.stringify({ token }), { headers: secureHeaders });
  } catch (e) { return new Response("Error", { status: 500 }); }
}

  if (path === "/api/play") {
    const token = url.searchParams.get("t");
    if (!token) return new Response("Access Denied", { status: 403 });
    try {
        const parts = token.split('.');
        if(parts.length !== 3) return new Response("Invalid Token", { status: 403 });
        const [encryptedUrl, expiryStr, receivedSig] = parts;
        if (Date.now() > parseInt(expiryStr)) return new Response("Link Expired", { status: 410 });
        const expectedSig = await createSignature(encryptedUrl + parseInt(expiryStr));
        if (receivedSig !== expectedSig) return new Response("Invalid Signature", { status: 403 });
        
        const realUrl = xorDecrypt(encryptedUrl, ADMIN_PASSWORD);
        return Response.redirect(realUrl, 302);
    } catch (e) { return new Response("Server Error", { status: 500 }); }
  }

  return new Response("Not Found", { status: 404 });
});
