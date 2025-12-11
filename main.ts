// main.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getMovies, addMovie, deleteMovie, addReview, getReviews } from "./db.ts";
import { renderWebsite } from "./ui.ts";
import { renderAdmin } from "./admin.ts";

// Password from Deno Environment
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") || "12345";

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // 1️⃣ UI Route
  if (path === "/") {
    return new Response(renderWebsite(), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // 2️⃣ Admin Route
  if (path === "/admin") {
    return new Response(renderAdmin(), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // 3️⃣ API Routes (Connects to db.ts)
  
  // GET MOVIES
  if (path === "/api/movies" && req.method === "GET") {
    const page = parseInt(url.searchParams.get("page") || "1");
    const cat = url.searchParams.get("cat") || "all";
    const data = await getMovies(page, cat);
    return new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } });
  }

  // ADD MOVIE
  if (path === "/api/add" && req.method === "POST") {
    const body = await req.json();
    if (body.password !== ADMIN_PASSWORD) return new Response("Forbidden", { status: 403 });
    await addMovie(body.data);
    return new Response("Success");
  }

  // DELETE MOVIE
  if (path === "/api/delete" && req.method === "POST") {
    const body = await req.json();
    if (body.password !== ADMIN_PASSWORD) return new Response("Forbidden", { status: 403 });
    await deleteMovie(body.id);
    return new Response("Deleted");
  }

  // REVIEWS
  if (path === "/api/get_reviews") {
    const id = url.searchParams.get("id") || "";
    const reviews = await getReviews(id);
    return new Response(JSON.stringify(reviews), { headers: { "content-type": "application/json" } });
  }

  if (path === "/api/add_review" && req.method === "POST") {
    const body = await req.json();
    await addReview(body.movieId, body.user, body.text);
    return new Response("Success");
  }

  return new Response("Not Found", { status: 404 });
});
