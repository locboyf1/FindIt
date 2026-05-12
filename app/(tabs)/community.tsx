import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>Cộng đồng</Text>

      <TouchableOpacity onPress={() => { router.replace('/auth/login') }} style={{ backgroundColor: '#fa675fff', marginTop: 20, padding: 10, borderRadius: 10 }}>
        <Text style={{ color: '#fff' }}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  )
}