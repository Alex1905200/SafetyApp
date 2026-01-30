import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";

// Usar variables de entorno con valores por defecto para desarrollo
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

// Validar que existan las variables (excepto en desarrollo)
if ((!SUPABASE_URL || !SUPABASE_ANON_KEY) && process.env.NODE_ENV === "production") {
  throw new Error(
    "Falta configurar las variables de entorno de Supabase. " +
      "Asegúrate de tener EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env",
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      // Configuración para persistir sesión
      storage: undefined, // Expo maneja esto automáticamente
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "X-Client-Info": "kidsecure-app",
      },
    },
  },
);
