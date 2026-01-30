import { supabase } from "../config/supabase";
import { Tables } from "../types/database.types";

export const settingsService = {
  async getUserSettings(userId: string) {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return { data: profile, error: null };
    } catch (error) {
      console.error("Error getting settings:", error);
      return { data: null, error };
    }
  },

  async updateSettings(userId: string, updates: Record<string, any>) {
    try {
      const { data, error } = await (supabase as any)
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error updating settings:", error);
      return { data: null, error };
    }
  },
};
