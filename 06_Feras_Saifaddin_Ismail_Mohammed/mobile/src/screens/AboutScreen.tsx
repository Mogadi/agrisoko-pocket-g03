import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { GROUP } from "../constants/group";
import { fetchHealth, fetchModelInfo } from "../services/api";
import { getApiUrl, setApiUrl } from "../services/cache";
import { colors, radius, space, type } from "../theme/theme";
import type { HealthResponse, ModelInfo } from "../types";

export function AboutScreen() {
  const [apiUrl, setUrl] = useState(GROUP.defaultApiUrl);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [model, setModel] = useState<ModelInfo | null>(null);
  const [apiStatus, setApiStatus] = useState("Not checked yet");

  useEffect(() => {
    getApiUrl(GROUP.defaultApiUrl).then(setUrl);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [h, m] = await Promise.all([fetchHealth(), fetchModelInfo()]);
      setHealth(h);
      setModel(m);
      setApiStatus(`Reachable · ${h.status} · ${h.memberCount} members`);
    } catch (error) {
      setHealth(null);
      setModel(null);
      setApiStatus(error instanceof Error ? error.message : "Unavailable");
    }
  }, []);

  async function saveUrl() {
    await setApiUrl(apiUrl);
    Alert.alert("Saved", "The API base URL is stored on this device.");
    refresh();
  }

  return (
    <Screen>
      <Text style={type.title} accessibilityRole="header">
        About and evidence
      </Text>
      <Text style={type.body}>
        {GROUP.appName} identifies a group member from a natural-language question and returns only
        approved profile fields. The matcher is TF-IDF with cosine similarity, not a chatbot.
      </Text>

      <View style={styles.card}>
        <Text style={type.label}>GROUP</Text>
        <Text style={type.body}>
          {GROUP.code} · {GROUP.verificationCode} · APK {GROUP.version}
        </Text>
        <Text style={type.muted}>{GROUP.packageName}</Text>
      </View>

      <View style={styles.card}>
        <Text style={type.label}>API BASE URL</Text>
        <TextInput
          value={apiUrl}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="API base URL"
          style={styles.input}
        />
        <PrimaryButton label="Save URL and check status" onPress={saveUrl} />
        <Text style={type.muted}>{apiStatus}</Text>
      </View>

      {health ? (
        <View style={styles.card}>
          <Text style={type.label}>API STATUS</Text>
          <Text style={type.body}>
            {health.status} · service {health.version} · model {health.modelVersion}
          </Text>
        </View>
      ) : null}

      {model ? (
        <View style={styles.card}>
          <Text style={type.label}>MODEL</Text>
          <Text style={type.body}>{model.vectorizerType}</Text>
          <Text style={type.muted}>
            Threshold {model.threshold} · exact boost {model.exactBoost} · fingerprint{" "}
            {model.datasetFingerprint}
          </Text>
          {model.evaluation?.top1Accuracy != null ? (
            <Text style={type.muted}>
              Evaluation top-1 {model.evaluation.top1Accuracy} · no-match rejection{" "}
              {model.evaluation.noMatchRejectionAccuracy}
            </Text>
          ) : (
            <Text style={type.muted}>Run python build_index.py to publish evaluation numbers.</Text>
          )}
          <Text style={[type.label, { marginTop: 8 }]}>LIMITATIONS</Text>
          {model.limitations.map((item) => (
            <Text key={item} style={type.muted}>
              • {item}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={type.label}>DATA SOURCE</Text>
        <Text style={type.body}>
          Version-controlled ai-api/data/members.json, bundled on the phone for offline name,
          nickname and role lookup.
        </Text>
      </View>

      <PrimaryButton
        label="Open GitHub repository"
        onPress={() => Linking.openURL(GROUP.repositoryUrl).catch(() => Alert.alert("Link unavailable"))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.bg,
  },
});
