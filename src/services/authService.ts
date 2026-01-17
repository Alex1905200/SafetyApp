import { supabase } from "../config/supabase";

export const authService = {
  async signUp(email: string, password: string, name: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (authError) throw authError;

      // El perfil se crea automáticamente por el trigger SQL
      // No es necesario insertar manualmente

      return { data: authData, error: null };
    } catch (error) {
      console.error("Error en signUp:", error);
      return { data: null, error };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error en signIn:", error);
      return { data: null, error };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error en signOut:", error);
      return { error };
    }
  },

  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error("Error en getCurrentUser:", error);
      return { user: null, error };
    }
  },

  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error en getProfile:", error);
      return { data: null, error };
    }
  },

  async updateProfile(
    userId: string,
    updates: { name?: string; phone_number?: string; photo_url?: string },
  ) {
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
      console.error("Error en updateProfile:", error);
      return { data: null, error };
    }
  },
};
