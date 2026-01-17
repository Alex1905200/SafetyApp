import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { spacing, radius, fontSize } from "./spacing";

export const registerScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
  },
  logoHeart: {
    width: 80,
    height: 80,
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
    fontSize: 40,
  },
  appTitle: {
    fontSize: fontSize.xxxl,
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
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  registerButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.lg,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginText: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: "bold",
  },
});
