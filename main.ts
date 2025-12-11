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
    await addOrUpdateMovie(body.data); // Handles both Add and Edit
    return new Response("Success");
  }

  if (path === "/api/delete" && req.method === "POST") {
    const body = await req.json();
    if (body.password !== ADMIN_PASSWORD) return new Response("Forbidden", { status: 403 });
    await deleteMovie(body.id);
    return new Response("Deleted");
  }

  return new Response("Not Found", { status: 404 });
});
