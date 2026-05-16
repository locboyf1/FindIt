import { auth } from "@/configs/firebase-config";
import { DEFAULT_AVATAR } from "@/constants/user";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
    const currentUser = auth.currentUser;
    const router = useRouter();
    // const { id } = useLocalSearchParams();
    const id = 'id456';
    const [message, setMessage] = useState('');
    const [roomChat, setRoomChat] = useState<any>({
        type: 'private',
        usersIds: [auth.currentUser?.uid, id],
        usersInfos: {
            [currentUser?.uid || '']: { userName: currentUser?.displayName, userAvatar: currentUser?.photoURL },
            [id]: { userName: 'Người dùng', userAvatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8XmpOfUcrkgj2IV4xTd6KQmd8GKlBkjiN7w&s' }
        },
        secretKey: 123,
        updatedAt: serverTimestamp(),
        unreadCounts: {
            [currentUser?.uid || '']: 0,
            [id]: 0
        },
        lastMessage: null,
    });

    const [targetUser, setTargetUser] = useState<any>({
        userName: 'Người dùng',
        userAvatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8XmpOfUcrkgj2IV4xTd6KQmd8GKlBkjiN7w&s'
    });

    useEffect(() => {
        setTargetUser(roomChat.usersInfos[id]);
    }, [id, roomChat.usersInfos]);

    const handleSend = () => {
        if (!message) return;
        setMessage('');
    }
    return (
        <SafeAreaView className="flex-1">
            <View className="flex-row px-[20px] justify-between items-center border-b border-[#ccc]">
                <TouchableOpacity onPress={() => router.back()} className=" items-center">
                    <Ionicons name="arrow-back" size={26} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity className="flex-row py-[10px] px-[10px] items-center" >
                    <Image source={{ uri: targetUser.userAvatar || DEFAULT_AVATAR }} className="w-[20%] aspect-square rounded-full" />
                    <View className="flex-col px-[10px] justify-between w-100">
                        <Text className="text-[15px] font-bold text-[#333]">{targetUser.userName}</Text>
                        <Text className="text-[13px] text-[#999]">Nhấn để xem thêm</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <FlatList className="flex-1" data={[]} renderItem={() => <View />} />
            <View className="flex-row items-center justify-center gap-[10px] px-5 py-[15px] border-t border-[#eee] bg-white">
                <TextInput value={message} onChangeText={setMessage} placeholder="Nhập tin nhắn" className="flex-1 border rounded-[10px] py-[5px]" />
                <TouchableOpacity onPress={handleSend}>
                    <Ionicons name="send" className="text-[#007AFF]" size={30} color="#007AFF" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}