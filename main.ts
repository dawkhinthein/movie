import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

// ✅ Link အသစ် (Working Import)
import CryptoJS from "https://esm.sh/crypto-js@4.2.0";

import { getMovies, addOrUpdateMovie, deleteMovie } from "./db.ts";
import { renderWebsite } from "./ui.ts";
import { renderAdmin } from "./admin.ts";

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") || "12345";

// Signature Helper
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

  // 3. API Standard
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

  // 🔥 4. SECURE LINK GENERATOR (AES ENCRYPTED)
  if (path === "/api/sign_url" && req.method === "POST") {
    try {
        const body = await req.json();
        const realUrl = body.url;
        if(!realUrl) return new Response("Error", { status: 400 });

        // 4 Hours Expiry
        const expiry = Date.now() + (4 * 60 * 60 * 1000); 
        
        // 🔐 AES ENCRYPTION (Corrected Syntax)
        const encryptedUrl = CryptoJS.AES.encrypt(realUrl, ADMIN_PASSWORD).toString();
        
        // URL Safe
        const safeUrl = encodeURIComponent(encryptedUrl);

        const signature = await createSignature(safeUrl + expiry);
        const token = `${safeUrl}.${expiry}.${signature}`;
        
        return new Response(JSON.stringify({ token }), { headers: { "content-type": "application/json" } });
    } catch (e) {
        return new Response("Error: " + e.message, { status: 500 });
    }
  }

  // 🔥 5. GATEKEEPER (AES DECRYPT)
  if (path === "/api/play") {
    const token = url.searchParams.get("t");
    if (!token) return new Response("Access Denied", { status: 403 });

    try {
        const parts = token.split('.');
        if(parts.length !== 3) return new Response("Invalid Token", { status: 403 });

        const [safeUrl, expiryStr, receivedSig] = parts;
        const expiry = parseInt(expiryStr);

        // 1. Check Expiry
        if (Date.now() > expiry) {
            return new Response("⚠️ Link Expired! Reload page.", { status: 410 });
        }

        // 2. Check Signature
        const expectedSig = await createSignature(safeUrl + expiry);
        if (receivedSig !== expectedSig) {
            return new Response("⚠️ Invalid Signature!", { status: 403 });
        }

        // 3. User Agent Block
        const ua = req.headers.get("user-agent") || "";
        if (ua.includes("ADM") || ua.includes("1DM") || ua.includes("Download")) {
             return new Response("⚠️ Watch in App only!", { status: 403 });
        }

        // 🔐 AES DECRYPTION (Corrected Syntax)
        const encryptedUrl = decodeURIComponent(safeUrl);
        const bytes = CryptoJS.AES.decrypt(encryptedUrl, ADMIN_PASSWORD);
        const realUrl = bytes.toString(CryptoJS.enc.Utf8);

        if(!realUrl || !realUrl.startsWith("http")) throw new Error("Decryption Failed");

        // ✅ Redirect to Real URL
        return Response.redirect(realUrl, 302);

    } catch (e) {
        return new Response("Server Error or Invalid Token", { status: 500 });
    }
  }

  return new Response("Not Found", { status: 404 });
});
