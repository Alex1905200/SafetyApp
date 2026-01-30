import { supabase } from "../config/supabase";
import { Tables } from "../types/database.types";

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

      if (authData.user) {
        const { error: profileError } = await (supabase as any).from("profiles").insert({
          id: authData.user.id,
          first_name: name,
          email: email,
          user_type: userType,
        });

        if (profileError && profileError.code !== "23505") {
          throw profileError;
        }

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
      
      if (errorCode === "PGRST205" || errorMessage.includes("Could not find the table")) {
        return { 
          data: null, 
          error: {
            message: "❌ Las tablas de la base de datos no están creadas.",
            status: "database_error",
            ...error
          }
        };
      }
      
      if (errorCode.includes("rate_limit") || errorCode.includes("over_email_send_rate_limit")) {
        return { 
          data: null, 
          error: {
            message: "⏳ Demasiados intentos. Espera 15-30 minutos.",
            status: "rate_limit_error",
            ...error
          }
        };
      }

      if (errorCode === "user_already_exists" || errorMessage.includes("User already registered")) {
        return {
          data: null,
          error: {
            message: "Este correo ya está registrado.",
            status: "user_already_exists",
            ...error,
          },
        };
      }
      
      const isNetworkError = 
        errorMessage.includes("Network") || 
        errorMessage.includes("network") ||
        errorMessage.includes("Failed to fetch");
      
      if (isNetworkError) {
        return { 
          data: null, 
          error: {
            message: "Error de conexión.",
            status: "network_error",
            ...error
          }
        };
      }
      
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
    } catch (error: any) {
      const errorMessage = error?.message || "Error desconocido";
      const isNetworkError = 
        errorMessage.includes("Network") || 
        errorMessage.includes("network") ||
        errorMessage.includes("Failed to fetch");
      
      if (isNetworkError) {
        return { 
          data: null, 
          error: {
            message: "Error de conexión.",
            status: "network_error",
            ...error
          }
        };
      }
      
      return { data: null, error };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
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

      if (error && error.code !== "PGRST116") throw error;
      
      // Si el perfil existe pero no tiene user_type, actualizarlo desde metadata
      if (data && !(data as any).user_type) {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        const metadataUserType = user?.user_metadata?.user_type;
        
        if (metadataUserType) {
          // Actualizar el perfil con el user_type de metadata
          const { error: updateError } = await (supabase as any)
            .from("profiles")
            .update({ user_type: metadataUserType })
            .eq("id", userId);
          
          if (!updateError) {
            console.log("✅ Profile user_type actualizado desde metadata:", metadataUserType);
            // Crear un nuevo objeto en lugar de usar spread
            const updatedData = Object.assign({}, data, { user_type: metadataUserType });
            return { data: updatedData, error: null };
          }
        }
      }
      
      if (!data) {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (user) {
          const userType = user.user_metadata?.user_type || "child";
          const defaultProfile = {
            id: userId,
            email: user.email,
            first_name: user.user_metadata?.name || "Usuario",
            user_type: userType,
            age: null,
            phone_number: null,
            address: null,
            photo_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          const { error: insertError } = await (supabase as any)
            .from("profiles")
            .insert([defaultProfile]);
          
          if (!insertError) {
            console.log("✅ Perfil creado con user_type:", userType);
            return { data: defaultProfile, error: null };
          }
        }
        return { data: null, error: "No profile found" };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error en getProfile:", error);
      return { data: null, error };
    }
  },

  async updateProfile(userId: string, updates: Record<string, any>) {
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
      return { data: data as Tables<"children">[] | null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async addChild(parentId: string, name: string, age: number) {
    try {
      const { data, error } = await (supabase as any)
        .from("children")
        .insert({ parent_id: parentId, name, age })
        .select()
        .single();

      if (error) throw error;
      return { data: data as Tables<"children"> | null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
