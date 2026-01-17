import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import HomeMapScreen from "../screens/HomeMapScreen";
import HistoryScreen from "../screens/HistoryScreen";
import AlertsScreen from "../screens/AlertsScreen";
import SettingsScreen from "../screens/SettingsScreen";

import { MainTabParamList } from "./types";

// 👉 Stack tipado correctamente
type MainStackParamList = {
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          backgroundColor: "#1B9B8C",
          borderTopColor: "#1B9B8C",
          borderTopWidth: 0,
          height: 75,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          color: "#FFFFFF",
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeMapScreen}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ size }) => (
            <MaterialCommunityIcons name="home" size={size} color="#FFFFFF" />
          ),
        }}
      />

      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: "Historial",
          tabBarIcon: ({ size }) => (
            <MaterialCommunityIcons name="history" size={size} color="#FFFFFF" />
          ),
        }}
      />

      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarLabel: "Alertas",
          tabBarIcon: ({ size }) => (
            <MaterialCommunityIcons name="bell" size={size} color="#FFFFFF" />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Configuración",
          tabBarIcon: ({ size }) => (
            <MaterialCommunityIcons name="cog" size={size} color="#FFFFFF" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
    </Stack.Navigator>
  );
}
