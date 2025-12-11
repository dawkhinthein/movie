// db.ts
const kv = await Deno.openKv();

export interface Episode {
  label: string;
  link: string;
}

export interface Movie {
  id: string;
  title: string;
  image: string; // Poster (Home Page အတွက်)
  cover: string; // 🔥 New: Cover/Backdrop (Player အတွက်)
  episodes: Episode[];
  description: string;
  category: string;
  tags: string[];
  timestamp: number;
}

export async function addOrUpdateMovie(data: any) {
  const id = data.id || Date.now().toString();
  const movie: Movie = {
    id,
    title: data.title,
    image: data.image,
    cover: data.cover || data.image, // Cover မထည့်ရင် Poster ပဲ ပြန်သုံးမယ်
    episodes: data.episodes,
    description: data.description,
    category: data.category,
    tags: data.tags,
    timestamp: Date.now()
  };
  
  await kv.set(["movies", id], movie);
}

export async function deleteMovie(id: string) {
  await kv.delete(["movies", id]);
}

export async function getMovies(page: number = 1, category: string = "all") {
  const entries = kv.list({ prefix: ["movies"] });
  let allMovies: Movie[] = [];
  for await (const entry of entries) {
    allMovies.push(entry.value as Movie);
  }

  allMovies.sort((a, b) => b.timestamp - a.timestamp);

  if (category !== "all") {
    allMovies = allMovies.filter((m) => m.category === category);
  }

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

// Reviews
export async function addReview(movieId: string, user: string, text: string) { /* Same as before */ }
export async function getReviews(movieId: string) { /* Same as before */ }
