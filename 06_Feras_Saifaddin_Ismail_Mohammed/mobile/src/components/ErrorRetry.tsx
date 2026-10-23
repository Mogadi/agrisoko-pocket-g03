import { StyleSheet, Text, View } from "react-native";

import { colors, radius, space } from "../theme/theme";
import { PrimaryButton } from "./PrimaryButton";

export function ErrorRetry({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.box} accessibilityRole="alert">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <PrimaryButton label="Retry" onPress={onRetry} accessibilityHint="Sends the question again" />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.sm,
  },
  title: { color: colors.danger, fontWeight: "800", fontSize: 16 },
  message: { color: colors.text, fontSize: 15, lineHeight: 21 },
});
