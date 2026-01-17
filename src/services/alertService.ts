import { supabase } from "../config/supabase";

type AlertType = "emergency" | "safe" | "danger_zone";

export const alertService = {
  async createAlert(
    userId: string,
    type: AlertType,
    latitude: number,
    longitude: number,
    message?: string,
  ) {
    try {
      const { data, error } = await supabase
        .from("alerts")
        .insert({
          user_id: userId,
          type,
          latitude,
          longitude,
          message: message || null,
          is_active: true,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error creating alert:", error);
      return { data: null, error };
    }
  },

  async getActiveAlerts(userId: string) {
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error getting alerts:", error);
      return { data: null, error };
    }
  },

  async getAllAlerts(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error getting all alerts:", error);
      return { data: null, error };
    }
  },

  async resolveAlert(alertId: string) {
    try {
      const { data, error } = await (supabase as any)
        .from("alerts")
        .update({
          is_active: false,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", alertId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error resolving alert:", error);
      return { data: null, error };
    }
  },

  subscribeToAlerts(userIds: string[], callback: (payload: any) => void) {
    return supabase
      .channel("alert-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
          filter: `user_id=in.(${userIds.join(",")})`,
        },
        callback,
      )
      .subscribe();
  },
};
