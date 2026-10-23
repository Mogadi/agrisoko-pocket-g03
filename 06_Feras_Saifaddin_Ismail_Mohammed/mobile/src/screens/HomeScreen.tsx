import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ConnectionBanner } from "../components/ConnectionBanner";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { GROUP } from "../constants/group";
import { readNet, subscribeNet, type NetSnapshot } from "../services/connectivity";
import { colors, radius, space, type } from "../theme/theme";
import type { RootTabParamList } from "../types";

export function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [net, setNet] = useState<NetSnapshot>({ online: true, label: "Checking connection" });

  useEffect(() => {
    readNet().then(setNet);
    return subscribeNet(setNet);
  }, []);

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>{GROUP.institution} · Group {GROUP.code}</Text>
        <Text style={type.title} accessibilityRole="header">
          {GROUP.appName}
        </Text>
        <Text style={styles.lead}>
          Ask who built each part of the Musanze demonstration. The answer is an evidence-based
          profile, not a guessed biography.
        </Text>
      </View>

      <ConnectionBanner online={net.online} label={net.label} />

      <View style={styles.card}>
        <Text style={type.label}>INTENDED USERS</Text>
        <Text style={type.body}>
          Potato cooperatives, employers and innovation partners in Musanze who need to see the
          person behind a feature, a test and a GitHub record.
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.meta}>
          <Text style={type.label}>TEAM</Text>
          <Text style={styles.metaValue}>{GROUP.code}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={type.label}>RELEASE</Text>
          <Text style={styles.metaValue}>{GROUP.version}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={type.label}>VERIFY</Text>
          <Text style={[styles.metaValue, { fontSize: 12 }]}>{GROUP.verificationCode}</Text>
        </View>
      </View>

      <PrimaryButton
        label="Ask the team"
        onPress={() => navigation.navigate("AskTab")}
        accessibilityHint="Opens the question screen"
      />
      <PrimaryButton
        label="Browse member directory"
        onPress={() => navigation.navigate("DirectoryTab")}
        accessibilityHint="Opens the list of group members"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: 8,
  },
  kicker: { color: colors.accent, fontWeight: "700" },
  lead: { color: "#F4F1EA", fontSize: 16, lineHeight: 22 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  metaRow: { flexDirection: "row", gap: 8 },
  meta: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaValue: { marginTop: 4, fontWeight: "800", color: colors.text },
});
