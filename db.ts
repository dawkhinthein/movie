// db.ts
const kv = await Deno.openKv();

export interface Movie {
  id: string;
  title: string;
  image: string;
  cover: string;
  episodes: any[];
  description: string;
  category: string;
  tags: string[];
  downloadLink?: string;
  isPremium: boolean; // 🔥 New: Premium စစ်ဖို့
  timestamp: number;
}

export interface User {
  username: string;
  password: string; // In real app, hash this!
  vipExpiry: number; // 0 = Free, > Date.now() = VIP
}

// --- MOVIE FUNCTIONS ---
export async function addOrUpdateMovie(data: any) {
  const id = data.id || Date.now().toString();
  const movie: Movie = {
    ...data,
    id,
    cover: data.cover || data.image,
    timestamp: Date.now()
  };
  await kv.set(["movies", id], movie);
}

export async function deleteMovie(id: string) { await kv.delete(["movies", id]); }

export async function getMovies(page: number = 1, category: string = "all") {
  const entries = kv.list({ prefix: ["movies"] });
  let allMovies: Movie[] = [];
  for await (const entry of entries) allMovies.push(entry.value as Movie);

  allMovies.sort((a, b) => b.timestamp - a.timestamp);

  if (category !== "all") {
    allMovies = allMovies.filter((m) => 
      m.category === category || (m.tags && m.tags.includes(category))
    );
  }
  // Pagination simplified for brevity
  return { data: allMovies, currentPage: 1, totalPages: 1 };
}

// --- 🔥 USER & VIP SYSTEM ---

export async function registerUser(u: string, p: string) {
  const existing = await kv.get(["users", u]);
  if(existing.value) throw new Error("User exists");
  const user: User = { username: u, password: p, vipExpiry: 0 };
  await kv.set(["users", u], user);
  return user;
}

export async function loginUser(u: string, p: string) {
  const res = await kv.get(["users", u]);
  const user = res.value as User;
  if(!user || user.password !== p) throw new Error("Invalid login");
  return user;
}

export async function getUser(u: string) {
  const res = await kv.get(["users", u]);
  return res.value as User;
}

export async function generateVipCode(days: number) {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  await kv.set(["codes", code], days);
  return code;
}

export async function redeemCode(username: string, code: string) {
  const codeRes = await kv.get(["codes", code]);
  if(!codeRes.value) throw new Error("Invalid Code");
  
  const days = codeRes.value as number;
  const userRes = await kv.get(["users", username]);
  const user = userRes.value as User;

  // Add days
  const currentExp = Math.max(Date.now(), user.vipExpiry);
  user.vipExpiry = currentExp + (days * 24 * 60 * 60 * 1000);
  
  await kv.set(["users", username], user);
  await kv.delete(["codes", code]); // Delete code after use
  return user;
}
