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
  const [userType, setUserType] = useState<"parent" | "child" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (userType === "child" && !age.trim()) {
      Alert.alert("Error", "Por favor ingresa tu edad");
      return;
    }

    if (userType === "parent" && !childName.trim()) {
      Alert.alert("Error", "Por favor ingresa el nombre del menor");
      return;
    }

    if (userType === "parent" && !childAge.trim()) {
      Alert.alert("Error", "Por favor ingresa la edad del menor");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authService.signUp(
        email.trim(),
        password,
        name.trim(),
        userType || "child",
        userType === "parent" ? childName.trim() : undefined,
        userType === "parent" ? parseInt(childAge) : (userType === "child" ? parseInt(age) : undefined)
      );

      if (error) {
        console.error("Error de registro:", error);
        
        const errorMessage = (error as any)?.message || "";
        const errorStatus = (error as any)?.status || "";
        const errorCode = (error as any)?.code || "";
        
        // Verificar si falta la tabla en la base de datos
        if (errorStatus === "database_error" || errorCode === "PGRST205") {
          Alert.alert(
            "⚠️ Base de Datos No Configurada",
            errorMessage || "Las tablas de la base de datos no están creadas. Abre DATABASE_SETUP.sql en el proyecto y ejecuta el contenido en Supabase SQL Editor.",
          );
        }
        // Verificar si es error de rate limit
        else if (errorStatus === "rate_limit_error" || errorMessage.includes("rate_limit") || errorMessage.includes("Demasiados intentos")) {
          Alert.alert(
            "Límite de Intentos",
            "Has superado el límite de registros. Por favor, espera 15-30 minutos e intenta de nuevo.",
          );
        }
        // Verificar si es error de red
        else if (errorMessage.includes("Network") || errorMessage.includes("network") || errorMessage.includes("Failed to fetch") || errorStatus === "network_error") {
          Alert.alert(
            "Error de Conexión",
            "No se puede conectar con el servidor de Supabase. Por favor:\n\n1. Verifica tu conexión a internet\n2. Comprueba que las variables de entorno estén configuradas\n3. Verifica la URL y clave de Supabase en .env\n\nSi necesitas ayuda, consulta .env.example",
          );
        } else if (errorMessage.includes("already registered")) {
          Alert.alert("Error", "Este correo ya está registrado. Intenta con otro.");
        } else {
          Alert.alert("Error", "No se pudo crear la cuenta. Intenta de nuevo.");
        }
        return;
      }

      if (data?.user) {
        Alert.alert("¡Registro exitoso!", "Tu cuenta ha sido creada.", [
          {
            text: "OK",
            onPress: () => {
              console.log("Usuario registrado:", data.user?.email);
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

  if (!userType) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/Logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.appTitle}>KidSecure</Text>
            </View>

            <Text style={styles.label}>¿Cuál es tu rol?</Text>

            <TouchableOpacity
              style={[styles.typeButton, styles.parentButton]}
              onPress={() => setUserType("parent")}
              disabled={loading}
            >
              <Text style={styles.typeButtonText}>👨‍👩‍👧 Soy Padre/Tutor</Text>
              <Text style={styles.typeButtonSubtext}>
                Crear cuenta y monitorear a mi hijo/a
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, styles.childButton]}
              onPress={() => setUserType("child")}
              disabled={loading}
            >
              <Text style={styles.typeButtonText}>👤 Soy Menor</Text>
              <Text style={styles.typeButtonSubtext}>
                Crear mi propia cuenta
              </Text>
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
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/Logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.appTitle}>
              {userType === "parent" ? "Crear Cuenta - Padre/Tutor" : "Crear Cuenta - Menor"}
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder={userType === "parent" ? "Tu nombre completo" : "Nombre completo"}
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

          {userType === "child" && (
            <TextInput
              style={styles.input}
              placeholder="Tu edad"
              placeholderTextColor="#999"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              editable={!loading}
            />
          )}

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
              autoComplete="off"
              autoCorrect={false}
              autoCapitalize="none"
              textContentType="none"
              importantForAutofill="no"
              keyboardType="default"
              spellCheck={false}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <Text style={styles.passwordToggleIcon}>
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
              autoComplete="off"
              autoCorrect={false}
              autoCapitalize="none"
              textContentType={Platform.OS === "ios" ? "oneTimeCode" : "none"}
              importantForAutofill="no"
              keyboardType="default"
              spellCheck={false}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              <Text style={styles.passwordToggleIcon}>
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </Text>
            </TouchableOpacity>
          </View>

          {userType === "parent" && (
            <>
              <Text style={styles.label}>Información del menor a monitorear</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del menor"
                placeholderTextColor="#999"
                value={childName}
                onChangeText={setChildName}
                autoCapitalize="words"
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Edad del menor"
                placeholderTextColor="#999"
                value={childAge}
                onChangeText={setChildAge}
                keyboardType="numeric"
                editable={!loading}
              />
            </>
          )}

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
            onPress={() => setUserType(null)}
          >
            <Text style={styles.loginText}>Cambiar tipo de usuario</Text>
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
