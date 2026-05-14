import { ScreenWrapper } from "@/components/screen-wrapper";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TextTicker from 'react-native-text-ticker';

export default function Index() {
  const [mockData, setMockData] = useState<any[]>([]);

  useEffect(() => {
    const data = [
      {
        id: 1,
        title: 'Bài viết 1 asds asdawd ads awdaw asdwa awdaw adwad awddawd awdadw ',
        time: '10 phút trước',
        image: 'https://haycafe.vn/wp-content/uploads/2021/11/Anh-avatar-dep-chat-lam-hinh-dai-dien.jpg',
      },
      {
        id: 2,
        title: 'Bài viết 2',
        time: '10 phút trước',
        image: null,
      },
      {
        id: 3,
        title: 'Bài viết 3',
        time: '10 phút trước',
        image: 'https://haycafe.vn/wp-content/uploads/2021/11/Anh-avatar-dep-chat-lam-hinh-dai-dien.jpg',
      },
    ];
    setMockData(data);
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <ScreenWrapper>
        <View className="flex-row justify-between items-center py-5 px-5 border-b border-[#ccc]">
          <Text className="text-center font-[Nunito-Bold] text-[30px]">Thông báo</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 px-5 py-5">
          <FlatList contentContainerStyle={{ gap: 20 }}
            data={mockData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View className="flex-row items-center gap-2.5">
                <View className="w-[60px] h-[60px] p-[5px] rounded-full overflow-hidden border border-black items-center justify-center">
                  {item.image ? <Image source={{ uri: item.image }} className="w-full h-full rounded-full" resizeMode="cover" /> : <Ionicons name="notifications-outline" size={24} color="black" />}
                </View>
                <View className="flex-1 gap-[5px]">
                  <View className="flex-row items-center gap-[5px] justify-between">
                    <TouchableOpacity className="flex-1">
                      <TextTicker style={{ fontFamily: 'Nunito-Bold', fontSize: 16 }} duration={10000}>{item.title}</TextTicker>
                    </TouchableOpacity>
                    <TouchableOpacity className="w-5 h-5 items-center justify-center">
                      <Ionicons name="ellipsis-vertical-outline" size={20} color="black" />
                    </TouchableOpacity>
                  </View>
                  <Text className="font-[Nunito-Regular] text-[12px]">{item.time}</Text>
                </View>
              </View>
            )}
          />
        </View>
      </ScreenWrapper>
    </SafeAreaView>
  )
}