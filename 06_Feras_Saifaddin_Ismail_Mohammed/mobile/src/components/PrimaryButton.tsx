import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, space } from "../theme/theme";

export function PrimaryButton({
  label,
  onPress,
  disabled,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    alignItems: "center",
  },
  pressed: { backgroundColor: colors.primaryDark },
  disabled: { opacity: 0.45 },
  label: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
