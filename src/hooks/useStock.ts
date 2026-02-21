import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StockEntry {
  id: string;
  articleId: string;
  workshopId: string;
  color: string | null;
  size: string | null;
  quantity: number;
  movementType: "in" | "out";
  date: string;
  note: string | null;
  detail: string | null;
  createdAt: string;
}

export function useStock() {
  const [stock, setStock] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStock = useCallback(async () => {
    const { data, error } = await supabase
      .from("stock")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching stock:", error);
      return;
    }
    setStock(
      (data || []).map((s: any) => ({
        id: s.id,
        articleId: s.article_id,
        workshopId: s.workshop_id,
        color: s.color,
        size: s.size,
        quantity: s.quantity,
        movementType: s.movement_type as "in" | "out",
        date: s.date,
        note: s.note,
        detail: s.detail ?? null,
        createdAt: s.created_at,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const addStock = useCallback(
    async (entry: Omit<StockEntry, "id" | "createdAt">) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("stock").insert({
        article_id: entry.articleId,
        workshop_id: entry.workshopId,
        color: entry.color,
        size: entry.size,
        quantity: entry.quantity,
        movement_type: entry.movementType,
        date: entry.date,
        note: entry.note,
        user_id: session.user.id,
      });
      if (error) {
        console.error("Error adding stock:", error);
        throw error;
      }
      await fetchStock();
    },
    [fetchStock]
  );

  const deleteStock = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("stock").delete().eq("id", id);
      if (error) {
        console.error("Error deleting stock:", error);
        throw error;
      }
      await fetchStock();
    },
    [fetchStock]
  );

  // Compute current stock levels grouped by article+color+size
  const getStockLevels = useCallback(() => {
    const map = new Map<string, { articleId: string; workshopId: string; color: string | null; size: string | null; quantity: number; detail: string | null }>();
    for (const s of stock) {
      const key = `${s.articleId}-${s.color || ""}-${s.size || ""}`;
      const existing = map.get(key);
      const delta = s.movementType === "in" ? s.quantity : -s.quantity;
      if (existing) {
        existing.quantity += delta;
        if (!existing.detail && s.detail) existing.detail = s.detail;
      } else {
        map.set(key, {
          articleId: s.articleId,
          workshopId: s.workshopId,
          color: s.color,
          size: s.size,
          quantity: delta,
          detail: s.detail,
        });
      }
    }
    return Array.from(map.values()).filter((l) => l.quantity !== 0);
  }, [stock]);

  return { stock, loading, fetchStock, addStock, deleteStock, getStockLevels };
}
