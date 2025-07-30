import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1763a6',
        tabBarInactiveTintColor: '#b0b0b0',
        headerShown: false,
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="home-outline" size={26} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          title: '报名',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="document-text-outline" size={26} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="gift"
        options={{
          title: '礼品兑换',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="gift-outline" size={26} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '个人中心',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="person-outline" size={26} color={color} />, 
        }}
      />
    </Tabs>
  );
}
