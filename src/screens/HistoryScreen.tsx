import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import { colors } from "../styles/colors";

type HistoryItem = {
  id: string;
  date: string;
  event: string;
  zone: string;
  important?: boolean;
};

const HISTORY_DATA: HistoryItem[] = [
  {
    id: "1",
    date: "08:00",
    event: "Salió de casa",
    zone: "Casa",
  },
  {
    id: "2",
    date: "08:30",
    event: "Llegó a la escuela",
    zone: "Escuela",
  },
  {
    id: "3",
    date: "12:15",
    event: "Se desvió de la ruta",
    zone: "Parque",
    important: true,
  },
  {
    id: "4",
    date: "13:00",
    event: "Regresó a casa",
    zone: "Casa",
  },
];

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>

      <FlatList
        data={HISTORY_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              item.important && styles.important,
            ]}
          >
            <Text style={styles.time}>{item.date}</Text>
            <Text style={styles.event}>{item.event}</Text>
            <Text style={styles.zone}>📌 {item.zone}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    marginTop: 20,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  important: {
    borderLeftWidth: 5,
    borderLeftColor: "#E53935",
  },
  time: {
    fontSize: 12,
    color: "#666",
  },
  event: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  zone: {
    fontSize: 12,
    marginTop: 4,
    color: colors.textPrimary,
  },
});
