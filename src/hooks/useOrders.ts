import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Order {
  id: string;
  workshopId: string;
  articleId: string;
  quantity: number;
  color: string | null;
  date: string;
  createdAt: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("date", { ascending: false });
    if (!error && data) {
      setOrders(
        data.map((r) => ({
          id: r.id,
          workshopId: r.workshop_id,
          articleId: r.article_id,
          quantity: r.quantity,
          color: r.color,
          date: r.date,
          createdAt: r.created_at,
        }))
      );
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const addOrder = async (order: Omit<Order, "id" | "createdAt">) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    const { error } = await supabase.from("orders").insert({
      workshop_id: order.workshopId,
      article_id: order.articleId,
      quantity: order.quantity,
      color: order.color,
      date: order.date,
      user_id: userId,
    });
    if (error) throw error;
    await fetchOrders();
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
    await fetchOrders();
  };

  return { orders, fetchOrders, addOrder, deleteOrder };
}
