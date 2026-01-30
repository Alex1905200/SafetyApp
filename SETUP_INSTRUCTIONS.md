# 📋 Instrucciones para Crear las Tablas en Supabase

## Paso 1: Acceder a Supabase
1. Ve a https://supabase.com/
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: **vialgftygmfhupubkzpm**

## Paso 2: Abrir el SQL Editor
1. En el panel izquierdo, busca **"SQL Editor"** (o **"Database"** → **"SQL"**)
2. Haz clic en **"New Query"** para crear una nueva consulta

## Paso 3: Copiar el Script SQL
1. Abre el archivo `DATABASE_SETUP.sql` en este proyecto
2. Copia TODO el contenido del archivo

## Paso 4: Ejecutar el Script
1. En el SQL Editor de Supabase, pega el contenido del script
2. Haz clic en el botón **"Run"** (▶️) o presiona **Ctrl+Enter**
3. Espera a que se complete la ejecución

## ✅ Verificación
Si todo se ejecutó correctamente, deberías ver:
- ✓ 9 tablas creadas (profiles, children, family_groups, family_members, locations, zones, alerts, notifications, settings)
- ✓ Índices creados para optimización
- ✓ Políticas de seguridad (RLS) habilitadas

## 📍 Ubicación del Script SQL
El archivo `DATABASE_SETUP.sql` se encuentra en la raíz del proyecto:
```
SafetyApp/
├── DATABASE_SETUP.sql  ← Aquí está el script completo
├── app.json
├── package.json
└── ...
```

## ⚠️ Nota Importante
- Este script crea las tablas con políticas de seguridad (RLS - Row Level Security)
- RLS asegura que cada usuario solo pueda acceder a sus propios datos
- No hay datos de prueba incluidos; puedes agregar usuarios de prueba manualmente después

## 🚀 Después de Ejecutar el Script
Una vez que las tablas estén creadas:
1. Abre la terminal en VS Code
2. Asegúrate de estar en la carpeta `SafetyApp`
3. Ejecuta: `npx expo start --tunnel`
4. Intenta registrarte nuevamente - ¡debería funcionar ahora!

## 📞 Si Encuentras Errores
- **"Table already exists"**: Las tablas ya existen, puedes ignorar este mensaje
- **"Permission denied"**: Verifica que estés usando la URL y KEY correctas en `.env`
- **"Could not connect"**: Verifica tu conexión a internet y que la URL de Supabase sea válida

---

¿Problemas al acceder a Supabase? Intenta aquí:
https://supabase.com/dashboard
