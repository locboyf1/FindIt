import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
        <View style={styles.headerIconContainer}>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="add-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        <FlatList contentContainerStyle={{ gap: 20 }}
          data={mockData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemImageContainer}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              </View>
              <View style={{ flex: 1, gap: 5 }}>
                <View style={styles.itemTitleContainer}>
                  <TouchableOpacity style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 16 }}>{item.title}</Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 12 }}>{item.time}</Text>
                    <View style={{ alignItems: 'center', gap: 5 }}>
                      <View style={{ paddingVertical: 5, width: 40, borderRadius: 25, backgroundColor: '#1F8CF9', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 10, color: '#fff' }}>{item.number_unread_message}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, width: '100%', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <TextTicker duration={10000} style={{ fontFamily: 'Nunito-Regular', fontSize: 14, color: '#666' }}>{item.last_message}</TextTicker>
                  </View>
                  <Ionicons name="chatbox-outline" size={24} color="black" />
                </View>
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
  itemImageContainer: { width: 60, height: 60, borderRadius: '100%', overflow: 'hidden', borderColor: '#000', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  itemImage: { width: '100%', height: '100%', borderRadius: 100, resizeMode: 'cover' },
  headerTitle: {
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
    fontSize: 30,
  },
  headerIconContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  itemTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'space-between' }
})