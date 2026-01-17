import { supabase } from "../config/supabase";
import * as Notifications from "expo-notifications";

// Configurar cómo se muestran las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type NotificationType = "alert" | "location" | "info" | "danger_zone";

export const notificationService = {
  // Solicitar permisos de notificaciones
  async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return { granted: status === "granted", error: null };
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return { granted: false, error };
    }
  },

  // Enviar notificación local (que aparece en el dispositivo)
  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: null, // null = inmediato
      });
      return { success: true, error: null };
    } catch (error) {
      console.error("Error sending local notification:", error);
      return { success: false, error };
    }
  },

  // Crear notificación en base de datos
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    data?: Record<string, any>,
  ) {
    try {
      const { data: notificationData, error } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          title,
          message,
          type,
          data: data || null,
          is_read: false,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return { data: notificationData, error: null };
    } catch (error) {
      console.error("Error creating notification:", error);
      return { data: null, error };
    }
  },

  // Obtener notificaciones de un usuario
  async getNotifications(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error getting notifications:", error);
      return { data: null, error };
    }
  },

  // Marcar notificación como leída
  async markAsRead(notificationId: string) {
    try {
      const { data, error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return { data: null, error };
    }
  },

  // Marcar todas como leídas
  async markAllAsRead(userId: string) {
    try {
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error marking all as read:", error);
      return { success: false, error };
    }
  },

  // Suscribirse a notificaciones en tiempo real
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Nueva notificación:", payload);
          callback(payload);
        },
      )
      .subscribe();

    return channel;
  },

  // Cancelar suscripción
  async unsubscribe(channel: any) {
    if (channel) {
      await supabase.removeChannel(channel);
    }
  },
};
