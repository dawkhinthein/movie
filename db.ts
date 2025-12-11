const kv = await Deno.openKv();

export interface Episode {
  label: string; // ဥပမာ: "S1 E1"
  link: string;  // Video Link
}

export interface Movie {
  id: string;
  title: string;
  image: string;
  episodes: Episode[]; // Series အတွက် Link အများကြီး
  description: string;
  category: string;
  tags: string[]; // Tags (Horror, 2025...)
  timestamp: number;
}

export async function addOrUpdateMovie(data: any) {
  // ID ပါလာရင် Edit (Update), မပါရင် New (Add)
  const id = data.id || Date.now().toString();
  const movie: Movie = {
    id,
    title: data.title,
    image: data.image,
    episodes: data.episodes, // Array of links
    description: data.description,
    category: data.category,
    tags: data.tags, // Array of tags
    timestamp: Date.now() // For sorting
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

  // Latest First
  allMovies.sort((a, b) => b.timestamp - a.timestamp);

  // Filter Category
  if (category !== "all") {
    allMovies = allMovies.filter((m) => m.category === category);
  }

  // Pagination
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
