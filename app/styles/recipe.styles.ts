import { StyleSheet } from "react-native";
import { COLORS, RADIUS, SPACING } from "./theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingBottom: 28,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg,
    gap: SPACING.lg,
  },
  notFound: {
    color: COLORS.chipText,
    fontSize: 18,
    fontWeight: "700",
  },
  backHomeBtn: {
    backgroundColor: COLORS.brand,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: SPACING.sm,
  },
  backHomeText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  heroWrap: {
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: 250,
  },
  backPill: {
    position: "absolute",
    left: SPACING.xl,
    top: 58,
    width: 34,
    height: 34,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  title: {
    marginTop: 16,
    marginHorizontal: 18,
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  infoRow: {
    flexDirection: "row",
    gap: SPACING.xl,
    marginHorizontal: 18,
    marginTop: SPACING.lg,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  infoText: {
    color: COLORS.textSubtle,
    fontWeight: "600",
  },
  section: {
    marginTop: 18,
    marginHorizontal: 18,
    gap: SPACING.md,
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  tagPill: {
    backgroundColor: "#ecfdf5",
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  tagText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "600",
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  dot: {
    marginTop: 7,
    width: 6,
    height: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: "#10b981",
  },
  ingredientText: {
    color: COLORS.chipText,
    lineHeight: 20,
    flex: 1,
  },
  safeText: {
    color: COLORS.success,
    fontWeight: "600",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: "#fef2f2",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  warningText: {
    color: "#b91c1c",
    flex: 1,
    lineHeight: 18,
  },
  swapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: "#fffbeb",
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  swapText: {
    color: "#92400e",
    flex: 1,
    lineHeight: 18,
  },
  explanationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    backgroundColor: "#ecfdf5",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  explanationText: {
    color: "#065f46",
    flex: 1,
    lineHeight: 20,
  },
});
