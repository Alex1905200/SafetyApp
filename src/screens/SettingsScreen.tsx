import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../config/supabase";


export default function SettingsScreen() {
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("Juan Pérez");
  const [age, setAge] = useState("10");

  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [premium, setPremium] = useState(false);

  const [route, setRoute] = useState("Casa → Escuela → Casa");

  const [zones, setZones] = useState([
    { name: "Casa", type: "Segura" },
    { name: "Escuela", type: "Segura" },
    { name: "Parque", type: "Peligrosa" },
  ]);

const navigation = useNavigation<any>();

  // CONTRASEÑA
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSave = () => {
    setEditing(false);
    setShowPassword(false);
    Alert.alert("Guardado", "Los cambios fueron guardados");
  };

  const handleChangePassword = async () => {
  if (!newPassword || newPassword.length < 6) {
    Alert.alert(
      "Error",
      "La contraseña debe tener al menos 6 caracteres"
    );
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    Alert.alert("Error", error.message);
  } else {
    Alert.alert("Éxito", "Contraseña actualizada correctamente");
    setCurrentPassword("");
    setNewPassword("");
    setShowPassword(false);
  }
};

  const handleLogout = () => {
  Alert.alert(
    "Cerrar sesión",
    "¿Estás seguro que deseas cerrar sesión?",
    [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.auth.signOut();

          if (error) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]
  );
};



  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configuración</Text>

      {/* PERFIL */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Perfil del menor</Text>

        {editing ? (
          <>
            <TextInput value={name} onChangeText={setName} style={styles.input} />
            <TextInput
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              style={styles.input}
            />
          </>
        ) : (
          <>
            <Text>Nombre: {name}</Text>
            <Text>Edad: {age} años</Text>
          </>
        )}
      </View>

      {/* CONTACTOS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👨‍👩‍👧 Contactos autorizados</Text>

        <View style={styles.row}>
          <Text>Mamá</Text>
          <Switch value={true} disabled={!editing} />
        </View>

        <View style={styles.row}>
          <Text>Papá</Text>
          <Switch value={true} disabled={!editing} />
        </View>
      </View>

      {/* ZONAS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗺️ Zonas</Text>

        {zones.map((zone, index) => (
          <View key={index} style={styles.row}>
            {editing ? (
              <>
                <TextInput
                  value={zone.name}
                  style={styles.inputSmall}
                  onChangeText={(text) => {
                    const copy = [...zones];
                    copy[index].name = text;
                    setZones(copy);
                  }}
                />
                <TextInput
                  value={zone.type}
                  style={styles.inputSmall}
                  onChangeText={(text) => {
                    const copy = [...zones];
                    copy[index].type = text;
                    setZones(copy);
                  }}
                />
              </>
            ) : (
              <Text>
                {zone.name} ({zone.type})
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* RUTA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛣️ Ruta diaria</Text>

        {editing ? (
          <TextInput value={route} onChangeText={setRoute} style={styles.input} />
        ) : (
          <Text>{route}</Text>
        )}
      </View>

      {/* NOTIFICACIONES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notificaciones</Text>

        <View style={styles.row}>
          <Text>Sonido</Text>
          <Switch value={sound} onValueChange={setSound} disabled={!editing} />
        </View>

        <View style={styles.row}>
          <Text>Vibración</Text>
          <Switch
            value={vibration}
            onValueChange={setVibration}
            disabled={!editing}
          />
        </View>
      </View>

      {/* PREMIUM */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📡 Plan Premium</Text>

        <View style={styles.row}>
          <Text>Activar Premium</Text>
          <Switch
            value={premium}
            onValueChange={setPremium}
            disabled={!editing}
          />
        </View>
      </View>

      {/* SEGURIDAD */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>🔐 Seguridad</Text>

  {editing && (
    <>
      {!showPassword ? (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setShowPassword(true)}
        >
          <Text style={styles.buttonText}>Cambiar contraseña</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TextInput
            placeholder="Nueva contraseña"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.buttonText}>Guardar nueva contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setShowPassword(false);
              setNewPassword("");
            }}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </>
      )}
    </>
  )}

  {!editing && (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutText}>Cerrar sesión</Text>
    </TouchableOpacity>
  )}
</View>

      {/* BOTONES */}
      {editing ? (
        <View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Guardar cambios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setEditing(false);
              setShowPassword(false);
            }}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditing(true)}
        >
          <Text style={styles.buttonText}>Editar configuración</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    marginTop: 20,
  },
  section: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#EEE",
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  inputSmall: {
    backgroundColor: "#EEE",
    padding: 6,
    borderRadius: 6,
    width: "48%",
  },
  editButton: {
    backgroundColor: "#1B9B8C",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#1B9B8C",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: "#999",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
  link: {
    color: "#1B9B8C",
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: "#E74C3C",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  logoutText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
});
