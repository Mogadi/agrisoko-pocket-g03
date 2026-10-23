import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { GROUP } from "../constants/group";
import { validateQuestion } from "../services/validation";
import { colors, radius, space, type } from "../theme/theme";
import type { RootStackParamList } from "../types";

const EXAMPLES = [
  "Tell me about Osama",
  "Who built offline mode?",
  "Who is the AI engineer?",
  "Who configured the APK?",
  "Who made the FastAPI service?",
];

export function AskScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(next = query) {
    const problem = validateQuestion(next);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    navigation.navigate("Result", { query: next.trim() });
  }

  return (
    <Screen>
      <Text style={type.title} accessibilityRole="header">
        Ask the team
      </Text>
      <Text style={type.muted}>
        Use a natural question. The service matches approved profiles with TF-IDF. It will not invent
        a metric or a quote.
      </Text>
      <TextInput
        value={query}
        onChangeText={(value) => {
          setQuery(value);
          if (error) setError(null);
        }}
        placeholder="Who built offline mode?"
        placeholderTextColor={colors.muted}
        multiline
        maxLength={GROUP.maxQueryLength + 20}
        accessibilityLabel="Question about a team member"
        style={styles.input}
      />
      <Text style={styles.counter}>
        {query.trim().length}/{GROUP.maxQueryLength}
      </Text>
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <PrimaryButton label="Find the member" onPress={() => submit()} />
      <Text style={type.label}>TRY THESE</Text>
      <View style={styles.chips}>
        {EXAMPLES.map((example) => (
          <Pressable
            key={example}
            onPress={() => {
              setQuery(example);
              submit(example);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Use example: ${example}`}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{example}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 120,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: "top",
  },
  counter: { alignSelf: "flex-end", color: colors.muted, fontSize: 12 },
  error: { color: colors.danger, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: { color: colors.primaryDark, fontWeight: "600" },
});
