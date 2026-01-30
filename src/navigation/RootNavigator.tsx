import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { ChildMainNavigator } from "./ChildMainNavigator";
import { supabase } from "../config/supabase";
import { RootStackParamList } from "./types";
import { authService } from "../services/authService";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<"parent" | "child" | null>(null);

  useEffect(() => {
    // Chequear sesión actual inmediatamente
    checkCurrentSession();

    // Usar el listener de autenticación de Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setIsLoggedIn(!!session);
        
        if (session?.user) {
          // Obtener tipo de usuario
          const { data: profile } = await authService.getProfile(session.user.id);
          setUserType(profile?.user_type || "child");
        } else {
          setUserType(null);
        }
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkCurrentSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Current session:", session?.user?.email);
      setIsLoggedIn(!!session);

      if (session?.user) {
        const { data: profile } = await authService.getProfile(session.user.id);
        setUserType(profile?.user_type || "child");
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setIsLoggedIn(false);
      setUserType(null);
    }
  };

  // Mientras carga, no mostrar nada
  if (isLoggedIn === null || (isLoggedIn && userType === null)) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isLoggedIn ? (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{
              animationTypeForReplace: isLoggedIn === false ? "pop" : "pop",
            }}
          />
        ) : userType === "parent" ? (
          <Stack.Screen
            name="Main"
            component={MainNavigator}
            options={{
              animationTypeForReplace: isLoggedIn === true ? "pop" : "pop",
            }}
          />
        ) : (
          <Stack.Screen
            name="ChildMain"
            component={ChildMainNavigator}
            options={{
              animationTypeForReplace: isLoggedIn === true ? "pop" : "pop",
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
