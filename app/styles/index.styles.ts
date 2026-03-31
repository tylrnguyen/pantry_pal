import { StyleSheet } from "react-native";
import { COLORS, RADIUS, SPACING } from "./theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingTop: SPACING.pageTop,
    paddingHorizontal: SPACING.pageX,
    paddingBottom: 40,
    gap: SPACING.lg,
  },
  headerRow: {
    marginBottom: 2,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  logoBubble: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.brand,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  searchWrap: {
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconBtnActive: {
    backgroundColor: COLORS.brand,
  },
  previewWrap: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
    backgroundColor: COLORS.white,
  },
  previewImage: {
    width: "100%",
    height: 170,
  },
  clearPreviewBtn: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.pill,
  },
  sectionLabel: {
    marginTop: SPACING.xs,
    fontSize: 12,
    letterSpacing: 0.5,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  chipSelected: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
  },
  chipDangerSelected: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  chipText: {
    color: COLORS.chipText,
    fontWeight: "500",
    fontSize: 13,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  cta: {
    marginTop: SPACING.xs,
    minHeight: 50,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  ctaText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },
  recommendLabel: {
    marginTop: SPACING.sm,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  rowList: {
    paddingVertical: SPACING.xs,
    gap: SPACING.lg,
  },
  card: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardImage: {
    width: "100%",
    height: 96,
  },
  cardBody: {
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    minHeight: 32,
  },
  cardMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
