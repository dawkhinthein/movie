// db.ts
const kv = await Deno.openKv();

export interface Movie {
  id: string;
  title: string;
  image: string;
  link: string;
  description: string;
  category: string;
}

export async function addMovie(data: any) {
  const id = Date.now().toString();
  await kv.set(["movies", id], { id, ...data });
}

export async function deleteMovie(id: string) {
  await kv.delete(["movies", id]);
  // Delete reviews associated with movie
  const reviews = kv.list({ prefix: ["reviews", id] });
  for await (const r of reviews) await kv.delete(r.key);
}

export async function getMovies(page: number = 1, category: string = "all") {
  const entries = kv.list({ prefix: ["movies"] });
  let allMovies: Movie[] = [];
  for await (const entry of entries) {
    allMovies.push(entry.value as Movie);
  }

  // Latest First
  allMovies.reverse();

  // Filter
  if (category !== "all") {
    allMovies = allMovies.filter((m) => m.category === category);
  }

  // Pagination Logic
  const ITEMS_PER_PAGE = 15;
  const totalMovies = allMovies.length;
  const totalPages = Math.ceil(totalMovies / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const data = allMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return {
    data,
    currentPage: page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// Review System
export async function addReview(movieId: string, user: string, text: string) {
  const reviewId = Date.now().toString();
  await kv.set(["reviews", movieId, reviewId], {
    user: user || "Anonymous",
    text,
    date: new Date().toLocaleDateString(),
  });
}

export async function getReviews(movieId: string) {
  const entries = kv.list({ prefix: ["reviews", movieId] });
  const reviews = [];
  for await (const entry of entries) reviews.push(entry.value);
  return reviews.reverse();
}
