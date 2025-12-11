import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { getMovies, addOrUpdateMovie, deleteMovie } from "./db.ts";
import { renderWebsite } from "./ui.ts";
import { renderAdmin } from "./admin.ts";

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") || "12345";

// Security Helper: Create Signature
async function createSignature(text: string): Promise<string> {
  const data = new TextEncoder().encode(text + ADMIN_PASSWORD);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // 1. UI
  if (path === "/") return new Response(renderWebsite(), { headers: { "content-type": "text/html; charset=utf-8" } });

  // 2. Admin
  if (path === "/admin") return new Response(renderAdmin(), { headers: { "content-type": "text/html; charset=utf-8" } });

  // 3. API
  if (path === "/api/movies" && req.method === "GET") {
    const page = parseInt(url.searchParams.get("page") || "1");
    const cat = url.searchParams.get("cat") || "all";
    const data = await getMovies(page, cat);
    return new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } });
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

  // 🔥 4. SECURE LINK GENERATOR (User Play နှိပ်မှ အလုပ်လုပ်မယ်)
  if (path === "/api/sign_url" && req.method === "POST") {
    try {
        const body = await req.json();
        const realUrl = body.url;
        if(!realUrl) return new Response("Error", { status: 400 });

        // 🔥 4 HOURS EXPIRY (၄ နာရီ သတ်မှတ်ခြင်း)
        const expiry = Date.now() + (4 * 60 * 60 * 1000); 
        
        const b64Url = btoa(realUrl);
        const signature = await createSignature(b64Url + expiry);
        const token = `${b64Url}.${expiry}.${signature}`;
        
        return new Response(JSON.stringify({ token }), { headers: { "content-type": "application/json" } });
    } catch (e) {
        return new Response("Error", { status: 500 });
    }
  }

  // 🔥 5. GATEKEEPER (Checks Token)
  if (path === "/api/play") {
    const token = url.searchParams.get("t");
    if (!token) return new Response("Access Denied", { status: 403 });

    try {
        const parts = token.split('.');
        if(parts.length !== 3) return new Response("Invalid Token", { status: 403 });

        const [b64Url, expiryStr, receivedSig] = parts;
        const expiry = parseInt(expiryStr);

        // Check 1: Time
        if (Date.now() > expiry) {
            return new Response("⚠️ Link Expired! Reload page.", { status: 410 });
        }

        // Check 2: Signature
        const expectedSig = await createSignature(b64Url + expiry);
        if (receivedSig !== expectedSig) {
            return new Response("⚠️ Invalid Signature!", { status: 403 });
        }

        // Check 3: User Agent (Block Downloaders)
        const ua = req.headers.get("user-agent") || "";
        if (ua.includes("ADM") || ua.includes("1DM") || ua.includes("Download")) {
             return new Response("⚠️ Watch in App only!", { status: 403 });
        }

        // ✅ Redirect to Real URL
        const realUrl = atob(b64Url);
        return Response.redirect(realUrl, 302);

    } catch (e) {
        return new Response("Server Error", { status: 500 });
    }
  }

  return new Response("Not Found", { status: 404 });
});
