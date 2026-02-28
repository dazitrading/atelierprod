import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Article } from "@/lib/data";

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("id, name, price, workshop_id")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching articles:", error);
      return;
    }
    const mapped = (data || []).map((a) => ({ id: a.id, name: a.name, price: Number(a.price), workshopId: a.workshop_id }));
    mapped.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    setArticles(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const addArticle = useCallback(async (article: Omit<Article, "id">) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Not authenticated");
    const { error } = await supabase.from("articles").insert({
      name: article.name,
      price: article.price,
      workshop_id: article.workshopId,
      user_id: session.user.id,
    });
    if (error) {
      console.error("Error adding article:", error);
      throw error;
    }
    await fetchArticles();
  }, [fetchArticles]);

  const updateArticle = useCallback(async (id: string, updates: Partial<Omit<Article, "id">>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.workshopId !== undefined) dbUpdates.workshop_id = updates.workshopId;
    const { error } = await supabase.from("articles").update(dbUpdates).eq("id", id);
    if (error) {
      console.error("Error updating article:", error);
      throw error;
    }
    await fetchArticles();
  }, [fetchArticles]);

  const deleteArticle = useCallback(async (id: string) => {
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) {
      console.error("Error deleting article:", error);
      throw error;
    }
    await fetchArticles();
  }, [fetchArticles]);

  const getArticlesForWorkshop = useCallback((workshopId: string) => {
    return articles.filter((a) => a.workshopId === workshopId);
  }, [articles]);

  return { articles, loading, fetchArticles, addArticle, updateArticle, deleteArticle, getArticlesForWorkshop };
}
