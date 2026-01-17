import * as Location from "expo-location";
import { supabase } from "../config/supabase";

export const locationService = {
  // Solicitar permisos
  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return { granted: status === "granted", error: null };
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return { granted: false, error };
    }
  },

  // Obtener ubicación actual
  async getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permiso de ubicación denegado");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        data: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          altitude: location.coords.altitude,
          speed: location.coords.speed,
          heading: location.coords.heading,
          timestamp: new Date(location.timestamp).toISOString(),
        },
        error: null,
      };
    } catch (error) {
      console.error("Error getting location:", error);
      return { data: null, error };
    }
  },

  // Guardar ubicación en Supabase
  async saveLocation(userId: string, locationData: any) {
    try {
      const { data, error } = await supabase
        .from("locations")
        .insert({
          user_id: userId,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          altitude: locationData.altitude,
          speed: locationData.speed,
          heading: locationData.heading,
          timestamp: locationData.timestamp,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error saving location:", error);
      return { data: null, error };
    }
  },

  // Obtener última ubicación de un usuario
  async getLastLocation(userId: string) {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error getting last location:", error);
      return { data: null, error };
    }
  },

  // Obtener ubicaciones de miembros de familia
  async getFamilyLocations(userIds: string[]) {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .in("user_id", userIds)
        .order("timestamp", { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error getting family locations:", error);
      return { data: null, error };
    }
  },

  // Suscribirse a cambios de ubicación en tiempo real
  subscribeToLocationUpdates(
    userIds: string[],
    callback: (payload: any) => void,
  ) {
    return supabase
      .channel("location-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "locations",
          filter: `user_id=in.(${userIds.join(",")})`,
        },
        callback,
      )
      .subscribe();
  },
};
