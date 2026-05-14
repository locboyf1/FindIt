import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LoadingOverlay from "@/components/loading-layout";
import { auth } from "@/configs/firebase-config";
import { Colors } from "@/constants/theme";
import { DEFAULT_AVATAR } from "@/constants/user";
import { getPostsByUserId } from "@/services/post-service";

const { width } = Dimensions.get('window');

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const currentUserId = auth.currentUser?.uid;
    const isOwner = id === currentUserId;

    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const userDisplay = {
        name: posts.length > 0 ? posts[0].userName : (isOwner ? auth.currentUser?.displayName : 'Người dùng'),
        avatar: posts.length > 0 ? posts[0].userAvatar : (isOwner ? auth.currentUser?.photoURL : null),
    };

    useEffect(() => {
        if (id) {
            fetchUserPosts();
        }
    }, [id]);

    const fetchUserPosts = async () => {
        setIsLoading(true);
        try {
            const data = await getPostsByUserId(id as string);
            setPosts(data);
        } catch (error) {
            console.error("Lỗi khi tải bài đăng của user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = () => {
        setIsLoading(true);
        fetchUserPosts();
        setIsLoading(false);
    };

    const renderPostItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            className="bg-white mb-3 mx-4 rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
            onPress={() => router.push({ pathname: '/post/detail-post', params: { id: item.id } })}
        >
            <View className="flex-row p-3">
                <Image 
                    source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
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

    const renderHeader = () => (
        <View className="items-center py-8 bg-white border-b border-gray-100 mb-4">
            <View className="relative">
                <Image 
                    source={userDisplay.avatar ? { uri: userDisplay.avatar } : DEFAULT_AVATAR}
                    className="w-24 h-24 rounded-full border-4 border-gray-50 bg-gray-200"
                />
                {isOwner && (
                    <TouchableOpacity 
                        className="absolute bottom-0 right-0 bg-[#007AFF] p-2 rounded-full border-2 border-white shadow-sm"
                        onPress={() => router.push('/settings/setting_account')}
                    >
                        <Ionicons name="pencil" size={14} color="white" />
                    </TouchableOpacity>
                )}
            </View>
            
            <Text className="text-xl font-bold mt-4 text-gray-800">{userDisplay.name}</Text>
            <Text className="text-gray-500 text-sm">{isOwner ? 'Trang cá nhân của bạn' : 'Người dùng FindIt'}</Text>

            <View className="flex-row mt-6 w-full px-10 justify-around">
                <View className="items-center">
                    <Text className="text-lg font-bold text-gray-800">{posts.length}</Text>
                    <Text className="text-xs text-gray-400">Bài đăng</Text>
                </View>
                <View className="w-[1px] h-8 bg-gray-100" />
                <View className="items-center">
                    <Text className="text-lg font-bold text-gray-800">
                        {posts.filter(p => p.status === 'resolved').length}
                    </Text>
                    <Text className="text-xs text-gray-400">Thành công</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
            <Stack.Screen options={{ 
                headerShown: true, 
                title: isOwner ? 'Tường của tôi' : 'Trang cá nhân',
                headerShadowVisible: false,
                headerTitleStyle: { fontWeight: 'bold' },
                headerStyle: { backgroundColor: '#fff' }
            }} />

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={renderPostItem}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: 40 }}
                ListEmptyComponent={
                    !isLoading ? (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="document-text-outline" size={60} color="#ddd" />
                            <Text className="text-gray-400 mt-4 text-center px-10">
                                {isOwner ? "Bạn chưa có bài đăng nào. Hãy bắt đầu chia sẻ để giúp đỡ mọi người nhé!" : "Người dùng này chưa có bài đăng công khai nào."}
                            </Text>
                        </View>
                    ) : null
                }
                refreshControl={
                    <RefreshControl 
                        refreshing={false} 
                        onRefresh={onRefresh} 
                        colors={Colors ? [Colors.light.tint] : ['#007AFF']} 
                    />
                }
            />
            
            <LoadingOverlay isLoading={isLoading} />
        </SafeAreaView>
    );
}