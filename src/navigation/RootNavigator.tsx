import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { supabase } from "../config/supabase";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // Chequear sesión actual inmediatamente
    checkCurrentSession();

    // Usar el listener de autenticación de Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setIsLoggedIn(!!session);
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
    } catch (error) {
      console.error("Error checking session:", error);
      setIsLoggedIn(false);
    }
  };

  // Mientras carga, no mostrar nada
  if (isLoggedIn === null) {
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
        ) : (
          <Stack.Screen
            name="Main"
            component={MainNavigator}
            options={{
              animationTypeForReplace: isLoggedIn === true ? "pop" : "pop",
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
