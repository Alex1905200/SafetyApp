import { NavigatorScreenParams } from "@react-navigation/native";

// Stack de autenticación
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Bottom Tabs principal (Padres) - Sin Alerts, solo Notificaciones
export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Notifications: undefined;
  Settings: undefined;
};

// Bottom Tabs para menores (sin Notifications)
export type ChildTabParamList = {
  Home: undefined;
  History: undefined;
  Settings: undefined;
};

// Stack para navegación de padres
type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
};

// Stack para navegación de menores
export type ChildMainStackParamList = {
  ChildMainTabs: NavigatorScreenParams<ChildTabParamList> | undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
  ChildMain: NavigatorScreenParams<ChildMainStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
