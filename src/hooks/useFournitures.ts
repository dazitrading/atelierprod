import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Fourniture {
  id: string;
  workshopId: string;
  article: string;
  quantity: number;
  unitPrice: number;
  createdAt?: string;
}

export function useFournitures() {
  const [fournitures, setFournitures] = useState<Fourniture[]>([]);

  const fetchFournitures = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data, error } = await supabase
      .from("fournitures")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Erreur fournitures:", error);
      return;
    }
    setFournitures(
      (data || []).map((r) => ({
        id: r.id,
        workshopId: r.workshop_id,
        article: r.article,
        quantity: r.quantity,
        unitPrice: r.unit_price,
        createdAt: r.created_at,
      }))
    );
  };

  useEffect(() => {
    fetchFournitures();
  }, []);

  const addFourniture = async (f: Omit<Fourniture, "id">) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Non connecté");
    const { error } = await supabase.from("fournitures").insert({
      workshop_id: f.workshopId,
      article: f.article,
      quantity: f.quantity,
      unit_price: f.unitPrice,
      user_id: session.user.id,
    });
    if (error) throw error;
    await fetchFournitures();
  };

  const updateFourniture = async (id: string, updates: Partial<Omit<Fourniture, "id">>) => {
    const mapped: Record<string, unknown> = {};
    if (updates.article !== undefined) mapped.article = updates.article;
    if (updates.quantity !== undefined) mapped.quantity = updates.quantity;
    if (updates.unitPrice !== undefined) mapped.unit_price = updates.unitPrice;
    const { error } = await supabase.from("fournitures").update(mapped).eq("id", id);
    if (error) throw error;
    await fetchFournitures();
  };

  const deleteFourniture = async (id: string) => {
    const { error } = await supabase.from("fournitures").delete().eq("id", id);
    if (error) throw error;
    await fetchFournitures();
  };

  return { fournitures, fetchFournitures, addFourniture, updateFourniture, deleteFourniture };
}
