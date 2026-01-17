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
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { authService } from "../services/authService";
import { loginScreenStyles as styles } from "../styles/loginScreenStyles";
import { AuthStackParamList } from "../navigation/types";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Login"
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Por favor ingresa tu contraseña");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Por favor ingresa un correo válido");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authService.signIn(email.trim(), password);

      if (error) {
        console.error("Error de login:", error);
        Alert.alert(
          "Error de autenticación",
          "Correo o contraseña incorrectos. Por favor intenta de nuevo.",
        );
        setLoading(false);
        return;
      }

      if (data?.user) {
        console.log("✅ Login exitoso:", data.user.email);
        // Esperar un poco para que la sesión se actualice
        await new Promise((resolve) => setTimeout(resolve, 500));
        // La navegación se manejará automáticamente por RootNavigator
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      Alert.alert("Error", "Ocurrió un error inesperado. Intenta de nuevo.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Recuperar contraseña", "Ingresa tu correo electrónico", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Enviar",
        onPress: async () => {
          if (!email.trim() || !email.includes("@")) {
            Alert.alert("Error", "Por favor ingresa un correo válido");
            return;
          }
          Alert.alert(
            "Enviado",
            "Revisa tu correo para recuperar tu contraseña",
          );
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>Safety App</Text>
        </View>

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

        <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
          <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.createAccountButton, loading && styles.buttonDisabled]}
          disabled={loading}
          onPress={() => navigation.navigate("Register")}
        >
          <View style={styles.createAccountContent}>
            <Text style={styles.createAccountIcon}>👤</Text>
            <Text style={styles.createAccountText}>
              ¿No tienes cuenta?{"\n"}Crear cuenta
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
