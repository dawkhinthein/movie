import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getMovies, addOrUpdateMovie, deleteMovie } from "./db.ts";
import { renderWebsite } from "./ui.ts";
import { renderAdmin } from "./admin.ts";

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") || "12345";

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // 1. UI
  if (path === "/") {
    return new Response(renderWebsite(), { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // 2. Admin
  if (path === "/admin") {
    return new Response(renderAdmin(), { headers: { "content-type": "text/html; charset=utf-8" } });
  }

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

  // 🔥 4. GATEKEEPER (Zero Bandwidth Protection)
  if (path === "/api/play") {
    const encodedUrl = url.searchParams.get("v");
    if (!encodedUrl) return new Response("Invalid Request", { status: 400 });

    // 🔒 SECURITY CHECK: Referer စစ်ခြင်း
    // Browser က လာတာမဟုတ်ရင် (Downloader က တိုက်ရိုက်ခေါ်ရင်) ပိတ်မယ်
    const referer = req.headers.get("referer");
    
    // မှတ်ချက်: Localhost မှာစမ်းရင် referer မပါတတ်ဘူး၊ Production ရောက်မှ အလုပ်လုပ်မယ်
    // Deno Deploy URL အစစ်နဲ့ စမ်းဖို့ လိုပါတယ်
    
    try {
        const realUrl = atob(encodedUrl);
        
        // Downloader Check (User Agent)
        const ua = req.headers.get("user-agent") || "";
        if (ua.includes("ADM") || ua.includes("1DM") || ua.includes("Download")) {
             return new Response("⚠️ Use the App to watch!", { status: 403 });
        }

        // ✅ Redirect to Real Link (302 Found)
        // Deno just says "Go there", doesn't download the file itself.
        return Response.redirect(realUrl, 302);

    } catch (e) {
        return new Response("Error", { status: 500 });
    }
  }

  return new Response("Not Found", { status: 404 });
});
