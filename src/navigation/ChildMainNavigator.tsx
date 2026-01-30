import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import HomeMapScreen from "../screens/HomeMapScreen";
import HistoryScreen from "../screens/HistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { colors } from "../styles/colors";

import { ChildMainStackParamList, ChildTabParamList } from "./types";

const Stack = createNativeStackNavigator<ChildMainStackParamList>();
const Tab = createBottomTabNavigator<ChildTabParamList>();

function ChildMainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopColor: colors.primary,
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

export function ChildMainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChildMainTabs" component={ChildMainTabsNavigator} />
    </Stack.Navigator>
  );
}
