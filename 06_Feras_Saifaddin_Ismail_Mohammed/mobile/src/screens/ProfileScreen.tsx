import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../components/Screen";
import { SourceBadge } from "../components/SourceBadge";
import { loadProfile } from "../services/askPipeline";
import { colors, radius, space, type } from "../theme/theme";
import type { MemberProfile, RootStackParamList, SourceKind } from "../types";

const LINK_LABELS: Record<string, string> = {
  repository: "Repository",
  issue: "Owned issue",
  branch: "Feature branch",
  pullRequest: "Pull request",
  commit: "Commits",
};

async function openUrl(url?: string | null) {
  if (!url) {
    Alert.alert("Link unavailable", "This evidence URL is not set yet.");
    return;
  }
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert("Cannot open link", url);
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert("Cannot open link", "The device refused this URL.");
  }
}

export function ProfileScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Profile">>();
  const { memberId, source: incoming } = route.params;
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [source, setSource] = useState<SourceKind>(incoming || "cached");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    loadProfile(memberId).then((result) => {
      if (!result) {
        setMissing(true);
        return;
      }
      setProfile(result.profile);
      setSource(result.source);
    });
  }, [memberId]);

  if (missing) {
    return (
      <Screen>
        <Text style={type.heading}>Member not found</Text>
        <Text style={type.body}>No approved profile is stored for {memberId}.</Text>
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  const links = profile.evidenceLinks || {};

  return (
    <Screen>
      <SourceBadge source={source} />
      <Text style={type.title} accessibilityRole="header">
        {profile.fullName}
      </Text>
      <Text style={styles.role}>{profile.role}</Text>
      <Text style={type.muted}>
        {profile.registrationNumber}
        {profile.githubUsername ? ` · @${profile.githubUsername}` : ""}
      </Text>
      <Text style={type.muted}>Also known as: {(profile.aliases || []).join(", ")}</Text>

      <Section title="Introduction" body={profile.introductionDraft} />
      <Section title="Target user" body={profile.targetUser} />
      <Section title="Problem" body={profile.problem} />
      <Section title="Owned contribution" body={profile.contribution} />
      <Section title="Feature" body={profile.feature || ""} />
      <Section title="Measured evidence" body={profile.outcomeMetric} />
      <Section title="Skills" body={(profile.skills || []).join(" · ")} />
      <Section title="Tester feedback" body={profile.testerFeedback} />

      <Text style={type.label}>REPOSITORY EVIDENCE</Text>
      {Object.entries(LINK_LABELS).map(([key, label]) => (
        <Pressable
          key={key}
          onPress={() => openUrl(links[key as keyof typeof links])}
          accessibilityRole="link"
          accessibilityLabel={label}
          style={styles.link}
        >
          <Text style={styles.linkLabel}>{label}</Text>
          <Text style={styles.linkUrl} numberOfLines={1}>
            {links[key as keyof typeof links] || "Not available"}
          </Text>
        </Pressable>
      ))}
    </Screen>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <View style={styles.section}>
      <Text style={type.label}>{title.toUpperCase()}</Text>
      <Text style={type.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  role: { color: colors.primary, fontWeight: "800", fontSize: 16 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  link: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: space.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkLabel: { fontWeight: "700", color: colors.primaryDark },
  linkUrl: { color: colors.muted, fontSize: 12 },
});
