import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { getMovies, addOrUpdateMovie, deleteMovie } from "./db.ts";
import { renderWebsite } from "./ui.ts";
import { renderAdmin } from "./admin.ts";

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") || "12345";
const kv = await Deno.openKv(); // Need KV access for search/single fetch

// Custom Encryption & Helpers
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

  if (path === "/") return new Response(renderWebsite(), { headers: { "content-type": "text/html; charset=utf-8" } });
  if (path === "/admin") return new Response(renderAdmin(), { headers: { "content-type": "text/html; charset=utf-8" } });

  // --- STANDARD API ---
  if (path === "/api/movies" && req.method === "GET") {
    const page = parseInt(url.searchParams.get("page") || "1");
    const cat = url.searchParams.get("cat") || "all";
    const data = await getMovies(page, cat);
    return new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } });
  }

  // 🔥 NEW: GET SINGLE MOVIE (For Refresh Fix)
  if (path === "/api/get_movie") {
    const id = url.searchParams.get("id");
    if (!id) return new Response("{}", { headers: { "content-type": "application/json" } });
    const entry = await kv.get(["movies", id]);
    return new Response(JSON.stringify(entry.value || null), { headers: { "content-type": "application/json" } });
  }

  // 🔥 NEW: SEARCH API
  if (path === "/api/search") {
    const query = url.searchParams.get("q")?.toLowerCase() || "";
    const entries = kv.list({ prefix: ["movies"] });
    const results = [];
    for await (const entry of entries) {
        const m: any = entry.value;
        if (m.title.toLowerCase().includes(query) || (m.tags && m.tags.some((t:string) => t.toLowerCase().includes(query)))) {
            results.push(m);
        }
    }
    // Limit results to 20
    return new Response(JSON.stringify(results.slice(0, 20)), { headers: { "content-type": "application/json" } });
  }

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

  // --- SECURITY API ---
  if (path === "/api/sign_url" && req.method === "POST") {
    try {
        const body = await req.json();
        const realUrl = body.url;
        if(!realUrl) return new Response("Error", { status: 400 });
        const expiry = Date.now() + (4 * 60 * 60 * 1000); 
        const encryptedUrl = xorCipher(realUrl, ADMIN_PASSWORD);
        const signature = await createSignature(encryptedUrl + expiry);
        const token = `${encryptedUrl}.${expiry}.${signature}`;
        return new Response(JSON.stringify({ token }), { headers: { "content-type": "application/json" } });
    } catch (e) {
        return new Response("Error", { status: 500 });
    }
  }

  if (path === "/api/play") {
    const token = url.searchParams.get("t");
    if (!token) return new Response("Access Denied", { status: 403 });
    try {
        const parts = token.split('.');
        if(parts.length !== 3) return new Response("Invalid Token", { status: 403 });
        const [encryptedUrl, expiryStr, receivedSig] = parts;
        const expiry = parseInt(expiryStr);
        if (Date.now() > expiry) return new Response("Link Expired", { status: 410 });
        const expectedSig = await createSignature(encryptedUrl + expiry);
        if (receivedSig !== expectedSig) return new Response("Invalid Signature", { status: 403 });
        const ua = req.headers.get("user-agent") || "";
        if (ua.includes("ADM") || ua.includes("1DM") || ua.includes("Download")) return new Response("App Only", { status: 403 });
        const realUrl = xorDecrypt(encryptedUrl, ADMIN_PASSWORD);
        if(!realUrl.startsWith("http")) return new Response("Decryption Failed", { status: 400 });
        return Response.redirect(realUrl, 302);
    } catch (e) {
        return new Response("Server Error", { status: 500 });
    }
  }

  return new Response("Not Found", { status: 404 });
});
