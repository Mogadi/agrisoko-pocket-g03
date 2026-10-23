import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, space } from "../theme/theme";
import type { DirectoryMember } from "../types";

export function MemberCard({
  member,
  onPress,
}: {
  member: DirectoryMember;
  onPress: () => void;
}) {
  const initial = member.fullName.charAt(0);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${member.fullName}, ${member.role}`}
      accessibilityHint="Opens the member profile"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.avatar}>
        <Text style={styles.initial}>{initial}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{member.fullName}</Text>
        <Text style={styles.role}>{member.role}</Text>
        {member.feature ? (
          <Text style={styles.feature} numberOfLines={2}>
            {member.feature}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  initial: { color: colors.primaryDark, fontWeight: "800", fontSize: 18 },
  body: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: colors.text },
  role: { marginTop: 2, color: colors.primary, fontWeight: "600" },
  feature: { marginTop: 4, color: colors.muted, fontSize: 13 },
});
