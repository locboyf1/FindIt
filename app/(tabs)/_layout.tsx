import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text, View } from 'react-native';
import 'react-native-get-random-values';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 65 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10 + insets.bottom,
          paddingTop: 10,
          backgroundColor: Colors.light.background,
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          fontFamily: Platform.select({ ios: 'Nunito-Bold', android: 'sans-serif-medium' })
        },
        
      }}>
      <Tabs.Screen name="index" options={{
        title: 'Trang chủ',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'home' : 'home-outline'} size={26} color={color} />
        )
      }} />

      <Tabs.Screen name="alerts" options={{
        title: 'Thông báo',
        tabBarIcon: ({ color, focused }) => (
          <View>
            <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={26} color={color} />
            <View className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-600 justify-center items-center border border-white">
              <Text className="text-white text-[9px] font-bold">10</Text>
            </View>
          </View>
        )
      }} />

      <Tabs.Screen name="messages" options={{
        title: 'Tin nhắn',
        tabBarIcon: ({ color, focused }) => (
          <View>
            <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} size={26} color={color} />
            <View className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-600 justify-center items-center border border-white">
              <Text className="text-white text-[9px] font-bold">99</Text>
            </View>
          </View>
        )
      }} />

      <Tabs.Screen name="community" options={{
        title: 'Cộng đồng',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'people' : 'people-outline'} size={26} color={color} />
        )
      }} />
    </Tabs>

  );
}
