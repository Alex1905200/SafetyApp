import { supabase } from "../config/supabase";
import { Tables } from "../types/database.types";

export const getHistory = async (
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
