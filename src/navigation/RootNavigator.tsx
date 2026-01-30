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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkCurrentSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event);

        if (session?.user) {
          setIsLoggedIn(true);
          await loadUserType(session.user.id);
        } else {
          setIsLoggedIn(false);
          setUserType(null);
        }
        setIsLoading(false);
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const loadUserType = async (userId: string) => {
    try {
      const { data: profile } = await authService.getProfile(userId);
      const profileData = profile as any;

      console.log("👤 Profile data:", profileData);
      console.log("👤 User type from profile:", profileData?.user_type);

      // Verificar también en user_metadata si no está en profile
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const metadataUserType = user?.user_metadata?.user_type;

      console.log("👤 User type from metadata:", metadataUserType);

      const finalUserType =
        profileData?.user_type || metadataUserType || "child";
      console.log("✅ Final user type:", finalUserType);

      setUserType(finalUserType);
    } catch (error) {
      console.error("Error loading user type:", error);
      setUserType("child");
    }
  };

  const checkCurrentSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        console.log("📱 Current session found:", session.user.email);
        setIsLoggedIn(true);
        await loadUserType(session.user.id);
      } else {
        console.log("📱 No session found");
        setIsLoggedIn(false);
        setUserType(null);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setIsLoggedIn(false);
      setUserType(null);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("🧭 Navigation state:", { isLoggedIn, userType, isLoading });

  if (isLoading || isLoggedIn === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : userType === "parent" ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="ChildMain" component={ChildMainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
