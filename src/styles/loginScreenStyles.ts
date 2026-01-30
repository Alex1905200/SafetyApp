import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { spacing, radius, fontSize } from "./spacing";

export const loginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xxxl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.huge,
  },
  logoImage: {
    width: 140,
    height: 140,
    marginBottom: spacing.lg,
  },
  logoHeart: {
    width: 100,
    height: 100,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logoText: {
    fontSize: 50,
  },
  appTitle: {
    fontSize: fontSize.huge,
    fontWeight: "bold",
    marginTop: spacing.lg,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
    fontSize: fontSize.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    fontSize: fontSize.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordToggle: {
    position: "absolute",
    right: spacing.lg,
    padding: spacing.md,
  },
  passwordToggleIcon: {
    fontSize: 20,
  },
  forgotPassword: {
    color: colors.primary,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: 25,
    fontSize: fontSize.md,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.lg,
    fontWeight: "bold",
  },
  createAccountButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  createAccountContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  createAccountIcon: {
    fontSize: fontSize.xxxl,
    marginRight: spacing.md,
  },
  createAccountText: {
    color: colors.textWhite,
    fontSize: fontSize.md,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
