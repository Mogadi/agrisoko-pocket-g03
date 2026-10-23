import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";

import { AboutScreen } from "../screens/AboutScreen";
import { AskScreen } from "../screens/AskScreen";
import { DirectoryScreen } from "../screens/DirectoryScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ResultScreen } from "../screens/ResultScreen";
import { colors } from "../theme/theme";
import type { RootStackParamList, RootTabParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<RootTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    primary: colors.primary,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 10, fontWeight: "800", color: focused ? colors.primary : colors.muted }}>
      {label}
    </Text>
  );
}

function TabNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon label="HOME" focused={focused} />,
          tabBarAccessibilityLabel: "Project home",
        }}
      />
      <Tabs.Screen
        name="AskTab"
        component={AskScreen}
        options={{
          title: "Ask",
          tabBarIcon: ({ focused }) => <TabIcon label="ASK" focused={focused} />,
          tabBarAccessibilityLabel: "Ask the team",
        }}
      />
      <Tabs.Screen
        name="DirectoryTab"
        component={DirectoryScreen}
        options={{
          title: "Team",
          tabBarIcon: ({ focused }) => <TabIcon label="TEAM" focused={focused} />,
          tabBarAccessibilityLabel: "Member directory",
        }}
      />
      <Tabs.Screen
        name="AboutTab"
        component={AboutScreen}
        options={{
          title: "About",
          tabBarIcon: ({ focused }) => <TabIcon label="INFO" focused={focused} />,
          tabBarAccessibilityLabel: "About and evidence",
        }}
      />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primaryDark,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ title: "AI result" }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Member profile" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
