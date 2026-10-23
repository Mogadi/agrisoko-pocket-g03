import { StyleSheet, Text, View } from "react-native";

import { colors, radius } from "../theme/theme";

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View accessibilityLabel={`Confidence ${(pct * 100).toFixed(0)} percent`}>
      <View style={styles.row}>
        <Text style={styles.label}>Confidence</Text>
        <Text style={styles.value}>{(pct * 100).toFixed(0)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { fontWeight: "700", color: colors.text },
  value: { fontWeight: "700", color: colors.primary },
  track: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  fill: { height: 10, backgroundColor: colors.primary, borderRadius: radius.sm },
});
