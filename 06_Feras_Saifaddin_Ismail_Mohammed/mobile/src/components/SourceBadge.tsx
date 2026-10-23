import { StyleSheet, Text, View } from "react-native";

import { colors, radius } from "../theme/theme";
import type { SourceKind } from "../types";

const COPY: Record<SourceKind, { label: string; bg: string; fg: string }> = {
  live: { label: "Live match", bg: colors.successSoft, fg: colors.success },
  cached: { label: "Cached result", bg: colors.infoSoft, fg: colors.info },
  offline: { label: "Offline match", bg: colors.warningSoft, fg: colors.offline },
};

export function SourceBadge({ source }: { source: SourceKind }) {
  const tone = COPY[source];
  return (
    <View
      style={[styles.badge, { backgroundColor: tone.bg }]}
      accessibilityRole="text"
      accessibilityLabel={`Result source: ${tone.label}`}
    >
      <Text style={[styles.text, { color: tone.fg }]}>{tone.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  text: { fontSize: 12, fontWeight: "700" },
});
