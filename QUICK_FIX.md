# 🚀 SOLUCIÓN RÁPIDA - Error de Tabla No Encontrada

## 🔴 El Problema
```
{"code": "PGRST205", "message": "Could not find the table 'public.profiles'"}
```

Las tablas necesarias **no existen** en tu base de datos Supabase.

## ✅ La Solución - 3 Pasos Simples

### 1️⃣ Copiar el Script SQL
- Abre el archivo: **`DATABASE_SETUP.sql`** (en la carpeta raíz del proyecto)
- Selecciona TODO el contenido (Ctrl+A)
- Copia (Ctrl+C)

### 2️⃣ Ejecutar en Supabase
- Ve a: https://supabase.com/dashboard
- Haz clic en tu proyecto: **vialgftygmfhupubkzpm**
- En el menú izquierdo: **SQL Editor**
- Haz clic en: **New Query** (+ icon)
- Pega el código (Ctrl+V)
- Haz clic en: **▶️ Run** (o presiona Ctrl+Enter)

### 3️⃣ ¡Listo!
Después de ejecutar el script:
- Cierra la app en tu emulador/dispositivo
- Reinicia: `npx expo start --tunnel`
- Intenta registrarte de nuevo
- ¡Debería funcionar! ✨

## 📊 Qué se Creará

El script crea automáticamente estas tablas:
```
✓ profiles           - Perfiles de usuario
✓ children          - Hijos siendo monitoreados
✓ family_groups     - Grupos familiares
✓ family_members    - Miembros del grupo
✓ locations         - Ubicaciones GPS
✓ zones             - Zonas seguras/peligrosas
✓ alerts            - Alertas del sistema
✓ notifications     - Notificaciones
✓ settings          - Configuración de usuario
```

## 🔐 Seguridad
Se incluyen **políticas de RLS** (Row Level Security) que aseguran que:
- Cada usuario solo ve sus propios datos
- Los padres pueden acceder a datos de sus hijos
- Los hijos solo ven su propia información

---

**¿Necesitas ayuda?** Verifica:
1. ✅ ¿Estás logueado en Supabase?
2. ✅ ¿Seleccionaste el proyecto correcto?
3. ✅ ¿El script se ejecutó sin errores rojos?

¡Luego intenta registrarte de nuevo! 🎉
