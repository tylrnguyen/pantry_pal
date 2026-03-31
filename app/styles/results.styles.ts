import { StyleSheet } from "react-native";
import { COLORS, RADIUS, SPACING } from "./theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingTop: SPACING.pageTop,
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: SPACING.lg,
  },
  header: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    alignSelf: "flex-start",
  },
  backText: {
    color: COLORS.textSubtle,
    fontWeight: "600",
  },
  summaryText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.chipText,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  cardImage: {
    width: "100%",
    height: 170,
  },
  cardBody: {
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
  },
  badgeSafe: {
    backgroundColor: "#ecfdf5",
  },
  badgeWarning: {
    backgroundColor: "#fffbeb",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeSafeText: {
    color: COLORS.success,
  },
  badgeWarnText: {
    color: COLORS.warning,
  },
  explanation: {
    color: COLORS.textSubtle,
    lineHeight: 18,
  },
});
