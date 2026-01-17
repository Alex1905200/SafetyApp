import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { authService } from "../services/authService";
import { homeMapScreenStyles as styles } from "../styles/homeMapScreenStyles";

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export default function HomeMapScreen() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null,
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userName, setUserName] = useState("Usuario");

  // Para el mapa colapsable
  const mapHeightAnim = useRef(new Animated.Value(250)).current;
  const contentHeightAnim = useRef(new Animated.Value(800)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    requestLocationPermission();
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const { user } = await authService.getCurrentUser();
      if (user) {
        // Primero intentar obtener del metadata
        const metadata = user.user_metadata as any;
        if (metadata?.name && metadata.name.trim().length > 0) {
          setUserName(metadata.name);
          console.log("Nombre desde metadata:", metadata.name);
          return;
        }

        // Si no está en metadata, buscar en el perfil
        const { data } = await authService.getProfile(user.id);
        const profileData = data as any;
        if (profileData?.name && profileData.name.trim().length > 0) {
          setUserName(profileData.name);
          console.log("Nombre desde perfil:", profileData.name);
          return;
        }

        // Fallback: usar el email
        setUserName(user.email?.split("@")[0] || "Usuario");
        console.log("Usando email como nombre");
      }
    } catch (error) {
      console.error("Error loading user name:", error);
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
            console.log("Enviando alerta de emergencia...");
            Alert.alert(
              "¡Alerta Enviada!",
              "Tus contactos han sido notificados",
            );
          },
        },
      ],
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    // scroll HACIA ARRIBA (scrollY bajo) = mapa expandido, contenido minimizado
    // scroll HACIA ABAJO (scrollY alto) = mapa encogido, contenido expandido
    const maxMapHeight = 350;
    const newHeight = Math.max(80, Math.min(maxMapHeight, 350 - scrollY * 0.5));

    // Contenido empieza expandido (800px) y se minimiza cuando scrolleas hacia arriba
    // scrollY bajo = altura máxima (800px), scrollY alto = altura mínima (120px)
    const contentHeight = Math.max(120, Math.min(800, 800 - scrollY * 0.8));

    Animated.parallel([
      Animated.timing(mapHeightAnim, {
        toValue: newHeight,
        duration: 0,
        useNativeDriver: false,
      }),
      Animated.timing(contentHeightAnim, {
        toValue: contentHeight,
        duration: 0,
        useNativeDriver: false,
      }),
    ]).start();
  };

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
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.icon}></Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.icon}></Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenedor flex para Mapa + Scroll */}
      <View style={{ flex: 1, flexDirection: "column" }}>
        {/* Mapa Colapsable */}
        <Animated.View style={{ height: mapHeightAnim, overflow: "hidden" }}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
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
        </Animated.View>

        {/* Contenido Deslizable - ocupa espacio restante */}
        <ScrollView
          ref={scrollViewRef}
          style={[styles.scrollContent, { flex: 1 }]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Contenido minimizable (con altura animada) */}
          <Animated.View
            style={{ height: contentHeightAnim, overflow: "hidden" }}
          >
            {/* Familia Cards */}
            <View style={styles.familyContainer}>
              <TouchableOpacity style={styles.familyCard}>
                <Text style={styles.familyIcon}>👩</Text>
                <Text style={styles.familyLabel}>Mamá</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.familyCard}>
                <Text style={styles.familyIcon}>👨</Text>
                <Text style={styles.familyLabel}>Papá</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addIcon}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton}>
                <Text style={styles.shareText}>+ Compartir</Text>
              </TouchableOpacity>
            </View>

            {/* Notificaciones/Alertas */}
            <View style={styles.notificationsContainer}>
              <View style={[styles.notification, styles.warningNotification]}>
                <Text style={styles.notificationIcon}>⚠️</Text>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText}>
                    ¡Alerta! Entraste a una zona peligrosa
                  </Text>
                  <Text style={styles.notificationTime}>Hace 5 min</Text>
                </View>
              </View>

              <View style={[styles.notification, styles.successNotification]}>
                <Text style={styles.notificationIcon}>✅</Text>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText}>
                    Llegaste bien a la escuela
                  </Text>
                  <Text style={styles.notificationTime}>Hace 1 hora</Text>
                </View>
              </View>

              {/* Notificaciones de Ubicación Peligrosa */}
              <View style={styles.settingCard}>
                <View style={styles.settingIcon}>
                  <Text style={styles.settingIconText}>🔔</Text>
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>
                    Notificaciones de Ubicación Peligrosa
                  </Text>
                  <Text style={styles.settingDescription}>
                    Recibe alertas cuando entres a zonas marcadas como
                    peligrosas
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: "#E0E0E0", true: "#00b894ff" }}
                  thumbColor="#FFF"
                />
              </View>

              {/* Plan Premium */}
              <TouchableOpacity style={styles.premiumCard}>
                <View style={styles.premiumIcon}>
                  <Text style={styles.premiumIconText}>👑</Text>
                </View>
                <View style={styles.premiumContent}>
                  <Text style={styles.premiumTitle}>
                    Plan Premium - Acceso Remoto
                  </Text>
                  <Text style={styles.premiumDescription}>
                    Accede de manera premium y podrás monitorizar el uso de
                    acceso remoto
                  </Text>
                </View>
                <Text style={styles.premiumArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      {/* Botón de Alerta - Fuera del ScrollView, pegado a los tabs */}
      <TouchableOpacity
        style={styles.alertButton}
        onPress={handleEmergencyAlert}
      >
        <Text style={styles.alertButtonText}>Botón de Alerta</Text>
      </TouchableOpacity>
    </View>
  );
}
