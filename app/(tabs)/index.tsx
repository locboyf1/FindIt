import { auth } from "@/configs/firebase-config";
import { Colors } from "@/constants/theme";
import { getPosts } from "@/services/post-service";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Image, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PostCard from '../../components/post-card';

export default function Index() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  const [showMenu, setShowMenu] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const renderFilterButton = (label: string, type: string) => (
    <TouchableOpacity style={[
      styles.filterButton,
      activeFilter === type && styles.filterButtonActive
    ]}
      onPress={() => setActiveFilter(type)}
    >
      <Text style={[
        styles.filterText,
        activeFilter === type && styles.filterTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const fetchPosts = async () => {
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
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoContainer} onPress={handleMenu}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleFilter} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={() => { router.push('../post/create-post') }}>
            <Ionicons name="add" size={24} color="#333" />
          </TouchableOpacity>

        </View>
      </View>

      <View style={styles.mainScreen}>
        {showMenu &&
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.buttonMenu} onPress={handleEditProfile}>
              <Text style={styles.textMenu}>Tài khoản</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.buttonMenu}>
              <Text style={styles.textMenu}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>}

        {showFilter && <View style={styles.filterContainer}>
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
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.light.tint]} />
          }
        />
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  logoContainer: {
    width: 50,
    height: 50,
  },
  logo: {
    resizeMode: 'contain',
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  mainScreen: {
    flex: 1,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    width: '60%',
    borderColor: '#ccc',
    position: 'absolute',
    left: '20%',
    top: 10,
    zIndex: 1,
  }, filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  filterButtonActive: {
    backgroundColor: Colors.light.tint,
  },
  filterText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 20
  },
  menuContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    position: 'absolute',
    width: '50%',
    top: 0,
    left: 0,
    zIndex: 1,
    gap: 1
  },
  buttonMenu: {
    width: '100%',
    paddingVertical: 5,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  textMenu: {
    textAlign: 'center',
    fontFamily: 'Nunito-Bold'
  }

});