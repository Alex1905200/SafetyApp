import React, { useState, useEffect } from "react";
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../config/supabase";
import { authService } from "../services/authService";
import { colors } from "../styles/colors";

interface Child {
  id: string;
  name: string;
  age: number;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface Zone {
  id?: string;
  name: string;
  type: "safe" | "danger";
}

export default function SettingsScreen() {
  const [editing, setEditing] = useState(false);
  const [isParent, setIsParent] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("");

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [userId, setUserId] = useState("");

  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [premium, setPremium] = useState(false);

  const [route, setRoute] = useState("Casa → Escuela → Casa");

  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "Mamá", phone: "+34 600 123 456" },
    { id: "2", name: "Papá", phone: "+34 600 789 012" },
  ]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  const [zones, setZones] = useState<Zone[]>([
    { name: "Casa", type: "safe" },
    { name: "Escuela", type: "safe" },
    { name: "Parque", type: "danger" },
  ]);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneType, setNewZoneType] = useState<"safe" | "danger">("safe");

  const navigation = useNavigation<any>();

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user logged in");
        return;
      }

      setUserId(user.id);

      const { data: profile, error: profileError } = await authService.getProfile(user.id);
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        Alert.alert(
          "Error de Conexión",
          "No se pudo cargar el perfil. Verifica tu conexión a internet y que la base de datos esté configurada."
        );
        return;
      }

      const profileData = profile as any;
      
      setName(profileData?.first_name || profileData?.name || "");
      setAge(profileData?.age?.toString() || "");
      setIsParent(profileData?.user_type === "parent");

      if (profileData?.user_type === "parent") {
        const { data: childrenData, error: childrenError } = await authService.getChildren(user.id);
        if (childrenError) {
          console.error("Error fetching children:", childrenError);
        }
        if (childrenData) {
          setChildren(childrenData);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert(
        "Error",
        "Ocurrió un error al cargar los datos. Error: " + JSON.stringify(error)
      );
    }
  };

  const handleAddContact = () => {
    if (!newContactName.trim()) {
      Alert.alert("Error", "Por favor ingresa el nombre del contacto");
      return;
    }

    if (!newContactPhone.trim()) {
      Alert.alert("Error", "Por favor ingresa el teléfono");
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
    };

    setContacts([...contacts, newContact]);
    setNewContactName("");
    setNewContactPhone("");
    Alert.alert("Éxito", "Contacto agregado correctamente");
  };

  const handleRemoveContact = (id: string) => {
    Alert.alert(
      "Eliminar contacto",
      "¿Estás seguro que deseas eliminar este contacto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setContacts(contacts.filter(c => c.id !== id));
          },
        },
      ]
    );
  };

  const handleAddZone = () => {
    if (!newZoneName.trim()) {
      Alert.alert("Error", "Por favor ingresa el nombre de la zona");
      return;
    }

    const newZone: Zone = {
      id: Date.now().toString(),
      name: newZoneName.trim(),
      type: newZoneType,
    };

    setZones([...zones, newZone]);
    setNewZoneName("");
    setNewZoneType("safe");
    Alert.alert("Éxito", "Zona agregada correctamente");
  };

  const handleRemoveZone = (id?: string, index?: number) => {
    Alert.alert(
      "Eliminar zona",
      "¿Estás seguro que deseas eliminar esta zona?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            if (index !== undefined) {
              setZones(zones.filter((_, i) => i !== index));
            }
          },
        },
      ]
    );
  };

  const handleAddChild = async () => {
    if (!newChildName.trim()) {
      Alert.alert("Error", "Por favor ingresa el nombre del menor");
      return;
    }

    if (!newChildAge.trim()) {
      Alert.alert("Error", "Por favor ingresa la edad del menor");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newChild } = await authService.addChild(
        user.id,
        newChildName.trim(),
        parseInt(newChildAge)
      );

      if (newChild) {
        setChildren([...children, newChild]);
        setNewChildName("");
        setNewChildAge("");
        Alert.alert("Éxito", "Menor agregado correctamente");
      }
    } catch (error) {
      console.error("Error adding child:", error);
      Alert.alert("Error", "No se pudo agregar el menor");
    }
  };

  const handleSave = async () => {
    try {
      if (userId) {
        // Guardar cambios del perfil (para padre y menor)
        const updateData: Record<string, any> = {
          first_name: name,
        };

        // Si es menor, agregar la edad
        if (!isParent && age) {
          updateData.age = parseInt(age);
        }

        const { error } = await (supabase as any)
          .from("profiles")
          .update(updateData)
          .eq("id", userId);

        if (error) {
          console.error("Error saving profile:", error);
          Alert.alert("Error", "No se pudieron guardar los cambios");
          return;
        }

        Alert.alert("Guardado", "Los cambios fueron guardados correctamente");
      }

      setEditing(false);
      setShowPassword(false);
    } catch (error) {
      console.error("Error saving:", error);
      Alert.alert("Error", "Ocurrió un error al guardar");
    }
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

      {/* Si es padre */}
      {isParent ? (
        <>
          {/* MENORES */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>👶 Menores a monitorear</Text>
              {editing && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    if (newChildName && newChildAge) {
                      handleAddChild();
                    } else {
                      Alert.alert("Completa los datos", "Ingresa nombre y edad");
                    }
                  }}
                >
                  <Text style={styles.addButtonText}>+ Agregar</Text>
                </TouchableOpacity>
              )}
            </View>

            {children.map((child) => (
              <View key={child.id} style={styles.childCard}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childAge}>{child.age} años</Text>
              </View>
            ))}

            {editing && (
              <View style={styles.addChildForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del menor"
                  value={newChildName}
                  onChangeText={setNewChildName}
                  autoCapitalize="words"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Edad"
                  value={newChildAge}
                  onChangeText={setNewChildAge}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>
        </>
      ) : (
        <>
          {/* PERFIL DEL MENOR */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Mi Perfil</Text>

            {editing ? (
              <>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
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
        </>
      )}

      {/* CONTACTOS */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>👨‍👩‍👧 Contactos autorizados</Text>
          {editing && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                if (newContactName && newContactPhone) {
                  handleAddContact();
                } else {
                  Alert.alert("Completa los datos", "Ingresa nombre y teléfono");
                }
              }}
            >
              <Text style={styles.addButtonText}>+ Agregar</Text>
            </TouchableOpacity>
          )}
        </View>

        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
            {editing && (
              <TouchableOpacity
                onPress={() => handleRemoveContact(contact.id)}
                style={styles.deleteButton}
              >
                <MaterialCommunityIcons name="trash-can" size={20} color="#E53935" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {editing && (
          <View style={styles.addChildForm}>
            <TextInput
              style={styles.input}
              placeholder="Nombre del contacto"
              value={newContactName}
              onChangeText={setNewContactName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={newContactPhone}
              onChangeText={setNewContactPhone}
              keyboardType="phone-pad"
            />
          </View>
        )}
      </View>

      {/* ZONAS */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🗺️ Zonas</Text>
          {editing && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                if (newZoneName) {
                  handleAddZone();
                } else {
                  Alert.alert("Completa los datos", "Ingresa el nombre de la zona");
                }
              }}
            >
              <Text style={styles.addButtonText}>+ Agregar</Text>
            </TouchableOpacity>
          )}
        </View>

        {zones.map((zone, index) => (
          <View key={zone.id || index} style={styles.zoneRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.zoneName}>{zone.name}</Text>
              <Text style={styles.zoneType}>
                {zone.type === "safe" ? "🟢 Zona Segura" : "🔴 Zona Peligrosa"}
              </Text>
            </View>
            {editing && (
              <TouchableOpacity
                onPress={() => handleRemoveZone(zone.id, index)}
                style={styles.deleteButton}
              >
                <MaterialCommunityIcons name="trash-can" size={20} color="#E53935" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {editing && (
          <View style={styles.addChildForm}>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la zona"
              value={newZoneName}
              onChangeText={setNewZoneName}
              autoCapitalize="words"
            />
            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.zoneTypeButton,
                  newZoneType === "safe" && styles.zoneTypeButtonActive,
                ]}
                onPress={() => setNewZoneType("safe")}
              >
                <Text style={styles.zoneTypeButtonText}>🟢 Segura</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.zoneTypeButton,
                  newZoneType === "danger" && styles.zoneTypeButtonActive,
                ]}
                onPress={() => setNewZoneType("danger")}
              >
                <Text style={styles.zoneTypeButtonText}>🔴 Peligrosa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    backgroundColor: colors.background,
    padding: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    marginTop: 20,
    color: colors.textPrimary,
  },
  section: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
    color: colors.textPrimary,
  },
  childCard: {
    backgroundColor: colors.greenCream,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  childName: {
    fontWeight: "bold",
    fontSize: 14,
    color: colors.textPrimary,
  },
  childAge: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  contactRow: {
    backgroundColor: colors.greenCream,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  contactName: {
    fontWeight: "bold",
    fontSize: 14,
    color: colors.textPrimary,
  },
  contactPhone: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  zoneRow: {
    backgroundColor: colors.greenCream,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  zoneName: {
    fontWeight: "bold",
    fontSize: 14,
    color: colors.textPrimary,
  },
  zoneType: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  zoneTypeButton: {
    flex: 1,
    backgroundColor: colors.borderLight,
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
  },
  zoneTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  zoneTypeButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  addChildForm: {
    backgroundColor: colors.greenCream,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.borderLight,
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.textPrimary,
  },
  inputSmall: {
    backgroundColor: colors.borderLight,
    padding: 6,
    borderRadius: 6,
    width: "48%",
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.textPrimary,
  },
  editButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: colors.primary,
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
    color: colors.primary,
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

