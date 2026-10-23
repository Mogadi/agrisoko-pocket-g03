import { StyleSheet, Text, View } from "react-native";

import { colors, radius, space } from "../theme/theme";

export function ConnectionBanner({ online, label }: { online: boolean; label: string }) {
  return (
    <View
      style={[styles.wrap, { backgroundColor: online ? colors.successSoft : colors.warningSoft }]}
      accessibilityRole="text"
      accessibilityLabel={`Connection status: ${label}`}
    >
      <View style={[styles.dot, { backgroundColor: online ? colors.success : colors.offline }]} />
      <Text style={[styles.text, { color: online ? colors.success : colors.offline }]}>
        {online ? `Online · ${label}` : "Offline · exact name, nickname and role lookup only"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: 13, fontWeight: "700", flex: 1 },
});
