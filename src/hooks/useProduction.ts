import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProductionEntry, Article } from "@/lib/data";
import { WORKSHOPS } from "@/lib/data";

async function sendTelegramNotification(entry: Omit<ProductionEntry, "id">, articleName: string) {
  try {
    const workshopName = WORKSHOPS.find(w => w.id === entry.workshopId)?.name || entry.workshopId;
    const lines = [
      `📦 *Nouvelle Production*`,
      `🏭 Atelier: ${workshopName}`,
      `👔 Article: ${articleName}`,
      `🔢 Quantité: ${entry.quantity}`,
      `📅 Date: ${new Date(entry.date).toLocaleDateString("fr-FR")}`,
    ];
    if (entry.color) lines.push(`🎨 Couleur: ${entry.color}`);
    if (entry.size) lines.push(`📏 Taille: ${entry.size}`);
    if (entry.detail) lines.push(`📝 Détails: ${entry.detail}`);

    await supabase.functions.invoke("send-telegram", {
      body: { message: lines.join("\n") },
    });
  } catch (err) {
    console.error("Erreur notification Telegram:", err);
  }
}

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
        destination: (e as any).destination ?? undefined,
        createdAt: e.created_at,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProduction();
  }, [fetchProduction]);

  const addProduction = useCallback(async (entry: Omit<ProductionEntry, "id">, articleName?: string) => {
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
      destination: entry.destination || null,
      user_id: session.user.id,
    });
    if (error) throw error;

    // Send Telegram notification
    const name = articleName || entry.articleId;
    sendTelegramNotification(entry, name);

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
    if (updates.destination !== undefined) dbUpdates.destination = updates.destination || null;

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
