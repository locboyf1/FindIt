import { Tabs } from 'expo-router';
import React from 'react';

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, View } from 'react-native';

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
            <View style={styles.numberContainer}>
              <Text style={styles.numberText}>10</Text>
            </View>
          </View>
        )
      }} />

      <Tabs.Screen name="messages" options={{
        title: 'Tin nhắn',
        tabBarIcon: ({ color, focused }) => (
          <View>
            <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} size={26} color={color} />
            <View style={styles.numberContainer}>
              <Text style={styles.numberText}>99</Text>
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
const styles = StyleSheet.create({
  numberContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white'
  },
  numberText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
})