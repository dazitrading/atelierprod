import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProductionEntry } from "@/lib/data";

export function useProduction() {
  const [production, setProduction] = useState<ProductionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProduction = useCallback(async () => {
    const { data, error } = await supabase
      .from("production")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching production:", error);
      return;
    }
    setProduction(
      (data || []).map((e) => ({
        id: e.id,
        workshopId: e.workshop_id,
        articleId: e.article_id,
        quantity: e.quantity,
        date: e.date,
        color: e.color ?? undefined,
        size: (e as any).size ?? undefined,
        detail: e.detail ?? undefined,
        createdAt: e.created_at,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProduction();
  }, [fetchProduction]);

  const addProduction = useCallback(async (entry: Omit<ProductionEntry, "id">) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Not authenticated");
    const { error } = await supabase.from("production").insert({
      workshop_id: entry.workshopId,
      article_id: entry.articleId,
      quantity: entry.quantity,
      date: entry.date,
      color: entry.color || null,
      size: entry.size || null,
      detail: entry.detail || null,
      user_id: session.user.id,
    });
    if (error) throw error;

    // Auto-add stock entry (entrée) for production from workshops
    const { error: stockError } = await supabase.from("stock").insert({
      article_id: entry.articleId,
      workshop_id: entry.workshopId,
      color: entry.color || null,
      size: entry.size || null,
      quantity: entry.quantity,
      movement_type: "in",
      date: entry.date,
      note: `Production ${entry.workshopId}`,
      user_id: session.user.id,
    });
    if (stockError) console.error("Erreur ajout stock auto:", stockError);

    await fetchProduction();
  }, [fetchProduction]);

  const updateProduction = useCallback(async (id: string, updates: Partial<Omit<ProductionEntry, "id">>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.workshopId !== undefined) dbUpdates.workshop_id = updates.workshopId;
    if (updates.articleId !== undefined) dbUpdates.article_id = updates.articleId;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.color !== undefined) dbUpdates.color = updates.color || null;
    if (updates.size !== undefined) dbUpdates.size = updates.size || null;
    if (updates.detail !== undefined) dbUpdates.detail = updates.detail || null;

    const { error } = await supabase.from("production").update(dbUpdates).eq("id", id);
    if (error) throw error;
    await fetchProduction();
  }, [fetchProduction]);

  const deleteProduction = useCallback(async (id: string) => {
    const { error } = await supabase.from("production").delete().eq("id", id);
    if (error) throw error;
    await fetchProduction();
  }, [fetchProduction]);

  return { production, loading, fetchProduction, addProduction, updateProduction, deleteProduction };
}
