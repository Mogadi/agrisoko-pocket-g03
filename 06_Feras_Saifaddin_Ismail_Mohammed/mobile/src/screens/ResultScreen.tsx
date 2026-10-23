import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { ConfidenceBar } from "../components/ConfidenceBar";
import { ErrorRetry } from "../components/ErrorRetry";
import { Screen } from "../components/Screen";
import { SourceBadge } from "../components/SourceBadge";
import { runAsk } from "../services/askPipeline";
import { readLastAsk } from "../services/cache";
import { colors, radius, space, type } from "../theme/theme";
import type { AskViewState, RootStackParamList } from "../types";

export function ResultScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Result">>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const query = route.params?.query || "";
  const [state, setState] = useState<AskViewState>({ status: "loading" });
  const [lastKept, setLastKept] = useState<string | null>(null);

  const run = useCallback(async () => {
    setState({ status: "loading" });
    const previous = await readLastAsk();
    if (previous?.introduction) {
      setLastKept(previous.introduction);
    }
    const { state: next, validationError } = await runAsk(query);
    if (validationError) {
      setState({ status: "server-error", message: validationError });
      return;
    }
    setState(next);
  }, [query]);

  useEffect(() => {
    run();
  }, [run]);

  return (
    <Screen>
      <Text style={type.label}>QUESTION</Text>
      <Text style={type.heading}>{query || "No question"}</Text>

      {state.status === "loading" ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={type.muted}>Matching against approved member profiles…</Text>
        </View>
      ) : null}

      {state.status === "timeout" || state.status === "server-error" ? (
        <ErrorRetry
          title={state.status === "timeout" ? "Timed out" : "Server unavailable"}
          message={state.message}
          onRetry={run}
        />
      ) : null}

      {lastKept && (state.status === "timeout" || state.status === "server-error") ? (
        <View style={styles.card}>
          <Text style={type.label}>LAST USEFUL RESULT KEPT</Text>
          <Text style={type.body}>{lastKept}</Text>
        </View>
      ) : null}

      {state.status === "no-match" ? (
        <View style={styles.card}>
          <SourceBadge source={state.source} />
          <Text style={styles.warnTitle}>No confident match</Text>
          <Text style={type.body}>{state.data.reason}</Text>
          <Text style={[type.label, { marginTop: 8 }]}>TRY A NAME, ROLE OR FEATURE</Text>
          {state.data.suggestions.map((item) => (
            <Pressable
              key={item}
              onPress={() => navigation.push("Result", { query: item })}
              accessibilityRole="button"
              accessibilityLabel={`Ask about ${item}`}
              style={styles.suggestion}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {state.status === "success" && state.data.match ? (
        <View style={styles.card}>
          <SourceBadge source={state.source} />
          <Text style={type.heading}>{state.data.match.fullName}</Text>
          <Text style={styles.role}>{state.data.match.role}</Text>
          <ConfidenceBar value={state.data.confidence} />
          <Text style={type.label}>WHY THIS MATCH</Text>
          <Text style={type.body}>{state.data.reason}</Text>
          <Text style={type.label}>INTRODUCTION</Text>
          <Text style={type.body}>{state.data.introduction}</Text>
          <Pressable
            onPress={() =>
              navigation.navigate("Profile", {
                memberId: state.data.match!.id,
                source: state.source,
              })
            }
            style={styles.profileBtn}
            accessibilityRole="button"
            accessibilityLabel={`Open profile for ${state.data.match.fullName}`}
          >
            <Text style={styles.profileBtnText}>Open full profile and evidence</Text>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", gap: 12, paddingVertical: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  role: { color: colors.primary, fontWeight: "700" },
  warnTitle: { color: colors.warning, fontWeight: "800", fontSize: 18 },
  suggestion: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: { color: colors.primaryDark, fontWeight: "600" },
  profileBtn: {
    backgroundColor: colors.primarySoft,
    padding: 12,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  profileBtnText: { color: colors.primaryDark, fontWeight: "800" },
});
