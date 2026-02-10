export interface Article {
  id: string;
  name: string;
  price: number;
}

export interface ProductionEntry {
  id: string;
  workshopId: string;
  articleId: string;
  quantity: number;
  date: string; // ISO date string
  color?: string;
  detail?: string;
}

export interface Workshop {
  id: string;
  name: string;
}

export const WORKSHOPS: Workshop[] = [
  { id: "atelier-1", name: "MESKINE" },
  { id: "atelier-2", name: "BOUJIDI" },
  { id: "atelier-3", name: "DRISS" },
];

const STORAGE_KEYS = {
  articles: "confection_articles",
  production: "confection_production",
};

export function getArticles(): Article[] {
  const data = localStorage.getItem(STORAGE_KEYS.articles);
  return data ? JSON.parse(data) : [];
}

export function saveArticles(articles: Article[]) {
  localStorage.setItem(STORAGE_KEYS.articles, JSON.stringify(articles));
}

export function addArticle(article: Omit<Article, "id">): Article {
  const articles = getArticles();
  const newArticle = { ...article, id: crypto.randomUUID() };
  articles.push(newArticle);
  saveArticles(articles);
  return newArticle;
}

export function deleteArticle(id: string) {
  saveArticles(getArticles().filter((a) => a.id !== id));
}

export function getProduction(): ProductionEntry[] {
  const data = localStorage.getItem(STORAGE_KEYS.production);
  return data ? JSON.parse(data) : [];
}

export function saveProduction(entries: ProductionEntry[]) {
  localStorage.setItem(STORAGE_KEYS.production, JSON.stringify(entries));
}

export function addProduction(entry: Omit<ProductionEntry, "id">): ProductionEntry {
  const entries = getProduction();
  const newEntry = { ...entry, id: crypto.randomUUID() };
  entries.push(newEntry);
  saveProduction(entries);
  return newEntry;
}

export function deleteProduction(id: string) {
  saveProduction(getProduction().filter((e) => e.id !== id));
}

export function updateProduction(id: string, updates: Partial<Omit<ProductionEntry, "id">>) {
  const entries = getProduction();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx !== -1) {
    entries[idx] = { ...entries[idx], ...updates };
    saveProduction(entries);
  }
}

export function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
  };
}

export function getWorkshopWeeklyTotal(
  workshopId: string,
  production: ProductionEntry[],
  articles: Article[],
  weekStart: string,
  weekEnd: string
): { totalAmount: number; totalItems: number } {
  const articleMap = new Map(articles.map((a) => [a.id, a]));
  const filtered = production.filter(
    (e) => e.workshopId === workshopId && e.date >= weekStart && e.date <= weekEnd
  );
  let totalAmount = 0;
  let totalItems = 0;
  for (const entry of filtered) {
    const article = articleMap.get(entry.articleId);
    if (article) {
      totalAmount += entry.quantity * article.price;
      totalItems += entry.quantity;
    }
  }
  return { totalAmount, totalItems };
}
