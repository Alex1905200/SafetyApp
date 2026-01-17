// Tipos de Usuario
export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  phoneNumber?: string;
}

// Tipos de Ubicación
export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

// Tipos de Miembro Familiar
export interface FamilyMember {
  id: string;
  user: User;
  location: Location;
  isActive: boolean;
}

// Tipos de Alerta
export interface Alert {
  id: string;
  userId: string;
  location: Location;
  type: "emergency" | "safe" | "danger_zone";
  message?: string;
  timestamp: number;
}

// Tipos de Notificación
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "alert" | "location" | "info";
  timestamp: number;
  read: boolean;
}

// Tipos de Zona Peligrosa
export interface DangerZone {
  id: string;
  name: string;
  center: Location;
  radius: number;
  level: "low" | "medium" | "high";
}
