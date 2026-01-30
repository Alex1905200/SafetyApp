-- ============================================
-- KidSecure Database Setup Script - MEJORADO
-- Crear todas las tablas necesarias para la aplicación
-- ============================================

-- PRIMERO: Desactivar RLS temporalmente para evitar conflictos
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE children DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Ahora crearemos las tablas (o las recrearemos)

-- 1. TABLA: PROFILES (Perfiles de usuario)
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  user_type TEXT NOT NULL DEFAULT 'child' CHECK (user_type IN ('parent', 'child')),
  first_name TEXT,
  last_name TEXT,
  age INTEGER,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: CHILDREN (Hijos/Menores siendo monitoreados)
DROP TABLE IF EXISTS children CASCADE;
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: FAMILY_GROUPS (Grupos familiares)
DROP TABLE IF EXISTS family_groups CASCADE;
CREATE TABLE family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: FAMILY_MEMBERS (Miembros del grupo familiar)
DROP TABLE IF EXISTS family_members CASCADE;
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA: LOCATIONS (Ubicaciones GPS)
DROP TABLE IF EXISTS locations CASCADE;
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy FLOAT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: ZONES (Zonas seguras/peligrosas)
DROP TABLE IF EXISTS zones CASCADE;
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  zone_type TEXT NOT NULL CHECK (zone_type IN ('safe', 'danger')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  radius FLOAT DEFAULT 500,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: ALERTS (Alertas)
DROP TABLE IF EXISTS alerts CASCADE;
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('urgente', 'seguridad', 'informativa')),
  title TEXT NOT NULL,
  message TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLA: NOTIFICATIONS (Notificaciones)
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  notification_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABLA: SETTINGS (Configuración del usuario)
DROP TABLE IF EXISTS settings CASCADE;
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  vibration_enabled BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  location_tracking BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES para optimizar queries
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_group_id ON family_members(family_group_id);
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON locations(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_timestamp ON locations(timestamp);
CREATE INDEX IF NOT EXISTS idx_zones_user_id ON zones(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Política para PROFILES: El usuario puede insertar, ver y editar su propio perfil
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para CHILDREN: Padres pueden ver/editar hijos
CREATE POLICY "Users can insert children records" ON children
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Parents can see their children" ON children
  FOR SELECT USING (parent_id = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY "Parents can manage their children" ON children
  FOR UPDATE USING (parent_id = auth.uid());

-- Política para LOCATIONS: Usuarios pueden gestionar sus ubicaciones
CREATE POLICY "Users can insert their locations" ON locations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their locations" ON locations
  FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY "Users can update their locations" ON locations
  FOR UPDATE USING (user_id = auth.uid());

-- Política para ZONES: Usuarios pueden gestionar sus zonas
CREATE POLICY "Users can insert zones" ON zones
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their zones" ON zones
  FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY "Users can update zones" ON zones
  FOR UPDATE USING (user_id = auth.uid());

-- Política para ALERTS: Usuarios pueden gestionar sus alertas
CREATE POLICY "Users can insert alerts" ON alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their alerts" ON alerts
  FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY "Users can update alerts" ON alerts
  FOR UPDATE USING (user_id = auth.uid());

-- Política para NOTIFICATIONS: Usuarios pueden ver sus notificaciones
CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'authenticated');

-- Política para SETTINGS: Usuarios pueden gestionar sus configuraciones
CREATE POLICY "Users can insert settings" ON settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their settings" ON settings
  FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY "Users can update settings" ON settings
  FOR UPDATE USING (user_id = auth.uid());

-- Política para FAMILY_GROUPS y FAMILY_MEMBERS
CREATE POLICY "Users can insert family groups" ON family_groups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view family groups" ON family_groups
  FOR SELECT USING (created_by = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY "Users can insert family members" ON family_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view family members" ON family_members
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- Fin del script de setup - VERSIÓN MEJORADA
-- ============================================
