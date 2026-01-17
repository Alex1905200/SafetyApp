import { supabase } from "../config/supabase";
import { Tables } from "../types/database.types";

/**
 * Obtener alertas
 */
export const getAlerts = async (
  userId: string
): Promise<Tables<"alerts">[]> => {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

/**
 * Marcar alerta como leída
 */
export const markAlertAsRead = async (id: string): Promise<void> => {
  const { error } = await (supabase as any)
    .from("alerts")
    .update({ is_read: true })
    .eq("id", id);

  if (error) throw error;
};
