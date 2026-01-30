import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { authService } from "../services/authService";
import { colors } from "../styles/colors";
import { Tables } from "../types/database.types";

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface ChildLocation {
  id: string;
  name: string;
  age: number;
  location: LocationData | null;
  isActive: boolean;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  icon: string;
}

export default function HomeMapScreen() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [userName, setUserName] = useState("Usuario");
  const [userType, setUserType] = useState<"parent" | "child" | null>(null);
  const [childrenLocations, setChildrenLocations] = useState<ChildLocation[]>([]);
  const mapRef = useRef<MapView>(null);

  // 🆕 Estado para contactos de emergencia
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: "1", name: "Mamá", phone: "+34 600 123 456", relation: "Madre", icon: "👩" },
    { id: "2", name: "Papá", phone: "+34 600 789 012", relation: "Padre", icon: "👨" },
  ]);

  useEffect(() => {
    requestLocationPermission();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { user } = await authService.getCurrentUser();
      if (!user) {
        console.error("No user logged in");
        return;
      }

      const { data: profileData } = await authService.getProfile(user.id);
      const profile = profileData as any;

      if (profile?.user_type) {
        setUserType(profile.user_type);
      }

      const metadata = user.user_metadata as any;
      if (metadata?.name && metadata.name.trim().length > 0) {
        setUserName(metadata.name);
      } else if (profile?.first_name && profile.first_name.trim().length > 0) {
        setUserName(profile.first_name);
      } else {
        setUserName(user.email?.split("@")[0] || "Usuario");
      }

      // Si es padre, cargar ubicaciones de hijos
      if (profile?.user_type === "parent") {
        const { data: children } = await authService.getChildren(user.id);
        const childrenData = children as Tables<"children">[] | null;
        
        if (childrenData && childrenData.length > 0) {
          // Simular ubicaciones de los hijos (en producción, obtener de la BD)
          const childLocations: ChildLocation[] = childrenData.map((child, index) => ({
            id: child.id,
            name: child.name,
            age: child.age,
            location: {
              // Ubicaciones simuladas cerca de la ubicación actual
              latitude: (currentLocation?.latitude || -0.1807) + (Math.random() - 0.5) * 0.01,
              longitude: (currentLocation?.longitude || -78.4678) + (Math.random() - 0.5) * 0.01,
              timestamp: Date.now(),
            },
            isActive: true,
          }));
          setChildrenLocations(childLocations);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setUserName("Usuario");
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        getCurrentLocation();
      } else {
        Alert.alert("Permiso denegado", "Necesitamos acceso a tu ubicación");
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "No se pudo obtener la ubicación");
    }
  };

  const centerOnChild = (childLocation: ChildLocation) => {
    if (childLocation.location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: childLocation.location.latitude,
        longitude: childLocation.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const handleEmergencyAlert = () => {
    Alert.alert(
      "¡Alerta de Emergencia!",
      "¿Estás seguro de enviar una alerta de emergencia a tus contactos?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar Alerta",
          style: "destructive",
          onPress: () => {
            Alert.alert("¡Alerta Enviada!", "Tus contactos han sido notificados");
          },
        },
      ]
    );
  };

  // 🆕 Función para llamar a contacto
  const handleCallContact = (contact: EmergencyContact) => {
    Alert.alert(
      `Llamar a ${contact.name}`,
      `¿Llamar al ${contact.phone}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Llamar",
          onPress: () => {
            // Aquí iría la lógica para hacer la llamada
            Alert.alert("Llamando...", `Conectando con ${contact.name}`);
          },
        },
      ]
    );
  };

  // Vista para PADRE - Solo mapa con hijos
  if (userType === "parent") {
    return (
      <View style={styles.container}>
        {/* Header minimalista */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📍 Ubicación de mis hijos</Text>
          <TouchableOpacity onPress={getCurrentLocation} style={styles.refreshButton}>
            <MaterialCommunityIcons name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Mapa a pantalla completa */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.fullMap}
          initialRegion={{
            latitude: currentLocation?.latitude || -0.1807,
            longitude: currentLocation?.longitude || -78.4678,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {/* Marcadores de los hijos */}
          {childrenLocations.map((child) =>
            child.location ? (
              <Marker
                key={child.id}
                coordinate={{
                  latitude: child.location.latitude,
                  longitude: child.location.longitude,
                }}
                title={child.name}
                description={`${child.age} años • ${child.isActive ? "🟢 Activo" : "🔴 Inactivo"}`}
              >
                <View style={styles.childMarker}>
                  <Text style={styles.childMarkerText}>👦</Text>
                </View>
              </Marker>
            ) : null
          )}
        </MapView>

        {/* Lista de hijos flotante */}
        <View style={styles.childrenList}>
          <Text style={styles.childrenListTitle}>Hijos vinculados</Text>
          {childrenLocations.length === 0 ? (
            <Text style={styles.noChildrenText}>
              No tienes hijos registrados.{"\n"}Agrégalos en Configuración.
            </Text>
          ) : (
            childrenLocations.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={styles.childItem}
                onPress={() => centerOnChild(child)}
              >
                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>👦</Text>
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childAge}>{child.age} años</Text>
                </View>
                <View style={[styles.statusDot, child.isActive ? styles.active : styles.inactive]} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    );
  }

  // Vista para MENOR - Con tarjetas de contacto arriba del botón de alerta
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userStatus}>🟢 Activo</Text>
          </View>
        </View>
      </View>

      {/* Mapa */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.childMap}
        initialRegion={{
          latitude: currentLocation?.latitude || -0.1807,
          longitude: currentLocation?.longitude || -78.4678,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Mi ubicación"
          />
        )}
      </MapView>

      {/* 🆕 Tarjetas de Contactos de Emergencia */}
      <View style={styles.contactsSection}>
        <Text style={styles.contactsSectionTitle}>📞 Contactos de emergencia</Text>
        <View style={styles.contactsGrid}>
          {emergencyContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactCard}
              onPress={() => handleCallContact(contact)}
            >
              <View style={styles.contactCardAvatar}>
                <Text style={styles.contactCardIcon}>{contact.icon}</Text>
              </View>
              <Text style={styles.contactCardName}>{contact.name}</Text>
              <Text style={styles.contactCardRelation}>{contact.relation}</Text>
            </TouchableOpacity>
          ))}
          {/* Botón para agregar (redirige a configuración) */}
          <TouchableOpacity
            style={[styles.contactCard, styles.addContactCard]}
            onPress={() => Alert.alert("Info", "Los contactos deben ser agregados por tu padre/tutor en Configuración")}
          >
            <View style={styles.addContactIcon}>
              <MaterialCommunityIcons name="plus" size={28} color={colors.primary} />
            </View>
            <Text style={styles.addContactText}>Agregar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Botón de Alerta */}
      <TouchableOpacity style={styles.alertButton} onPress={handleEmergencyAlert}>
        <Text style={styles.alertButtonText}>🚨 Botón de Alerta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  refreshButton: {
    padding: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  userName: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  userStatus: {
    color: "#FFF",
    fontSize: 14,
  },
  fullMap: {
    flex: 1,
  },
  childMap: {
    flex: 1,
  },
  childMarker: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  childMarkerText: {
    fontSize: 20,
  },
  childrenList: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: 200,
  },
  childrenListTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  noChildrenText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 8,
  },
  childItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.greenCream,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  childAvatarText: {
    fontSize: 18,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  childAge: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  active: {
    backgroundColor: "#4CAF50",
  },
  inactive: {
    backgroundColor: "#FF5252",
  },
  alertButton: {
    backgroundColor: colors.danger,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 16,
  },
  alertButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  // 🆕 Estilos para sección de contactos
  contactsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  contactsSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  contactsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  contactCard: {
    backgroundColor: colors.greenCream,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    width: "30%",
    minWidth: 90,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  contactCardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  contactCardIcon: {
    fontSize: 22,
  },
  contactCardName: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
  },
  contactCardRelation: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
  },
  addContactCard: {
    backgroundColor: "#F5F5F5",
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  addContactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  addContactText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
