import LoadingOverlay from "@/components/loading-layout";
import { auth } from "@/configs/firebase-config";
import { EMPTY_POST } from "@/constants/post";
import { Colors } from "@/constants/theme";
import { DEFAULT_AVATAR } from "@/constants/user";
import { getPostById } from "@/services/post-service";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailPostScreen() {
    const { id } = useLocalSearchParams();
    const [post, setPost] = useState<any>(EMPTY_POST);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getPost(id as string);
        }
        else {
            Alert.alert('Lỗi', 'Có gì đó không đúng');
            router.back();
        }
    }, [id])

    const getPost = async (postId: string) => {
        setIsLoading(true);
        try {
            const data = await getPostById(postId);
            if (data) {
                setPost(data);
            } else {
                Alert.alert('Lỗi', 'Không tìm thấy bài viết');
                router.back();
            }
        } catch (error) {
            console.error('Lỗi lúc lấy bài viết: ' + error);
            Alert.alert('Lỗi', 'Không tìm thấy bài viết');
            router.back();
        } finally {
            setIsLoading(false);
        }
    }

    const getStatusColor = (type: string) => {
        switch (type) {
            case 'lost': return '#fa675fff';
            case 'found': return '#3293fbff';
            case 'resolved': return Colors.light.success;
            case 'returned': return Colors.light.success;
            default: return Colors.light.tint;
        }
    };

    const getStatusLabel = (type: string) => {
        switch (type) {
            case 'lost': return 'Mất đồ';
            case 'found': return 'Tìm thấy';
            case 'resolved': return 'Đã giải quyết';
            case 'returned': return 'Đã trả lại';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row justify-between items-center px-5 py-[15px] border-b border-[#eee] bg-white">
                <TouchableOpacity onPress={() => router.back()} className="w-[60px] items-center">
                    <Ionicons name="arrow-back" size={26} color="#333" />
                </TouchableOpacity>
                <Text className="text-[18px] font-bold text-[#333]">Chi tiết bài viết</Text>
                {post.userId == auth.currentUser?.uid ? (
                    <TouchableOpacity onPress={() => { router.push({ pathname: '/post/update-post', params: { id: post.id } }) }} disabled={isLoading} className="w-[60px] items-center">
                        <Text className="text-base font-bold text-[#007AFF]">Sửa</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => { Alert.alert('Thông báo', 'Chức năng chưa thêm') }} disabled={isLoading} className="w-[60px] items-center">
                        <Text className="text-base font-bold text-[#007AFF]">Báo cáo</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false} className="flex-1">
                <Image source={{ uri: post.image }} className="w-full h-[350px]" resizeMode="cover" />

                <View className="flex-1 bg-white rounded-t-[30px] -mt-[30px] p-5">

                    <View className="flex-row justify-between items-center mb-[15px]">
                        <View className="px-3 py-[6px] rounded-lg" style={{ backgroundColor: getStatusColor(post.type) }}>
                            <Text className="text-white font-bold text-[12px]">{getStatusLabel(post.type)}</Text>
                        </View>
                        <Text className="text-[#888] text-sm">{post.time}</Text>
                    </View>

                    <Text className="text-2xl font-bold text-[#222] mb-5 leading-8">{post.title}</Text>

                    <View className="flex-row items-center mb-[15px]">
                        <View className="w-10 h-10 rounded-[10px] bg-[#f0f9ff] justify-center items-center mr-[15px]">
                            <Ionicons name="location" size={20} color={Colors.light.tint} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[12px] text-[#888] mb-[2px]">Địa điểm</Text>
                            <Text className="text-[15px] text-[#333] font-medium">
                                {post.location}
                                {post.wardName ? ', ' + post.wardName : ''}
                                {post.provinceName ? ', ' + post.provinceName : ''}
                            </Text>
                        </View>
                    </View>

                    <View className="h-px bg-[#eee] my-5" />

                    <View className="flex-row items-center w-full">
                        <TouchableOpacity className="flex-1 flex-row items-center" onPress={()=>{router.push({pathname: '/user/user', params: {id: post.userId}})}}>
                            <Image
                                source={post.userAvatar ? { uri: post.userAvatar } : DEFAULT_AVATAR}
                                className="w-[50px] h-[50px] rounded-full mr-[15px]"
                            />
                            <View className="flex-1">
                                <Text className="text-base font-bold text-[#333]">{post.userName || 'Người dùng'}</Text>
                                <Text className="text-[13px] text-[#888] mt-[2px]">Người đăng bài</Text>
                            </View>
                        </TouchableOpacity>
                        {post.userId != auth.currentUser?.uid && (
                            <TouchableOpacity className="flex-row items-center bg-[#007AFF] px-[15px] py-2.5 rounded-[20px] gap-[5px]" disabled={isLoading} onPress={() => { Alert.alert('Thông báo', 'Tính năng chưa thêm') }}>
                                <Ionicons name="chatbubble-ellipses" size={18} color={'#fff'} />
                                <Text className="text-white font-bold text-sm">Liên hệ</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="h-px bg-[#eee] my-5" />

                    <Text className="text-[18px] font-bold text-[#333] mb-2.5">Mô tả chi tiết</Text>
                    <Text className="text-[15px] text-[#555] leading-6">
                        {post.description || 'Không có mô tả chi tiết cho bài viết này.'}
                    </Text>

                    {post.geo && (
                        <View className="mt-[25px]">
                            <Text className="text-[18px] font-bold text-[#333] mb-2.5">Vị trí trên bản đồ</Text>
                            <View className="w-full h-[200px] rounded-[15px] overflow-hidden border border-[#eee]">
                                <MapView
                                    className="w-full h-full"
                                    initialRegion={{
                                        latitude: post.geo.lat,
                                        longitude: post.geo.lng,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                    scrollEnabled={false}
                                >
                                    <Marker
                                        coordinate={{ latitude: post.geo.lat, longitude: post.geo.lng }}
                                        title="Vị trí vật phẩm" />

                                </MapView>

                            </View>
                        </View>
                    )}

                </View>
            </ScrollView>
            <LoadingOverlay isLoading={isLoading} />
        </SafeAreaView>
    )
}


