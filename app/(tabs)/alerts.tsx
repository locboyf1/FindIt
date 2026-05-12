import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <FlatList contentContainerStyle={{ gap: 20 }}
          data={mockData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemImageContainer}>
                {item.image ? <Image source={{ uri: item.image }} style={styles.itemImage} /> : <Ionicons name="notifications-outline" size={24} color="black" />}
              </View>
              <View style={{ flex: 1, gap: 5 }}>
                <View style={styles.itemTitleContainer}>
                  <TouchableOpacity style={{ flex: 1 }}>
                    <TextTicker style={{ fontFamily: 'Nunito-Bold', fontSize: 16 }} duration={10000}>{item.title}</TextTicker>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.itemBarIconContainer}>
                    <Ionicons name="ellipsis-vertical-outline" size={20} color="black" />
                  </TouchableOpacity>
                </View>
                <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 12 }}>{item.time}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemImageContainer: { width: 60, height: 60, padding: 5, borderRadius: '100%', overflow: 'hidden', borderColor: '#000', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  itemImage: { width: '100%', height: '100%', borderRadius: 100, resizeMode: 'cover' },
  itemBarIconContainer: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
    fontSize: 30,
  },
  itemTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'space-between' }
})