import { NavigatorScreenParams } from "@react-navigation/native";

// Stack de autenticación
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Bottom Tabs principal
export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Alerts: undefined;
  Settings: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
