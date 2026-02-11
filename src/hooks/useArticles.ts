import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Article } from "@/lib/data";
import { useAuth } from "@/hooks/useAuth";

export function useArticles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("id, name, price")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching articles:", error);
      return;
    }
    setArticles((data || []).map((a) => ({ id: a.id, name: a.name, price: Number(a.price) })));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const addArticle = useCallback(async (article: Omit<Article, "id">) => {
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase.from("articles").insert({ name: article.name, price: article.price, user_id: user.id });
    if (error) {
      console.error("Error adding article:", error);
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

  return { articles, loading, fetchArticles, addArticle, deleteArticle };
}
