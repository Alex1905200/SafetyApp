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
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../config/supabase";
import { authService } from "../services/authService";
import { linkingService } from "../services/linkingService";
import { colors } from "../styles/colors";
import { Tables } from "../types/database.types";

interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

interface LinkedChild {
  id: string;
  name: string;
  age: number;
  email?: string;
  phone?: string;
}

interface Zone {
  id?: string;
  name: string;
  type: "safe" | "danger";
}

export default function SettingsScreen() {
  const [editing, setEditing] = useState(false);
  const [isParent, setIsParent] = useState(false);
  const [children, setChildren] = useState<Tables<"children">[]>([]);
  const [linkedChildren, setLinkedChildren] = useState<LinkedChild[]>([]);
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
    { id: "1", name: "Mamá", phone: "+34 600 123 456", relation: "Madre" },
    { id: "2", name: "Papá", phone: "+34 600 789 012", relation: "Padre" },
  ]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactRelation, setNewContactRelation] = useState("");
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  const [zones, setZones] = useState<Zone[]>([
    { name: "Casa", type: "safe" },
    { name: "Escuela", type: "safe" },
    { name: "Parque", type: "danger" },
  ]);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneType, setNewZoneType] = useState<"safe" | "danger">("safe");

  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Estados para vinculación - PADRE
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [linkedChildrenAccounts, setLinkedChildrenAccounts] = useState<any[]>(
    [],
  );
  const [linkingLoading, setLinkingLoading] = useState(false);

  // Estados para vinculación - MENOR
  const [linkCode, setLinkCode] = useState("");
  const [linkStatus, setLinkStatus] = useState<"none" | "pending" | "linked">(
    "none",
  );
  const [linkedParentInfo, setLinkedParentInfo] = useState<{
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: profile } = await authService.getProfile(user.id);
      const profileData = profile as any;

      const metadataUserType = user.user_metadata?.user_type;
      const finalUserType =
        profileData?.user_type || metadataUserType || "child";

      setName(profileData?.first_name || user.user_metadata?.name || "");
      setAge(profileData?.age?.toString() || "");

      const parentStatus = finalUserType === "parent";
      console.log("📋 SettingsScreen - isParent:", parentStatus);
      setIsParent(parentStatus);

      if (parentStatus) {
        // Cargar datos de padre
        const { data: childrenData } = await authService.getChildren(user.id);
        if (childrenData) {
          setChildren(childrenData);

          const linked: LinkedChild[] = childrenData.map((child) => ({
            id: child.id,
            name: child.name,
            age: child.age,
            email: `${child.name.toLowerCase().replace(/\s/g, ".")}@ejemplo.com`,
            phone: "+34 612 345 678",
          }));
          setLinkedChildren(linked);
        }

        // Cargar solicitudes pendientes
        try {
          const { requests } = await linkingService.getPendingRequests(user.id);
          setPendingRequests(requests);
        } catch (e) {
          console.log("No se pudieron cargar solicitudes pendientes");
        }

        // Cargar hijos vinculados (cuentas)
        try {
          const { children: linkedAccounts } =
            await linkingService.getLinkedChildren(user.id);
          setLinkedChildrenAccounts(linkedAccounts);
        } catch (e) {
          console.log("No se pudieron cargar cuentas vinculadas");
        }
      } else {
        // Cargar estado de vinculación del menor
        try {
          const { status, parent } = await linkingService.getChildLinkStatus(
            user.id,
          );
          setLinkStatus(status);
          if (parent) {
            setLinkedParentInfo({ name: parent.name, email: parent.email });
          }
        } catch (e) {
          console.log("No se pudo cargar estado de vinculación");
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "No se pudieron cargar los datos");
    }
  };

  // PADRE: Generar código de vinculación
  const handleGenerateCode = async () => {
    setLinkingLoading(true);
    try {
      const { code, error } = await linkingService.generateLinkCode(userId);
      if (error) throw error;
      setGeneratedCode(code);
      Alert.alert(
        "Código generado",
        `Comparte este código con tu hijo:\n\n${code}\n\nVálido por 15 minutos`,
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo generar el código. Verifica que las tablas estén creadas en la base de datos.",
      );
    } finally {
      setLinkingLoading(false);
    }
  };

  // PADRE: Aprobar vinculación
  const handleApproveLink = async (childId: string, childName: string) => {
    Alert.alert(
      "Aprobar vinculación",
      `¿Vincular a ${childName} como tu hijo/a?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aprobar",
          onPress: async () => {
            setLinkingLoading(true);
            try {
              const { error } = await linkingService.approveLink(
                userId,
                childId,
              );
              if (error) throw error;
              Alert.alert(
                "¡Vinculación exitosa!",
                `${childName} ahora está vinculado contigo`,
              );
              loadUserData(); // Recargar datos
            } catch (error) {
              Alert.alert("Error", "No se pudo aprobar la vinculación");
            } finally {
              setLinkingLoading(false);
            }
          },
        },
      ],
    );
  };

  // PADRE: Rechazar vinculación
  const handleRejectLink = async (childId: string, childName: string) => {
    Alert.alert(
      "Rechazar vinculación",
      `¿Rechazar la solicitud de ${childName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Rechazar",
          style: "destructive",
          onPress: async () => {
            setLinkingLoading(true);
            try {
              const { error } = await linkingService.rejectLink(
                userId,
                childId,
              );
              if (error) throw error;
              Alert.alert("Solicitud rechazada");
              loadUserData();
            } catch (error) {
              Alert.alert("Error", "No se pudo rechazar la solicitud");
            } finally {
              setLinkingLoading(false);
            }
          },
        },
      ],
    );
  };

  // MENOR: Solicitar vinculación con código
  const handleRequestLinkWithCode = async () => {
    if (!linkCode.trim() || linkCode.length !== 6) {
      Alert.alert("Error", "Ingresa un código válido de 6 caracteres");
      return;
    }

    setLinkingLoading(true);
    try {
      const { success, parentName, error } =
        await linkingService.requestLinkWithCode(userId, linkCode.trim());

      if (!success) {
        Alert.alert(
          "Error",
          (error as any)?.message || "Código inválido o expirado",
        );
        return;
      }

      Alert.alert(
        "¡Solicitud enviada!",
        `Se ha enviado una solicitud de vinculación a ${parentName}. Espera a que la apruebe.`,
      );
      setLinkCode("");
      setLinkStatus("pending");
      setLinkedParentInfo({ name: parentName || "Padre/Tutor", email: "" });
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo enviar la solicitud. Verifica que las tablas estén creadas.",
      );
    } finally {
      setLinkingLoading(false);
    }
  };

  const handleAddContact = () => {
    if (
      !newContactName.trim() ||
      !newContactPhone.trim() ||
      !newContactRelation.trim()
    ) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    if (editingContactId) {
      setContacts(
        contacts.map((c) =>
          c.id === editingContactId
            ? {
                ...c,
                name: newContactName.trim(),
                phone: newContactPhone.trim(),
                relation: newContactRelation.trim(),
              }
            : c,
        ),
      );
      Alert.alert("Éxito", "Contacto actualizado");
      setEditingContactId(null);
    } else {
      setContacts([
        ...contacts,
        {
          id: Date.now().toString(),
          name: newContactName.trim(),
          phone: newContactPhone.trim(),
          relation: newContactRelation.trim(),
        },
      ]);
      Alert.alert("Éxito", "Contacto agregado");
    }

    setNewContactName("");
    setNewContactPhone("");
    setNewContactRelation("");
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContactId(contact.id);
    setNewContactName(contact.name);
    setNewContactPhone(contact.phone);
    setNewContactRelation(contact.relation);
  };

  const handleCancelEditContact = () => {
    setEditingContactId(null);
    setNewContactName("");
    setNewContactPhone("");
    setNewContactRelation("");
  };

  const handleRemoveContact = (id: string) => {
    Alert.alert("Eliminar", "¿Está seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => setContacts(contacts.filter((c) => c.id !== id)),
      },
    ]);
  };

  const handleAddZone = () => {
    if (!newZoneName.trim()) {
      Alert.alert("Error", "Ingresa el nombre de la zona");
      return;
    }

    setZones([
      ...zones,
      {
        id: Date.now().toString(),
        name: newZoneName.trim(),
        type: newZoneType,
      },
    ]);
    setNewZoneName("");
    Alert.alert("Éxito", "Zona agregada");
  };

  const handleRemoveZone = (index: number) => {
    Alert.alert("Eliminar", "¿Está seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => setZones(zones.filter((_, i) => i !== index)),
      },
    ]);
  };

  const handleAddChild = async () => {
    if (!newChildName.trim() || !newChildAge.trim()) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    try {
      const { data: newChild } = await authService.addChild(
        userId,
        newChildName.trim(),
        parseInt(newChildAge),
      );

      if (newChild) {
        setChildren([...children, newChild]);
        setNewChildName("");
        setNewChildAge("");
        Alert.alert("Éxito", "Menor agregado");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el menor");
    }
  };

  const handleSave = async () => {
    try {
      const updateData: Record<string, any> = { first_name: name };
      if (!isParent && age) {
        updateData.age = parseInt(age);
      }

      const { error } = await (supabase as any)
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (error) throw error;
      Alert.alert("Guardado", "Los cambios fueron guardados");
      setEditing(false);
    } catch (error) {
      Alert.alert("Error", "No se pudieron guardar");
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Error", "Mínimo 6 caracteres");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Éxito", "Contraseña actualizada");
      setNewPassword("");
      setShowPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configuración</Text>

      {isParent ? (
        <>
          {/* MENORES REGISTRADOS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>👶 Menores registrados</Text>
              {editing && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddChild}
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
                  placeholder="Nombre"
                  value={newChildName}
                  onChangeText={setNewChildName}
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

          {/* CONTACTOS AUTORIZADOS - PARA PADRES */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>👨‍👩‍👧 Contactos autorizados</Text>
              {editing && !editingContactId && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    if (
                      newContactName &&
                      newContactPhone &&
                      newContactRelation
                    ) {
                      handleAddContact();
                    }
                  }}
                >
                  <Text style={styles.addButtonText}>+ Agregar</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.sectionSubtitle}>
              Personas autorizadas para contactar en caso de emergencia
            </Text>

            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarText}>👤</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <View style={styles.contactDetail}>
                      <MaterialCommunityIcons
                        name="account-heart"
                        size={14}
                        color={colors.primary}
                      />
                      <Text style={styles.contactRelation}>
                        {contact.relation} del menor
                      </Text>
                    </View>
                    <View style={styles.contactDetail}>
                      <MaterialCommunityIcons
                        name="phone"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.contactPhone}>{contact.phone}</Text>
                    </View>
                  </View>
                  {editing && (
                    <TouchableOpacity
                      onPress={() => handleEditContact(contact)}
                      style={styles.editIconButton}
                    >
                      <MaterialCommunityIcons
                        name="pencil"
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                {editing && (
                  <TouchableOpacity
                    onPress={() => handleRemoveContact(contact.id)}
                    style={styles.removeContactButton}
                  >
                    <MaterialCommunityIcons
                      name="trash-can"
                      size={16}
                      color="#E53935"
                    />
                    <Text style={styles.removeContactText}>Eliminar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {editing && (
              <View style={styles.addContactForm}>
                <Text style={styles.formTitle}>
                  {editingContactId
                    ? "✏️ Editar contacto"
                    : "➕ Nuevo contacto"}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del contacto"
                  value={newContactName}
                  onChangeText={setNewContactName}
                  autoCapitalize="words"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Parentesco (Ej: Madre, Tío, Abuela)"
                  value={newContactRelation}
                  onChangeText={setNewContactRelation}
                  autoCapitalize="words"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Teléfono"
                  value={newContactPhone}
                  onChangeText={setNewContactPhone}
                  keyboardType="phone-pad"
                />
                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[
                      styles.formButton,
                      styles.saveFormButton,
                      (!newContactName ||
                        !newContactPhone ||
                        !newContactRelation) &&
                        styles.buttonDisabled,
                    ]}
                    onPress={handleAddContact}
                    disabled={
                      !newContactName || !newContactPhone || !newContactRelation
                    }
                  >
                    <Text style={styles.formButtonText}>
                      {editingContactId ? "Actualizar" : "Agregar"}
                    </Text>
                  </TouchableOpacity>
                  {editingContactId && (
                    <TouchableOpacity
                      style={[styles.formButton, styles.cancelFormButton]}
                      onPress={handleCancelEditContact}
                    >
                      <Text style={styles.formButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* HIJOS VINCULADOS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 Hijos vinculados</Text>
            <Text style={styles.sectionSubtitle}>
              Cuentas de menores vinculadas a tu cuenta
            </Text>

            {linkedChildren.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="account-off"
                  size={40}
                  color="#999"
                />
                <Text style={styles.emptyStateText}>
                  No hay hijos vinculados
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Genera un código y compártelo con tu hijo
                </Text>
              </View>
            ) : (
              linkedChildren.map((child) => (
                <View key={child.id} style={styles.linkedChildCard}>
                  <View style={styles.linkedChildHeader}>
                    <View style={styles.linkedChildAvatar}>
                      <Text style={styles.linkedChildAvatarText}>👦</Text>
                    </View>
                    <View style={styles.linkedChildInfo}>
                      <Text style={styles.linkedChildName}>{child.name}</Text>
                      <Text style={styles.linkedChildAge}>
                        {child.age} años
                      </Text>
                    </View>
                    <View style={styles.linkedBadge}>
                      <Text style={styles.linkedBadgeText}>✓ Vinculado</Text>
                    </View>
                  </View>
                  <View style={styles.linkedChildDetails}>
                    <View style={styles.linkedChildDetail}>
                      <MaterialCommunityIcons
                        name="email"
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={styles.linkedChildDetailText}>
                        {child.email || "Sin correo"}
                      </Text>
                    </View>
                    <View style={styles.linkedChildDetail}>
                      <MaterialCommunityIcons
                        name="phone"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.linkedChildDetailText}>
                        {child.phone || "Sin teléfono"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* SOLICITUDES DE VINCULACIÓN PENDIENTES */}
          {pendingRequests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                📨 Solicitudes de vinculación
              </Text>
              <Text style={styles.sectionSubtitle}>
                Menores que solicitan vincularse contigo
              </Text>

              {pendingRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestAvatar}>
                      <Text style={styles.requestAvatarText}>👦</Text>
                    </View>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>
                        {request.childName}
                      </Text>
                      <Text style={styles.requestEmail}>
                        {request.childEmail}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.approveButton]}
                      onPress={() =>
                        handleApproveLink(request.childId, request.childName)
                      }
                      disabled={linkingLoading}
                    >
                      <Text style={styles.requestButtonText}>✓ Aprobar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.rejectButton]}
                      onPress={() =>
                        handleRejectLink(request.childId, request.childName)
                      }
                      disabled={linkingLoading}
                    >
                      <Text style={styles.requestButtonText}>✕ Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* GENERAR CÓDIGO DE VINCULACIÓN */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔗 Vincular nuevo hijo</Text>
            <Text style={styles.sectionSubtitle}>
              Genera un código para que tu hijo vincule su cuenta
            </Text>

            {generatedCode && (
              <View style={styles.codeDisplay}>
                <Text style={styles.codeLabel}>Código actual:</Text>
                <Text style={styles.codeText}>{generatedCode}</Text>
                <Text style={styles.codeExpiry}>Válido por 15 minutos</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.generateCodeButton,
                linkingLoading && styles.buttonDisabled,
              ]}
              onPress={handleGenerateCode}
              disabled={linkingLoading}
            >
              {linkingLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="qrcode-plus"
                    size={20}
                    color="#FFF"
                  />
                  <Text style={styles.generateCodeText}>
                    {generatedCode ? "Generar nuevo código" : "Generar código"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* CUENTAS DE HIJOS VINCULADAS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 Cuentas vinculadas</Text>
            <Text style={styles.sectionSubtitle}>
              Cuentas de menores que monitoreas
            </Text>

            {linkedChildrenAccounts.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="account-off"
                  size={40}
                  color="#999"
                />
                <Text style={styles.emptyStateText}>
                  No hay cuentas vinculadas
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Genera un código y compártelo con tu hijo
                </Text>
              </View>
            ) : (
              linkedChildrenAccounts.map((child) => (
                <View key={child.id} style={styles.linkedAccountCard}>
                  <View style={styles.linkedAccountHeader}>
                    <View style={styles.linkedAccountAvatar}>
                      <Text style={styles.linkedAccountAvatarText}>👦</Text>
                    </View>
                    <View style={styles.linkedAccountInfo}>
                      <Text style={styles.linkedAccountName}>{child.name}</Text>
                      <Text style={styles.linkedAccountEmail}>
                        {child.email}
                      </Text>
                    </View>
                    <View style={styles.linkedBadge}>
                      <Text style={styles.linkedBadgeText}>✓ Vinculado</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      ) : (
        <>
          {/* PERFIL MENOR */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Mi Perfil</Text>

            {editing ? (
              <>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholder="Nombre"
                />
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholder="Edad"
                />
              </>
            ) : (
              <>
                <Text style={styles.profileText}>
                  Nombre: {name || "No especificado"}
                </Text>
                <Text style={styles.profileText}>
                  Edad: {age ? `${age} años` : "No especificada"}
                </Text>
              </>
            )}
          </View>

          {/* VINCULACIÓN CON PADRE - PARA MENORES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🔗 Vinculación con padre/tutor
            </Text>
            <Text style={styles.sectionSubtitle}>
              Vincula tu cuenta con la de tu padre o tutor para que pueda ver tu
              ubicación
            </Text>

            {linkStatus === "linked" && linkedParentInfo ? (
              <View style={styles.linkedParentCard}>
                <View style={styles.linkedParentHeader}>
                  <View style={styles.linkedParentAvatar}>
                    <Text style={styles.linkedParentAvatarText}>👨‍👩‍👧</Text>
                  </View>
                  <View style={styles.linkedParentInfo}>
                    <Text style={styles.linkedParentName}>
                      {linkedParentInfo.name}
                    </Text>
                    <Text style={styles.linkedParentEmail}>
                      {linkedParentInfo.email}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, styles.statusLinked]}>
                    <Text style={styles.statusBadgeText}>✓ Vinculado</Text>
                  </View>
                </View>
              </View>
            ) : linkStatus === "pending" && linkedParentInfo ? (
              <View style={styles.linkedParentCard}>
                <View style={styles.linkedParentHeader}>
                  <View style={styles.linkedParentAvatar}>
                    <Text style={styles.linkedParentAvatarText}>⏳</Text>
                  </View>
                  <View style={styles.linkedParentInfo}>
                    <Text style={styles.linkedParentName}>
                      {linkedParentInfo.name}
                    </Text>
                    <Text style={styles.pendingText}>
                      Esperando aprobación...
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, styles.statusPending]}>
                    <Text style={styles.statusBadgeText}>Pendiente</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.linkForm}>
                <Text style={styles.linkFormTitle}>
                  📝 Ingresa el código de tu padre/tutor
                </Text>
                <Text style={styles.linkFormSubtitle}>
                  Pide a tu padre que genere un código desde su app y escríbelo
                  aquí
                </Text>
                <TextInput
                  style={styles.codeInput}
                  placeholder="ABC123"
                  placeholderTextColor="#999"
                  value={linkCode}
                  onChangeText={(text) => setLinkCode(text.toUpperCase())}
                  maxLength={6}
                  autoCapitalize="characters"
                  editable={!linkingLoading}
                />
                <TouchableOpacity
                  style={[
                    styles.linkButton,
                    (linkCode.length !== 6 || linkingLoading) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={handleRequestLinkWithCode}
                  disabled={linkCode.length !== 6 || linkingLoading}
                >
                  {linkingLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="link-plus"
                        size={20}
                        color="#FFF"
                      />
                      <Text style={styles.linkButtonText}>
                        Vincular con padre/tutor
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* CONTACTOS DE EMERGENCIA - SOLO LECTURA PARA MENORES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📞 Contactos de emergencia</Text>
            <Text style={styles.sectionSubtitle}>
              Personas que serán notificadas en caso de emergencia
            </Text>

            {contacts.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="account-off"
                  size={40}
                  color="#999"
                />
                <Text style={styles.emptyStateText}>
                  No hay contactos configurados
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Tu padre/tutor debe agregarlos
                </Text>
              </View>
            ) : (
              contacts.map((contact) => (
                <View key={contact.id} style={styles.contactCard}>
                  <View style={styles.contactHeader}>
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactAvatarText}>👤</Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <View style={styles.contactDetail}>
                        <MaterialCommunityIcons
                          name="account-heart"
                          size={14}
                          color={colors.primary}
                        />
                        <Text style={styles.contactRelation}>
                          {contact.relation}
                        </Text>
                      </View>
                      <View style={styles.contactDetail}>
                        <MaterialCommunityIcons
                          name="phone"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.contactPhone}>{contact.phone}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      )}

      {/* ZONAS */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🗺️ Zonas</Text>
          {editing && isParent && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                if (newZoneName) {
                  handleAddZone();
                } else {
                  Alert.alert(
                    "Completa los datos",
                    "Ingresa el nombre de la zona",
                  );
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
            {editing && isParent && (
              <TouchableOpacity
                onPress={() => handleRemoveZone(index)}
                style={styles.deleteButton}
              >
                <MaterialCommunityIcons
                  name="trash-can"
                  size={20}
                  color="#E53935"
                />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {editing && isParent && (
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

      {/* RUTA - solo para padres editar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛣️ Ruta diaria</Text>

        {editing && isParent ? (
          <TextInput
            value={route}
            onChangeText={setRoute}
            style={styles.input}
          />
        ) : (
          <Text style={styles.profileText}>{route}</Text>
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

      {/* PREMIUM - solo mostrar a padres */}
      {isParent && (
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
      )}

      {/* SEGURIDAD */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔐 Seguridad</Text>

        {editing && !showPassword && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowPassword(true)}
          >
            <Text style={styles.buttonText}>Cambiar contraseña</Text>
          </TouchableOpacity>
        )}

        {editing && showPassword && (
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
              <Text style={styles.buttonText}>Guardar</Text>
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

        {/* Botón de cerrar sesión SOLO para padres - siempre visible */}
        {isParent && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        )}

        {/* Para menores: mostrar mensaje bloqueado */}
        {!isParent && (
          <View style={styles.lockedSection}>
            <MaterialCommunityIcons name="lock" size={24} color="#999" />
            <Text style={styles.lockedText}>
              Para cerrar sesión, solicita autorización a tu padre/tutor
            </Text>
          </View>
        )}
      </View>

      {/* Botones de edición - solo para padres o limitado para menores */}
      {isParent ? (
        editing ? (
          <View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Guardar cambios</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditing(false)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
        )
      ) : // Menores solo pueden editar su perfil básico
      editing ? (
        <View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Guardar cambios</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setEditing(false)}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditing(true)}
        >
          <Text style={styles.buttonText}>Editar mi perfil</Text>
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  profileText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
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
  contactCard: {
    backgroundColor: colors.greenCream,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactAvatarText: {
    fontSize: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontWeight: "bold",
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  contactDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  contactRelation: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
  contactPhone: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  editIconButton: {
    padding: 8,
    backgroundColor: "#FFF",
    borderRadius: 20,
  },
  removeContactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  removeContactText: {
    color: "#E53935",
    fontSize: 12,
    fontWeight: "600",
  },
  addContactForm: {
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: "dashed",
  },
  formTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveFormButton: {
    backgroundColor: colors.primary,
  },
  cancelFormButton: {
    backgroundColor: "#999",
  },
  formButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  linkedChildCard: {
    backgroundColor: colors.greenCream,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  linkedChildHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  linkedChildAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  linkedChildAvatarText: {
    fontSize: 22,
  },
  linkedChildInfo: {
    flex: 1,
  },
  linkedChildName: {
    fontWeight: "bold",
    fontSize: 16,
    color: colors.textPrimary,
  },
  linkedChildAge: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  linkedChildDetails: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
  },
  linkedChildDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  linkedChildDetailText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyStateText: {
    color: "#999",
    fontSize: 14,
    marginTop: 8,
  },
  emptyStateSubtext: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
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
  input: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 14,
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
  buttonDisabled: {
    opacity: 0.5,
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
  lockedSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.borderLight,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 10,
  },
  lockedText: {
    flex: 1,
    color: "#666",
    fontSize: 13,
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
    padding: 10,
    borderRadius: 8,
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
    fontSize: 13,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  // Vinculación - Padre
  requestCard: {
    backgroundColor: colors.greenCream,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.warning,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  requestAvatarText: {
    fontSize: 22,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontWeight: "bold",
    fontSize: 16,
    color: colors.textPrimary,
  },
  requestEmail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  requestActions: {
    flexDirection: "row",
    gap: 10,
  },
  requestButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#E53935",
  },
  requestButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  codeDisplay: {
    backgroundColor: colors.greenCream,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  codeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  codeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 4,
  },
  codeExpiry: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 8,
  },
  generateCodeButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 10,
  },
  generateCodeText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkedAccountCard: {
    backgroundColor: colors.greenCream,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  linkedAccountHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkedAccountAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  linkedAccountAvatarText: {
    fontSize: 22,
  },
  linkedAccountInfo: {
    flex: 1,
  },
  linkedAccountName: {
    fontWeight: "bold",
    fontSize: 16,
    color: colors.textPrimary,
  },
  linkedAccountEmail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  linkedBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  linkedBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  // Vinculación - Menor
  linkedParentCard: {
    backgroundColor: colors.greenCream,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  linkedParentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkedParentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  linkedParentAvatarText: {
    fontSize: 24,
  },
  linkedParentInfo: {
    flex: 1,
  },
  linkedParentName: {
    fontWeight: "bold",
    fontSize: 16,
    color: colors.textPrimary,
  },
  linkedParentEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusLinked: {
    backgroundColor: "#4CAF50",
  },
  statusPending: {
    backgroundColor: "#FFB300",
  },
  statusBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  pendingText: {
    fontSize: 13,
    color: colors.warning,
    fontStyle: "italic",
  },
  linkForm: {
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: "dashed",
  },
  linkFormTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  linkFormSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  codeInput: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderColor: colors.primary,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 8,
    color: colors.textPrimary,
  },
  linkButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  linkButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
