import { supabase } from "../config/supabase";

export const authService = {
  async signUp(
    email: string,
    password: string,
    name: string,
    userType: "parent" | "child" = "child",
    childName?: string,
    childAge?: number
  ) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            user_type: userType,
          },
        },
      });

      if (authError) {
        console.error("Error en signUp:", authError);
        throw authError;
      }

      // Crear perfil con user_type
      if (authData.user) {
        const { error: profileError } = await (supabase as any).from("profiles").insert({
          id: authData.user.id,
          first_name: name,
          email: email,
          user_type: userType,
        });

        if (profileError && profileError.code !== "23505") {
          // 23505 = duplicate key, el trigger SQL ya lo creó
          throw profileError;
        }

        // Si es padre y proporciona datos del menor, crear registro en tabla children
        if (userType === "parent" && childName && childAge) {
          const { error: childError } = await (supabase as any).from("children").insert({
            parent_id: authData.user.id,
            name: childName,
            age: childAge,
          });

          if (childError) {
            console.error("Error al crear registro del menor:", childError);
          }
        }
      }

      return { data: authData, error: null };
    } catch (error: any) {
      const errorMessage = error?.message || "Error desconocido";
      const errorCode = error?.code || "";
      
      // Verificar si falta la tabla en la base de datos
      if (errorCode === "PGRST205" || errorMessage.includes("Could not find the table")) {
        console.error("Error: Tabla no encontrada en Supabase:", error);
        return { 
          data: null, 
          error: {
            message: "❌ Las tablas de la base de datos no están creadas. Por favor:\n\n1. Abre Supabase Dashboard\n2. Ve a SQL Editor\n3. Copia y ejecuta el contenido de DATABASE_SETUP.sql\n4. Luego intenta registrarte de nuevo",
            status: "database_error",
            ...error
          }
        };
      }
      
      // Verificar si es un error de rate limit
      if (errorCode.includes("rate_limit") || errorCode.includes("over_email_send_rate_limit")) {
        console.error("Error de límite de tasa en signUp:", error);
        return { 
          data: null, 
          error: {
            message: "⏳ Demasiados intentos de registro. Por favor, espera 15-30 minutos e intenta de nuevo.",
            status: "rate_limit_error",
            ...error
          }
        };
      }
      
      const isNetworkError = 
        errorMessage.includes("Network") || 
        errorMessage.includes("network") ||
        errorMessage.includes("Failed to fetch") ||
        !navigator.onLine;
      
      if (isNetworkError) {
        console.error("Error de red en signUp:", error);
        return { 
          data: null, 
          error: {
            message: "Error de conexión. Verifica tu conexión a internet y que Supabase esté configurado correctamente.",
            status: "network_error",
            ...error
          }
        };
      }
      
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

      if (error) {
        console.error("Error en signIn:", error);
        throw error;
      }
      
      return { data, error: null };
    } catch (error: any) {
      const errorMessage = error?.message || "Error desconocido";
      const isNetworkError = 
        errorMessage.includes("Network") || 
        errorMessage.includes("network") ||
        errorMessage.includes("Failed to fetch") ||
        !navigator.onLine;
      
      if (isNetworkError) {
        console.error("Error de red en signIn:", error);
        return { 
          data: null, 
          error: {
            message: "Error de conexión. Verifica tu conexión a internet y que Supabase esté configurado correctamente.",
            status: "network_error",
            ...error
          }
        };
      }
      
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
        .limit(1);

      if (error) throw error;
      
      // Si no hay datos, crear un perfil por defecto
      if (!data || data.length === 0) {
        console.warn("No profile found for user", userId);
        // Obtener usuario actual para rellenar datos
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const defaultProfile = {
            id: userId,
            email: user.email,
            first_name: user.user_metadata?.name || "Usuario",
            user_type: user.user_metadata?.user_type || "child",
            age: null,
            phone: null,
            address: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          // Intentar crear el perfil
          const { error: insertError } = await (supabase as any)
            .from("profiles")
            .insert([defaultProfile]);
          
          if (!insertError) {
            return { data: defaultProfile, error: null };
          }
        }
        
        return { data: null, error: "No profile found" };
      }
      
      return { data: data[0], error: null };
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

  async getChildren(parentId: string) {
    try {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", parentId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error en getChildren:", error);
      return { data: null, error };
    }
  },

  async addChild(parentId: string, name: string, age: number) {
    try {
      const { data, error } = await (supabase as any)
        .from("children")
        .insert({ parent_id: parentId, name, age })
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (error) {
      console.error("Error en addChild:", error);
      return { data: null, error };
    }
  },
};
