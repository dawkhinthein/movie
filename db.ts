// Deno KV Database ချိတ်ဆက်ခြင်း
const kv = await Deno.openKv();

// --- TYPE DEFINITIONS (အချက်အလက် ပုံစံများ) ---

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
  downloadLink?: string;
  isPremium: boolean;
  timestamp: number; // For sorting latest
}

export interface User {
  username: string;
  password: string;
  vipExpiry: number; // VIP သက်တမ်းကုန်ဆုံးမည့်ရက် (Timestamp)
}

// --- MOVIE FUNCTIONS (ဇာတ်ကား စီမံခန့်ခွဲမှု) ---

export async function addOrUpdateMovie(data: any) {
  const id = data.id || Date.now().toString();
  
  const movie: Movie = {
    id: id,
    title: data.title,
    image: data.image,
    cover: data.cover || data.image, // Cover မရှိရင် Poster သုံးမယ်
    episodes: data.episodes || [],
    description: data.description || "",
    category: data.category || "movies",
    tags: data.tags || [],
    downloadLink: data.downloadLink || "",
    isPremium: data.isPremium || false,
    timestamp: Date.now() // Edit တိုင်း အပေါ်ဆုံးရောက်မယ်
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

  // Sort by Latest (Updated Time)
  allMovies.sort((a, b) => b.timestamp - a.timestamp);

  // Filter by Category or Tag (e.g. "18+")
  if (category !== "all") {
    allMovies = allMovies.filter((m) => 
      m.category === category || (m.tags && m.tags.includes(category))
    );
  }

  // Pagination Logic (တစ်မျက်နှာလျှင် ၂၀ ကား)
  const ITEMS_PER_PAGE = 20;
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

// --- USER & AUTH SYSTEM (အကောင့်စနစ်) ---

export async function registerUser(u: string, p: string) {
  const existing = await kv.get(["users", u]);
  if(existing.value) throw new Error("Username already taken");
  
  const user: User = { 
    username: u, 
    password: p, 
    vipExpiry: 0 
  };
  
  await kv.set(["users", u], user);
  return user;
}

export async function loginUser(u: string, p: string) {
  const res = await kv.get(["users", u]);
  const user = res.value as User;
  
  if(!user || user.password !== p) throw new Error("Invalid username or password");
  return user;
}

export async function getUser(u: string) {
  const res = await kv.get(["users", u]);
  return res.value as User;
}

// --- ADMIN USER MANAGEMENT (Admin က User တွေကို ကြည့်/ပြင်) ---

export async function getAllUsers() {
  const iter = kv.list({ prefix: ["users"] });
  const users = [];
  for await (const res of iter) {
    users.push(res.value);
  }
  return users;
}

export async function resetUserPassword(username: string, newPass: string) {
  const res = await kv.get(["users", username]);
  if (!res.value) throw new Error("User not found");
  
  const user = res.value as User;
  user.password = newPass; // Update Password
  await kv.set(["users", username], user);
}

// --- VIP SYSTEM (ကုဒ်ထုတ်ခြင်း/ဖြည့်ခြင်း) ---

export async function generateVipCode(days: number) {
  // 6 လုံးတွဲ ကုဒ်ထုတ်မယ် (ဥပမာ: X7A9B2)
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  await kv.set(["codes", code], days);
  return code;
}

export async function redeemCode(username: string, code: string) {
  const codeRes = await kv.get(["codes", code]);
  if(!codeRes.value) throw new Error("Invalid or Expired Code");
  
  const days = codeRes.value as number;
  const userRes = await kv.get(["users", username]);
  const user = userRes.value as User;

  // လက်ရှိသက်တမ်းကျန်ရင် အဲ့ဒီအပေါ်ပေါင်းမယ်၊ မကျန်ရင် ဒီနေ့ကစပေါင်းမယ်
  const currentExp = Math.max(Date.now(), user.vipExpiry);
  user.vipExpiry = currentExp + (days * 24 * 60 * 60 * 1000);
  
  await kv.set(["users", username], user);
  await kv.delete(["codes", code]); // ကုဒ်ကို သုံးပြီးရင် ဖျက်မယ်
  
  return user;
}

// --- REVIEWS SYSTEM (Future Placeholder) ---
// နောက်ပိုင်း Comment/Review စနစ်ထည့်ချင်ရင် ဒီမှာ ဆက်ရေးလို့ရအောင် နေရာချန်ထားပါတယ်
export async function addReview(movieId: string, user: string, text: string) {
    // Future implementation
}

export async function getReviews(movieId: string) {
    // Future implementation
    return [];
}
