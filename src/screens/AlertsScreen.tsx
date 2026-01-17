import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

type AlertType = "urgente" | "informativa" | "seguridad";

type Alert = {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  created_at: string;
  is_read: boolean;
};

const MOCK_ALERTS: Alert[] = [
  {
    id: "1",
    title: "Zona peligrosa",
    message: "Entró a una zona peligrosa",
    type: "urgente",
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    is_read: false,
  },
  {
    id: "2",
    title: "Ruta",
    message: "Se desvió de la ruta habitual",
    type: "seguridad",
    created_at: new Date(Date.now() - 20 * 60000).toISOString(),
    is_read: false,
  },
  {
    id: "3",
    title: "Escuela",
    message: "Llegó a la escuela",
    type: "informativa",
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    is_read: true,
  },
];

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [filter, setFilter] = useState<AlertType | "all">("all");

  const filteredAlerts =
    filter === "all"
      ? alerts
      : alerts.filter((a) => a.type === filter);

  const markAsRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, is_read: true } : a
      )
    );
  };

  const timeAgo = (date: string) => {
    const diff = Math.floor(
      (Date.now() - new Date(date).getTime()) / 60000
    );
    return diff < 60 ? `Hace ${diff} min` : `Hace ${Math.floor(diff / 60)} h`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alertas</Text>

      {/* FILTROS */}
      <View style={styles.filters}>
        {["all", "urgente", "seguridad", "informativa"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterActive,
            ]}
            onPress={() => setFilter(f as any)}
          >
            <Text style={styles.filterText}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              item.is_read ? styles.read : styles.unread,
            ]}
            onPress={() => markAsRead(item.id)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text>{item.message}</Text>
            <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
            {!item.is_read && (
              <Text style={styles.mark}>✔ Marcar como revisada</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    marginTop: 20,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#DDD",
  },
  filterActive: {
    backgroundColor: "#1B9B8C",
  },
  filterText: {
    color: "#000",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  unread: {
    borderLeftWidth: 5,
    borderLeftColor: "#E53935",
  },
  read: {
    opacity: 0.6,
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: "#666",
    marginTop: 6,
  },
  mark: {
    marginTop: 6,
    color: "#1B9B8C",
    fontWeight: "bold",
  },
});
