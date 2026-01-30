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
    width: 180,
    height: 180,
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
  label: {
    fontSize: fontSize.lg,
    fontWeight: "bold",
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  typeButton: {
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  parentButton: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  childButton: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  typeButtonText: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  typeButtonSubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
