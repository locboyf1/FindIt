import { Colors } from "@/constants/theme";
import { DEFAULT_AVATAR } from "@/constants/user";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

export type Post = {
    id: string;
    title: string;
    type: 'lost' | 'found';
    location: string;
    time: string;
    image: string;
    userId: string;
    userName?: string;
    userAvatar?: string;
}

export default function PostCard({ item, onPress }: { item: Post, onPress: () => void }) {

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
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} className="bg-white rounded-[16px] mb-5 shadow-sm elevation-3 border border-[#F0F0F0] overflow-hidden h-[300px]">
            <View className="w-full h-[60%] relative">
                <Image source={{ uri: item.image }} className="w-full h-full" />
                <View className="absolute bottom-2.5 left-2.5 p-[5px] border border-[#ccc] rounded-[10px]" style={{ backgroundColor: getStatusColor(item.type) }}>
                    <Text className="text-white font-bold">{getStatusLabel(item.type)}</Text>
                </View>
                <View className="p-4 flex-row justify-between">
                    <View className="flex-1">
                        <Text className="text-[18px] font-bold text-[#07090aff] mb-2 font-[Nunito-Bold]">{item.title}</Text>
                        <View className="flex-row items-center mb-[6px] gap-[5px]">
                            <Ionicons name="location" size={14} color="#333" />
                            <Text className="text-sm text-[#666] flex-1 font-[Nunito-Regular]">{item.location}</Text>
                        </View>
                        <View className="flex-row items-center mb-[6px] gap-[5px]">
                            <Ionicons name="time" size={14} color="#333" />
                            <Text className="text-sm text-[#666] flex-1 font-[Nunito-Regular]">{item.time}</Text>
                        </View>
                    </View>
                    <View className="w-auto flex-col items-center gap-[5px]">
                        <Image source={item.userAvatar ? { uri: item.userAvatar } : DEFAULT_AVATAR} className="w-[50px] h-[50px] rounded-full border border-[#ccc]" resizeMode="contain" />
                        <Text className="text-[13px] text-[#666] font-[Nunito-Bold]">{item.userName}</Text>
                    </View>
                </View>

            </View>

        </TouchableOpacity>
    );
}

