import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { authService } from "../services/authService";
import { registerScreenStyles as styles } from "../styles/registerScreenStyles";
import { AuthStackParamList } from "../navigation/types";

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Register"
>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Por favor ingresa tu nombre");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Error", "Por favor ingresa un correo válido");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authService.signUp(
        email.trim(),
        password,
        name.trim(),
      );

      if (error) {
        console.error("Error de registro:", error);
        Alert.alert("Error", "No se pudo crear la cuenta. Intenta de nuevo.");
        return;
      }

      if (data?.user) {
        Alert.alert("¡Registro exitoso!", "Tu cuenta ha sido creada.", [
          {
            text: "OK",
            onPress: () => {
              console.log("Usuario registrado:", data.user?.email);
              // La navegación se manejará automáticamente por RootNavigator
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      Alert.alert("Error", "Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.appTitle}>Crear Cuenta</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.registerButtonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={loading}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginText}>
              ¿Ya tienes cuenta?{" "}
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
