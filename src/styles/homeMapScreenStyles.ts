import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { spacing, radius, fontSize } from "./spacing";

export const homeMapScreenStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: 50,
    paddingBottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xxxl,
  },
  userName: {
    color: colors.textWhite,
    fontSize: fontSize.xl,
    fontWeight: "bold",
  },
  userStatus: {
    color: colors.textWhite,
    fontSize: fontSize.sm,
  },
  headerIcons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    color: colors.textWhite,
    fontSize: fontSize.xxxl,
  },

  // Map
  map: {
    height: 250,
  },

  // Scroll Content
  scrollContent: {
    flex: 1,
  },

  // Family Container
  familyContainer: {
    flexDirection: "row",
    padding: spacing.lg,
    gap: spacing.md,
  },
  familyCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    width: 80,
  },
  familyIcon: {
    fontSize: 30,
    marginBottom: spacing.xs,
  },
  familyLabel: {
    color: colors.textWhite,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    width: 80,
  },
  addIcon: {
    fontSize: 30,
    color: colors.textWhite,
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  shareText: {
    color: colors.textWhite,
    fontSize: fontSize.md,
    fontWeight: "bold",
  },

  // Alert Button
  alertButton: {
    backgroundColor: colors.danger,
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: "center",
    marginVertical: spacing.md,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  alertButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.xl,
    fontWeight: "bold",
  },

  // Notifications
  notificationsContainer: {
    paddingHorizontal: spacing.lg,
  },
  notification: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  warningNotification: {
    backgroundColor: colors.warningBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  successNotification: {
    backgroundColor: colors.successBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  notificationIcon: {
    fontSize: fontSize.xxxl,
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  // Setting Card
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  settingIconText: {
    fontSize: fontSize.xl,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  // Premium Card
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: "#FFF5E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  premiumIconText: {
    fontSize: fontSize.xl,
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: fontSize.md,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  premiumDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  premiumArrow: {
    fontSize: fontSize.xxxl,
    color: colors.primary,
    fontWeight: "bold",
  },

  // Bottom Navigation
  bottomSpacer: {
    height: spacing.xl,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navIcon: {
    fontSize: fontSize.xxxl,
    marginBottom: 4,
    opacity: 0.5,
  },
  navIconActive: {
    fontSize: fontSize.xxxl,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  navLabelActive: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: "bold",
  },
});
