import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Falta configurar variables de entorno:");
  console.error("   - EXPO_PUBLIC_SUPABASE_URL");
  console.error("   - EXPO_PUBLIC_SUPABASE_ANON_KEY");
  console.error("\nAñade estas variables en tu archivo .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestUsers() {
  try {
    console.log("🔄 Creando usuarios de prueba...\n");

    // 1. Crear usuario padre
    console.log("1️⃣ Registrando usuario padre (pruebapadre@gmail.com)...");
    const { data: parentAuthData, error: parentAuthError } = await supabase.auth.signUp({
      email: "pruebapadre@gmail.com",
      password: "padre12345",
      options: {
        data: {
          name: "Padre de Prueba",
          user_type: "parent",
        },
      },
    });

    if (parentAuthError) {
      if (parentAuthError.message.includes("already registered")) {
        console.log("   ✓ Usuario padre ya existe");
        
        // Intentar obtener el ID del usuario existente
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: "pruebapadre@gmail.com",
          password: "padre12345",
        });
        if (signInData?.user) {
          console.log("   ✓ ID del padre:", signInData.user.id);
        }
      } else {
        throw parentAuthError;
      }
    } else {
      console.log("   ✓ Usuario padre creado:", parentAuthData.user?.id);

      // Crear perfil del padre
      if (parentAuthData.user) {
        const { error: parentProfileError } = await supabase.from("profiles").insert({
          id: parentAuthData.user.id,
          name: "Padre de Prueba",
          email: "pruebapadre@gmail.com",
          user_type: "parent",
        });

        if (parentProfileError && !parentProfileError.message.includes("duplicate")) {
          console.warn("   ⚠ Advertencia al crear perfil:", parentProfileError);
        } else {
          console.log("   ✓ Perfil del padre creado");
        }
      }
    }

    // 2. Crear usuario hijo
    console.log("\n2️⃣ Registrando usuario hijo (pruebahijo@gmail.com)...");
    const { data: childAuthData, error: childAuthError } = await supabase.auth.signUp({
      email: "pruebahijo@gmail.com",
      password: "hijo12345",
      options: {
        data: {
          name: "Hijo de Prueba",
          user_type: "child",
        },
      },
    });

    if (childAuthError) {
      if (childAuthError.message.includes("already registered")) {
        console.log("   ✓ Usuario hijo ya existe");
      } else {
        throw childAuthError;
      }
    } else {
      console.log("   ✓ Usuario hijo creado:", childAuthData.user?.id);

      // Crear perfil del hijo
      if (childAuthData.user) {
        const { error: childProfileError } = await supabase.from("profiles").insert({
          id: childAuthData.user.id,
          name: "Hijo de Prueba",
          email: "pruebahijo@gmail.com",
          user_type: "child",
          age: 12,
        });

        if (childProfileError && !childProfileError.message.includes("duplicate")) {
          console.warn("   ⚠ Advertencia al crear perfil:", childProfileError);
        } else {
          console.log("   ✓ Perfil del hijo creado");
        }
      }
    }

    // 3. Crear relación padre-hijo (necesitamos el ID del padre)
    console.log("\n3️⃣ Vinculando padre con hijo...");
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: "pruebapadre@gmail.com",
      password: "padre12345",
    });

    if (signInData?.user?.id && childAuthData?.user?.id) {
      const { error: relationError } = await supabase.from("children").insert({
        parent_id: signInData.user.id,
        name: "Hijo de Prueba",
        age: 12,
      });

      if (relationError && !relationError.message.includes("duplicate")) {
        console.warn("   ⚠ Advertencia al crear relación:", relationError);
      } else {
        console.log("   ✓ Relación padre-hijo creada");
      }
    }

    console.log("\n✅ Usuarios de prueba listos!");
    console.log("\n📱 Credenciales de prueba:");
    console.log("   Padre:");
    console.log("   Email: pruebapadre@gmail.com");
    console.log("   Contraseña: padre12345");
    console.log("\n   Hijo:");
    console.log("   Email: pruebahijo@gmail.com");
    console.log("   Contraseña: hijo12345");
  } catch (error) {
    console.error("❌ Error al crear usuarios de prueba:", error);
    process.exit(1);
  }
}

createTestUsers();
