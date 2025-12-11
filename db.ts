// db.ts
const kv = await Deno.openKv();

export interface Episode {
  label: string;
  link: string;
}

export interface Movie {
  id: string;
  title: string;
  image: string;
  cover: string;
  episodes: Episode[];
  description: string;
  category: string;
  tags: string[];
  timestamp: number;
}

export async function addOrUpdateMovie(data: any) {
  // ID ရှိရင် (Edit) မရှိရင် (New)
  const id = data.id || Date.now().toString();
  
  const movie: Movie = {
    id,
    title: data.title,
    image: data.image,
    cover: data.cover || data.image,
    episodes: data.episodes,
    description: data.description,
    category: data.category,
    tags: data.tags || [],
    // 🔥 Key Change: Edit လုပ်တိုင်း အချိန်ကို အသစ်ပြန်ယူမယ် (ဒါမှ အပေါ်ဆုံးရောက်မှာ)
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

  // 🔥 Sort: Timestamp အကြီးဆုံး (နောက်ဆုံးပြင်တာ) က အပေါ်ဆုံးမှာနေမယ်
  allMovies.sort((a, b) => b.timestamp - a.timestamp);

  // Filter Logic (Category သို့မဟုတ် Tag နဲ့တိုက်စစ်မယ်)
  if (category !== "all") {
    allMovies = allMovies.filter((m) => 
      m.category === category || (m.tags && m.tags.includes(category))
    );
  }

  // Pagination Logic
  const ITEMS_PER_PAGE = 20; // တမျက်နှာမှာ ၂၀ ကားပြမယ်
  const totalMovies = allMovies.length;
  const totalPages = Math.ceil(totalMovies / ITEMS_PER_PAGE);
  
  // Page boundaries check
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  
  const data = allMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return {
    data,
    currentPage: safePage,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}
