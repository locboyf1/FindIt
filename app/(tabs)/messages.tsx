import { ScreenWrapper } from "@/components/screen-wrapper";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TextTicker from "react-native-text-ticker";

export default function Index() {
  const [mockData, setMockData] = useState<any[]>([]);

  useEffect(() => {
    const data = [
      {
        id: 1,
        title: 'Người dùng 1',
        time: '10:20 AM',
        image: 'https://haycafe.vn/wp-content/uploads/2021/11/Anh-avatar-dep-chat-lam-hinh-dai-dien.jpg',
        last_message: 'Xin chào',
        number_unread_message: 3,
      },
      {
        id: 2,
        title: 'Người dùng 2',
        time: '10:20 AM',
        image: 'https://haycafe.vn/wp-content/uploads/2021/11/Anh-avatar-dep-chat-lam-hinh-dai-dien.jpg',
        last_message: 'Bạn khỏe không',
        number_unread_message: 0,
      },
      {
        id: 3,
        title: 'Người dùng 3',
        time: '10:20 AM',
        image: 'https://haycafe.vn/wp-content/uploads/2021/11/Anh-avatar-dep-chat-lam-hinh-dai-dien.jpg',
        last_message: 'Tôi sẽ đến ngay, hãy đợiiiii tôi một chút, một chút thôi, ahúdoă ăđăp ặihkbadư pagahpod ădgiyadưi audưbj ',
        number_unread_message: 10,
      },
    ];
    setMockData(data);
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <ScreenWrapper>
        <View className="flex-row justify-between items-center py-5 px-5 border-b border-[#ccc]">
          <Text className="text-center font-[Nunito-Bold] text-[30px]">Tin nhắn</Text>
          <View className="flex-row gap-[15px]">
            <TouchableOpacity>
              <Ionicons name="search-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="add-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-1 px-5 py-5">
          <FlatList contentContainerStyle={{ gap: 20 }}
            data={mockData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View className="flex-row w-full items-center gap-2.5">
                <View className="w-[60px] h-[60px] rounded-full overflow-hidden border border-black items-center justify-center">
                  <Image source={{ uri: item.image }} className="w-full h-full rounded-full" resizeMode="cover" />
                </View>
                <View className="flex-1 gap-[5px]">
                  <View className="flex-row items-center gap-[5px] justify-between">
                    <TouchableOpacity className="flex-1" onPress={()=>{router.push({pathname: '/chat/chat', params: {id: 1}})}}>
                      <Text className="font-[Nunito-Bold] text-[16px]">{item.title}</Text>
                    </TouchableOpacity>
                    <View className="flex-row items-center gap-[5px]">
                      <Text className="font-[Nunito-Regular] text-[12px]">{item.time}</Text>
                      <View className="items-center gap-[5px]">
                        <View className="py-[5px] w-10 rounded-[25px] bg-[#1F8CF9] items-center justify-center">
                          <Text className="font-[Nunito-Bold] text-[10px] color-white">{item.number_unread_message}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-[5px] w-full justify-between">
                    <View className="flex-1">
                      <TextTicker duration={10000} style={{ fontFamily: 'Nunito-Regular', fontSize: 14, color: '#666' }}>{item.last_message}</TextTicker>
                    </View>
                    <Ionicons name="chatbox-outline" size={24} color="black" />
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      </ScreenWrapper>
    </SafeAreaView>
  )
}