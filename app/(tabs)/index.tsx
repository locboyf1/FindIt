import LoadingOverlay from "@/components/loading-layout";
import { auth } from "@/configs/firebase-config";
import { Colors } from "@/constants/theme";
import { getPosts } from "@/services/post-service";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Image, RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import PostCard from '../../components/post-card';

export default function Index() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  const [showMenu, setShowMenu] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const renderFilterButton = (label: string, type: string) => (
    <TouchableOpacity
      className={`py-2 px-5 rounded-[20px] bg-[#F0F0F0] border border-[#ccc] ${activeFilter === type ? 'bg-[#007AFF]' : ''}`}
      onPress={() => setActiveFilter(type)}
    >
      <Text className={`text-[10px] font-semibold text-[#666] ${activeFilter === type ? 'text-white' : ''}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      if (auth.currentUser) {
        const data = await getPosts();
        setPosts(data);
      }
    } catch (_error) {
      if (auth.currentUser) {
        Alert.alert("Lỗi", "Không thể tải bài viết mới.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchPosts();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleFilter = () => {
    if (showMenu) {
      setShowMenu(false);
    }
    setShowFilter(!showFilter);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleMenu = () => {
    if (showFilter) {
      setShowFilter(false);
    }
    setShowMenu(!showMenu);
  };

  const handleEditProfile = () => {
    router.push('../settings/setting_account');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center pt-[30px] px-5 pb-[10px] border-b border-[#ccc]">
        <TouchableOpacity className="w-[50px] h-[50px]" onPress={handleMenu}>
          <Image source={require('../../assets/images/icon.png')} className="w-full h-full rounded-[15px]" resizeMode="contain" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-5">
          <TouchableOpacity onPress={handleFilter} className="flex-row items-center gap-2.5">
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-2.5" onPress={() => { router.push('../post/create-post') }}>
            <Ionicons name="add" size={24} color="#333" />
          </TouchableOpacity>

        </View>
      </View>

      <View>
        {showMenu &&
          <View className="flex-col justify-between items-center px-5 py-2.5 absolute w-1/2 top-0 left-0 z-10 gap-px">
            <TouchableOpacity className="w-full py-[5px] px-5 bg-white/80 rounded-[10px] border border-[#ccc]" onPress={handleEditProfile}>
              <Text className="text-center font-[Nunito-Bold]">Tài khoản</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} className="w-full py-[5px] px-5 bg-white/80 rounded-[10px] border border-[#ccc]">
              <Text className="text-center font-[Nunito-Bold]">Đăng xuất</Text>
            </TouchableOpacity>
          </View>}

        {showFilter && <View className="flex-row justify-evenly items-center px-2.5 py-2.5 gap-3 bg-white rounded-[20px] border w-[60%] border-[#ccc] absolute left-[20%] z-10">
          {renderFilterButton('Tất cả', 'all')}
          {renderFilterButton('Mất đồ', 'lost')}
          {renderFilterButton('Thấy đồ', 'found')}
        </View>}

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            (activeFilter === 'all' || item.type.toLowerCase() === activeFilter.toLowerCase() || (activeFilter === 'lost' && item.type === 'resolved') || (activeFilter === 'found' && item.type === 'returned')) ? (
              <PostCard item={item} onPress={() => { router.push({ pathname: '../post/[id]/detail-post', params: { id: item.id } }) }} />
            ) : null
          )}
          contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={onRefresh} colors={[Colors.light.tint]} />
          }
        />
      </View>
      <LoadingOverlay isLoading={isLoading} />
    </SafeAreaView>
  )
}

