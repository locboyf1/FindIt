import { Colors } from '@/constants/theme';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export default function LoadingOverlay({ isLoading, message = "Đang tải..." }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <View className="absolute inset-0 z-50 flex-1 w-full h-full justify-center items-center bg-white/80">
      <View className="p-10 rounded-2xl bg-white items-center shadow-lg border border-gray-100">
        <ActivityIndicator size="large" color={Colors.light.tint} />
        {message && (
          <Text className="mt-4 text-gray-500 font-medium text-base">
            {message}
          </Text>
        )}
      </View>
    </View>
  );
}