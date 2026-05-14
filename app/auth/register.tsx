import { AntDesign } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";


import LoadingOverlay from "@/components/loading-layout";
import { Colors } from "@/constants/theme";
import { registerAccount } from "@/services/user-service";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Register() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        setIsLoading(true);
        try {
            await registerAccount({
                email : email,
                password : password,
                confirmPassword: confirmPassword,
                userName: name,
            })
            setIsLoading(false);
            Alert.alert('Thông báo', 'Đăng ký thành công');
            router.replace('/(tabs)');
        } catch (error: any) {
            setIsLoading(false);
            Alert.alert('Lỗi', error.message);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen
                options={{
                    headerShown: false,
                }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}>
                <TouchableWithoutFeedback
                    onPress={Keyboard.dismiss}>
                    <View className="flex-1 justify-center">
                        <View className="w-full items-center justify-center flex-1">
                            <TouchableOpacity onPress={() => router.replace('/auth/login')} className="absolute top-0 left-5">
                                <AntDesign name="left" size={20} color={Colors.light.text} />
                            </TouchableOpacity>

                            <View className="w-[80%] items-center gap-10">
                                <View>
                                    <Text className="text-2xl font-bold text-[#333]">Đăng ký tài khoản</Text>
                                </View>

                                <View className="w-full">
                                    <Text className="font-semibold mb-2 mt-[15px] text-[#333]">Tên</Text>
                                    <TextInput className="h-[50px] border border-[#E0E0E0] rounded-[10px] px-[15px] text-base w-full"
                                        placeholder="John Doe"
                                        placeholderTextColor="#999"
                                        value={name}
                                        onChangeText={setName}
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View className="w-full">
                                    <Text className="font-semibold mb-2 mt-[15px] text-[#333]">Email</Text>
                                    <TextInput className="h-[50px] border border-[#E0E0E0] rounded-[10px] px-[15px] text-base w-full"
                                        placeholder="john.doe@example.com"
                                        placeholderTextColor="#999"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                                <View className="w-full">
                                    <Text className="font-semibold mb-2 mt-[15px] text-[#333]">Mật khẩu</Text>
                                    <TextInput className="h-[50px] border border-[#E0E0E0] rounded-[10px] px-[15px] text-base w-full"
                                        placeholder="********"
                                        placeholderTextColor="#999"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>

                                <View className="w-full">
                                    <Text className="font-semibold mb-2 mt-[15px] text-[#333]">Xác nhận mật khẩu</Text>
                                    <TextInput className="h-[50px] border border-[#E0E0E0] rounded-[10px] px-[15px] text-base w-full"
                                        placeholder="********"
                                        placeholderTextColor="#999"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry
                                    />
                                </View>

                                <TouchableOpacity onPress={handleRegister} className="h-[50px] w-full bg-[#007AFF] rounded-[10px] items-center justify-center border border-[#999]"
                                    disabled={isLoading}
                                >
                                    <Text className="text-white text-base font-medium">Đăng ký</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>

                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
            <LoadingOverlay isLoading={isLoading} />
        </SafeAreaView >
    );
}

