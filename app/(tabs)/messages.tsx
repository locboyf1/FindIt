import { ScreenWrapper } from "@/components/screen-wrapper";
import { auth } from "@/configs/firebase-config";
import { DEFAULT_AVATAR } from "@/constants/user";
import { getOtherUserInfos } from "@/services/chat-service";
import { decryptMessage, formatTime } from "@/services/utilities-service";
import { Ionicons } from "@expo/vector-icons";
import CryptoJS from 'crypto-js';
import { router } from "expo-router";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TextTicker from "react-native-text-ticker";

export default function Index() {
  const [data, setData] = useState<any[]>([]);
  const curUser = auth.currentUser;

  useEffect(() => {
    const data = [
      {
        type: 'private',
        usersIds: [auth.currentUser?.uid, 'id122'],
        usersInfos: {
          [auth.currentUser?.uid || '']: { userName: curUser?.displayName, userAvatar: curUser?.photoURL },
          ['id122']: { userName: 'Tôi là Tèo', userAvatar: 'https://haycafe.vn/wp-content/uploads/2021/11/Anh-avatar-dep-chat-lam-hinh-dai-dien.jpg' }
        },
        secretKey: '123456789',
        createdAt: Timestamp.fromDate(new Date('2023-08-01 10:20:00')),
        unreadCounts: {
          [curUser?.uid || '']: 2,
          ['id122']: 1
        },
        lastMessage: {
            text: CryptoJS.AES.encrypt('Chàoooooo, lâu rồi không gặp nha, đi uống nước k?', '123456789').toString(),
            senderId: curUser?.uid || '',
            timestamp: Timestamp.fromDate(new Date('2024-08-01 10:20:00')),
        },
      },
      {
        type: 'private',
        usersIds: [auth.currentUser?.uid, 'id123'],
        usersInfos: {
          [auth.currentUser?.uid || '']: { userName: curUser?.displayName, userAvatar: curUser?.photoURL },
          ['id123']: { userName: 'Tôi không phải Tèo', userAvatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8XmpOfUcrkgj2IV4xTd6KQmd8GKlBkjiN7w&s' }
        },
        secretKey: '12345678',
        createdAt: serverTimestamp(),
        unreadCounts: {
          [curUser?.uid || '']: 0,
          ['id123']: 0
        },
        lastMessage: {
            text: CryptoJS.AES.encrypt('Đang đâu đó?', '12345678').toString(),
            senderId: 'id123',
            timestamp: Timestamp.fromDate(new Date('2023-08-01 10:20:00')),
        },
      },
       {
        type: 'private',
        usersIds: ['id124', auth.currentUser?.uid],
        usersInfos: {
          [auth.currentUser?.uid || '']: { userName: curUser?.displayName, userAvatar: curUser?.photoURL },
          ['id124']: { userName: 'Người thứ 3', userAvatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzmWsSvz3UUR9N_2tadPlSh3l364kcIwt8xQ&s' }
        },
        secretKey: '987654321',
        createdAt: serverTimestamp(),
        unreadCounts: {
          [curUser?.uid || '']: 0,
          ['id124']: 0
        },
        lastMessage: null,
      }
    ];
    setData(data);
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
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              const otherUser = getOtherUserInfos(item.usersInfos, curUser?.uid || '')[0];
              const unreadCount = item.unreadCounts?.[curUser?.uid || ''] || 0;
              
              return (
                <View className="flex-row w-full items-center gap-2.5">
                  <View className="w-[60px] h-[60px] rounded-full overflow-hidden border border-gray-100 items-center justify-center bg-gray-50">
                    <Image 
                      source={otherUser?.userAvatar ? { uri: otherUser.userAvatar } : DEFAULT_AVATAR} 
                      className="w-full h-full rounded-full" 
                      resizeMode="cover" 
                    />
                  </View>
                  <TouchableOpacity onPress={() => { router.push({ pathname: '/chat/chat', params: { id: getOtherUserInfos(item.usersInfos, curUser?.uid || '')[0].userId } }) }} className="flex-1 gap-[5px]">
                    <View className="flex-row items-center gap-[5px] justify-between">
                      <View className="flex-row items-center flex-1 py-[2px]" >
                        <Text className="font-[Nunito-Bold] text-[16px]">{otherUser?.userName || 'Người dùng'}</Text>
                         {unreadCount > 0 && (
                          <View className="items-center ml-[5px]">
                            <View className="py-[2px] px-[8px] min-w-[20px] rounded-full bg-[#1F8CF9] items-center justify-center">
                              <Text className="font-[Nunito-Bold] text-[10px] color-white">{unreadCount}</Text>
                            </View>
                          </View>
                        )}
                      </View>
                      <View className="flex-row items-center gap-[5px]">
                        <Text className="font-[Nunito-Regular] text-[12px]">{item.lastMessage ? formatTime(item.lastMessage.timestamp): ''}</Text>

                      </View>
                    </View>
                    <View className="flex-row items-center gap-[5px] w-full justify-between">
                      <View className="flex-1">
                        <TextTicker duration={10000} className={ 'font-[Nunito-Regular] text-[14px] ' + (item.unreadCounts[curUser?.uid || ''] > 0 ? 'font-bold text-[#3d3d3d]' : 'text-[#666]')}>
                          {item.lastMessage ? decryptMessage(item.lastMessage?.text, item.secretKey) : 'Chưa có tin nhắn'}
                        </TextTicker>
                      </View>
                      <Ionicons name="chatbox-outline" size={20} color="#999" />
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>
      </ScreenWrapper>
    </SafeAreaView>
  )
}