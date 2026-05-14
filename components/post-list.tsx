import { Colors } from "@/constants/theme";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export type Post = {
    id: string;
    title: string;
    type: 'lost' | 'found';
    location: string;
    time: string;
    image: string;
    isHidden: boolean;
    isBanned: boolean;
    status: 'open' | 'resolved';
    userName?: string;
    userAvatar?: string;
}

export default function PostList({ item, isOwner, onPress }: { item: Post, isOwner: boolean, onPress: () => void }) {

    const getStatusColor = (type: string) => {
        switch (type) {
            case 'lost': return '#fa675fff';
            case 'found': return '#3293fbff';
            default: return Colors.light.tint;
        }
    };

    const getStatusLabel = (type: string) => {
        switch (type) {
            case 'lost': return 'Mất đồ';
            case 'found': return 'Tìm thấy';
            default: return type.toUpperCase();
        }
    };
    return (
      <TouchableOpacity 
            className="bg-white mb-3 mx-4 rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
            onPress={() => router.push({ pathname: '/post/detail-post', params: { id: item.id } })}
        >
            <View className="flex-row p-3">
                <Image 
                    source={{ uri: item.image }} 
                    className="w-24 h-24 rounded-xl bg-gray-100"
                />
                <View className="flex-1 ml-3 justify-between py-1">
                    <View>
                        <View className="flex-row justify-between items-start">
                            <View className={`px-2 py-0.5 rounded-md ${item.type === 'lost' ? 'bg-red-50' : 'bg-blue-50'}`}>
                                <Text className={`text-[10px] font-bold ${item.type === 'lost' ? 'text-red-500' : 'text-blue-500'}`}>
                                    {item.type === 'lost' ? 'MẤT ĐỒ' : 'NHẶT ĐƯỢC'}
                                </Text>
                            </View>
                            {item.status === 'resolved' && (
                                <AntDesign name="check-circle" size={14} color="#34C759" />
                            )}
                        </View>
                        <Text className="text-base font-bold text-gray-800 mt-1" numberOfLines={1}>
                            {item.title}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="location-outline" size={12} color="#666" />
                            <Text className="text-xs text-gray-500 ml-1" numberOfLines={1}>{item.location}</Text>
                        </View>
                    </View>
                    <Text className="text-[10px] text-gray-400 italic">{item.time}</Text>
                </View>
            </View>
            {item.isHidden && isOwner && (
                <View className="bg-gray-50 py-1.5 px-3 flex-row items-center border-t border-gray-50">
                    <Ionicons name="eye-off" size={12} color="#999" />
                    <Text className="text-[10px] text-gray-500 ml-1 italic">Bài viết này đang ẩn với mọi người</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}


