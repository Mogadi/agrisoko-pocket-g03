import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";

import { MemberCard } from "../components/MemberCard";
import { Screen } from "../components/Screen";
import { SourceBadge } from "../components/SourceBadge";
import { loadDirectory } from "../services/askPipeline";
import { type } from "../theme/theme";
import type { MemberProfile, RootStackParamList, SourceKind } from "../types";

export function DirectoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [source, setSource] = useState<SourceKind>("offline");

  const load = useCallback(async () => {
    const result = await loadDirectory();
    setMembers(result.members);
    setSource(result.source);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen>
      <Text style={type.title} accessibilityRole="header">
        Member directory
      </Text>
      <Text style={type.muted}>
        Open a profile without using AI search. Six members, one product, individual evidence.
      </Text>
      <SourceBadge source={source} />
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          onPress={() => navigation.navigate("Profile", { memberId: member.id, source })}
        />
      ))}
    </Screen>
  );
}
