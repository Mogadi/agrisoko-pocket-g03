import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

export type NetSnapshot = {
  online: boolean;
  label: string;
};

export function describeNet(state: NetInfoState | null): NetSnapshot {
  if (!state) {
    return { online: true, label: "Checking connection" };
  }
  const online = Boolean(state.isConnected) && state.isInternetReachable !== false;
  if (!online) {
    return { online: false, label: "Offline" };
  }
  return { online: true, label: "Online" };
}

export async function readNet(): Promise<NetSnapshot> {
  try {
    const state = await NetInfo.fetch();
    return describeNet(state);
  } catch {
    return { online: true, label: "Online" };
  }
}

export function subscribeNet(listener: (snap: NetSnapshot) => void): () => void {
  return NetInfo.addEventListener((state) => listener(describeNet(state)));
}
