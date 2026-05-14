import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';

export const ScreenWrapper = ({ children }: { children: React.ReactNode }) => {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={{ flex: 1, paddingBottom: tabBarHeight }}>
      {children}
    </View>
  );
};