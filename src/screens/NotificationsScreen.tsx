import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../styles/colors";

type NotificationType = 
  | "alert_urgent" 
  | "alert_security" 
  | "alert_info" 
  | "link_request" 
  | "link_accepted" 
  | "unlink_request";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  data?: any;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Alerta de emergencia",
    message: "Tu hijo activó el botón de alerta",
    type: "alert_urgent",
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "2",
    title: "Zona peligrosa",
    message: "Juan entró a una zona marcada como peligrosa",
    type: "alert_security",
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: "3",
    title: "Llegada segura",
    message: "Juan llegó a la escuela",
    type: "alert_info",
    is_read: true,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case "alert_urgent":
        return "alert-circle";
      case "alert_security":
        return "shield-alert";
      case "alert_info":
        return "check-circle";
      case "link_request":
        return "account-plus";
      case "link_accepted":
        return "account-check";
      case "unlink_request":
        return "account-remove";
      default:
        return "information";
    }
  };

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case "alert_urgent":
        return colors.danger;
      case "alert_security":
        return colors.warning;
      case "alert_info":
        return colors.success;
      case "link_request":
      case "link_accepted":
        return colors.primary;
      case "unlink_request":
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const timeAgo = (dateString: string): string => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (diff < 1) return "Ahora";
    if (diff < 60) return `Hace ${diff} min`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} h`;
    return `Hace ${Math.floor(diff / 1440)} días`;
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.is_read && styles.unreadCard,
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(item.type) + "20" },
        ]}
      >
        <MaterialCommunityIcons
          name={getNotificationIcon(item.type) as any}
          size={24}
          color={getNotificationColor(item.type)}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
      </View>
      {!item.is_read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Notificaciones</Text>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="bell-off" size={60} color="#CCC" />
          <Text style={styles.emptyText}>No hay notificaciones</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 16,
    color: colors.textPrimary,
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: colors.textLight,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
});
