import { supabase } from "../config/supabase";
import { Tables } from "../types/database.types";

/**
 * Obtener alertas
 */
export const getAlerts = async (
  userId: string,
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
 * Resolver alerta (marcar como inactiva)
 */
export const resolveAlert = async (id: string): Promise<void> => {
  const { error } = await (supabase as any)
    .from("alerts")
    .update({ is_active: false, resolved_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
};
